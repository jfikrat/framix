import type { ServerWebSocket } from "bun";
import { resolve, join } from "path";
import { renderVideo, type RenderOptions, type ProgressInfo, type RenderResult } from "./render";
import { createJob, getJob, updateJob, getQueuedJobs, getActiveJobs } from "./src/store";

// templateId validation — must be a safe slug (mirrors render.ts)
const VALID_TEMPLATE_ID_RE = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;
function isValidTemplateId(id: string): boolean {
  return VALID_TEMPLATE_ID_RE.test(id) && id.length <= 64;
}

// ─── Template Manifest ───────────────────────────────
const MANIFEST_PATH = "./src/templates/manifest.json";
let _knownTemplateIds: Set<string> | null = null;

function getKnownTemplateIds(): Set<string> {
  if (_knownTemplateIds) return _knownTemplateIds;
  try {
    const manifest = JSON.parse(require("fs").readFileSync(MANIFEST_PATH, "utf8"));
    _knownTemplateIds = new Set(manifest.templates.map((t: { id: string }) => t.id));
  } catch {
    _knownTemplateIds = new Set(); // manifest not generated yet — skip check
  }
  return _knownTemplateIds;
}

function templateExists(id: string): boolean {
  const ids = getKnownTemplateIds();
  return ids.size === 0 || ids.has(id); // if manifest empty/missing, allow all
}

// WebSocket data type
interface WebSocketData {
  jobId: string | null;
}

// WebSocket message types
type WSClientMessage =
  | { type: "subscribe"; jobId: string }
  | { type: "unsubscribe"; jobId: string };

type WSServerMessage =
  | { type: "subscribed"; jobId: string }
  | { type: "progress"; jobId: string } & ProgressInfo
  | { type: "complete"; jobId: string; result: RenderResult }
  | { type: "error"; jobId: string; error: string }
  | { type: "queued"; jobId: string; position: number }
  | { type: "cancelled"; jobId: string };

// ─── Render Queue ────────────────────────────────────
const MAX_CONCURRENT_JOBS = 1;
let activeJobCount = 0;
const queue: string[] = []; // jobId FIFO queue

// ─── Auto-Shutdown (idle timer) ─────────────────────
const IDLE_TIMEOUT_MS = 60_000;
let idleTimer: ReturnType<typeof setTimeout> | null = null;

function startIdleTimer(): void {
  cancelIdleTimer();
  if (activeJobCount > 0 || queue.length > 0) return;

  console.log(`[auto-shutdown] No active jobs. Shutting down in ${IDLE_TIMEOUT_MS / 1000}s...`);
  idleTimer = setTimeout(() => {
    console.log("[auto-shutdown] Idle timeout reached. Shutting down...");
    for (const [, clients] of wsClients) {
      for (const client of clients) {
        try { client.close(); } catch {}
      }
    }
    wsClients.clear();
    process.exit(0);
  }, IDLE_TIMEOUT_MS);
}

function cancelIdleTimer(): void {
  if (idleTimer) {
    clearTimeout(idleTimer);
    idleTimer = null;
    console.log("[auto-shutdown] Idle timer cancelled");
  }
}

// WebSocket client tracking: jobId -> Set of connected clients
const wsClients = new Map<string, Set<ServerWebSocket<WebSocketData>>>();

// Broadcast message to all subscribers of a job
function broadcastToJob(jobId: string, message: WSServerMessage): void {
  const clients = wsClients.get(jobId);
  if (!clients) return;

  const messageStr = JSON.stringify(message);
  for (const client of clients) {
    try {
      client.send(messageStr);
    } catch {
      // Client disconnected, will be cleaned up on close
    }
  }
}

// Subscribe a client to a job
function subscribeClient(ws: ServerWebSocket<WebSocketData>, jobId: string): void {
  // Unsubscribe from previous job if any
  if (ws.data.jobId) {
    unsubscribeClient(ws, ws.data.jobId);
  }

  // Get or create client set for this job
  let clients = wsClients.get(jobId);
  if (!clients) {
    clients = new Set();
    wsClients.set(jobId, clients);
  }

  clients.add(ws);
  ws.data.jobId = jobId;

  // Send confirmation
  ws.send(JSON.stringify({ type: "subscribed", jobId }));

  // Send current state if job exists
  const job = getJob(jobId);
  if (job) {
    if (job.progress) {
      ws.send(JSON.stringify({ type: "progress", jobId, ...job.progress }));
    }
    if (job.status === "completed" && job.result) {
      ws.send(JSON.stringify({ type: "complete", jobId, result: job.result }));
    }
    if (job.status === "failed" && job.error) {
      ws.send(JSON.stringify({ type: "error", jobId, error: job.error }));
    }
  }
}

// Unsubscribe a client from a job
function unsubscribeClient(ws: ServerWebSocket<WebSocketData>, jobId: string): void {
  const clients = wsClients.get(jobId);
  if (clients) {
    clients.delete(ws);
    if (clients.size === 0) {
      wsClients.delete(jobId);
    }
  }
  if (ws.data.jobId === jobId) {
    ws.data.jobId = null;
  }
}

// CORS headers for localhost dev
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// Generate UUID
function generateId(): string {
  return crypto.randomUUID();
}

// Serve static files from output directory
async function serveStaticFile(path: string): Promise<Response> {
  const outputRoot = resolve("./output");
  const requestedPath = resolve(join(outputRoot, path));

  // Reject if resolved path escapes the output root (path traversal guard)
  if (!requestedPath.startsWith(outputRoot + "/") && requestedPath !== outputRoot) {
    return new Response("Forbidden", { status: 403, headers: corsHeaders });
  }

  const file = Bun.file(requestedPath);

  if (await file.exists()) {
    return new Response(file, {
      headers: {
        ...corsHeaders,
        "Content-Type": file.type || "application/octet-stream",
      },
    });
  }

  return new Response("Not Found", { status: 404, headers: corsHeaders });
}

// Enqueue a job and process if slot available
function enqueueJob(jobId: string): void {
  cancelIdleTimer();

  const job = getJob(jobId);
  if (!job) return;

  updateJob(jobId, { status: "queued" });
  queue.push(jobId);

  const position = queue.indexOf(jobId);
  broadcastToJob(jobId, { type: "queued", jobId, position });

  processQueue();
}

// Process next job in queue if a slot is free
function processQueue(): void {
  while (activeJobCount < MAX_CONCURRENT_JOBS && queue.length > 0) {
    const nextId = queue.shift();
    if (!nextId) break;

    const job = getJob(nextId);
    if (!job || job.status === "cancelled") continue;

    activeJobCount++;
    startRenderJob(nextId, job.templateId).finally(() => {
      activeJobCount--;
      processQueue();
      startIdleTimer();
    });
  }
}

// Start render job
async function startRenderJob(jobId: string, templateId: string): Promise<void> {
  const job = getJob(jobId);
  if (!job || job.status === "cancelled") return;

  updateJob(jobId, { status: "rendering" });

  const options: RenderOptions = {
    templateId,
    onProgress: (info: ProgressInfo) => {
      updateJob(jobId, { progress: info });
      broadcastToJob(jobId, { type: "progress", jobId, ...info });
    },
  };

  try {
    const result = await renderVideo(options);
    if (result.success) {
      updateJob(jobId, { status: "completed", result });
      broadcastToJob(jobId, { type: "complete", jobId, result });
    } else {
      updateJob(jobId, { status: "failed", result, error: result.error || "Render failed" });
      broadcastToJob(jobId, { type: "error", jobId, error: result.error || "Render failed" });
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    updateJob(jobId, { status: "failed", error: errorMsg });
    broadcastToJob(jobId, { type: "error", jobId, error: errorMsg });
  }
}

const server = Bun.serve<WebSocketData>({
  port: 3001,

  async fetch(req, server) {
    const url = new URL(req.url);
    const { pathname } = url;

    // Handle CORS preflight
    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // WebSocket upgrade: GET /ws or GET /ws?jobId=xxx
    if (pathname === "/ws") {
      const jobId = url.searchParams.get("jobId");
      const upgraded = server.upgrade(req, {
        data: { jobId: jobId || null },
      });
      if (upgraded) {
        return undefined;
      }
      return new Response("WebSocket upgrade failed", { status: 400, headers: corsHeaders });
    }

    // POST /api/render - Enqueue a single render job
    if (req.method === "POST" && pathname === "/api/render") {
      try {
        const body = await req.json() as { templateId?: string };
        const { templateId } = body;

        if (!templateId) {
          return Response.json(
            { error: "templateId is required" },
            { status: 400, headers: corsHeaders }
          );
        }

        if (!isValidTemplateId(templateId)) {
          return Response.json(
            { error: "Invalid templateId format" },
            { status: 400, headers: corsHeaders }
          );
        }

        if (!templateExists(templateId)) {
          return Response.json(
            { error: `Template not found: "${templateId}". Use GET /api/templates to list available templates.` },
            { status: 404, headers: corsHeaders }
          );
        }

        const jobId = generateId();
        createJob(jobId, templateId);
        enqueueJob(jobId);

        // Job may already be dequeued and processing (immediately started)
        const queuePosition = queue.indexOf(jobId);
        return Response.json(
          {
            jobId,
            status: queuePosition >= 0 ? "queued" : "processing",
            position: Math.max(0, queuePosition),
          },
          { status: 202, headers: corsHeaders }
        );
      } catch {
        return Response.json(
          { error: "Invalid request body" },
          { status: 400, headers: corsHeaders }
        );
      }
    }

    // POST /api/render/batch - Enqueue multiple render jobs
    if (req.method === "POST" && pathname === "/api/render/batch") {
      try {
        const body = await req.json() as { templateIds?: string[] };
        const { templateIds } = body;

        if (!templateIds || !Array.isArray(templateIds) || templateIds.length === 0) {
          return Response.json(
            { error: "templateIds array is required" },
            { status: 400, headers: corsHeaders }
          );
        }

        // Validate all templateIds up-front before creating any jobs
        const invalidId = templateIds.find((id) => !isValidTemplateId(id));
        if (invalidId) {
          return Response.json(
            { error: `Invalid templateId format: "${invalidId}"` },
            { status: 400, headers: corsHeaders }
          );
        }

        const missingId = templateIds.find((id) => !templateExists(id));
        if (missingId) {
          return Response.json(
            { error: `Template not found: "${missingId}"` },
            { status: 404, headers: corsHeaders }
          );
        }

        const jobIds: { jobId: string; templateId: string; status: string; position: number }[] = [];

        for (const templateId of templateIds) {
          const jobId = generateId();
          createJob(jobId, templateId);
          enqueueJob(jobId);
          // Job may already be dequeued and processing (immediately started)
          const queuePosition = queue.indexOf(jobId);
          jobIds.push({
            jobId,
            templateId,
            status: queuePosition >= 0 ? "queued" : "processing",
            position: Math.max(0, queuePosition),
          });
        }

        return Response.json(
          { jobs: jobIds, total: jobIds.length },
          { status: 202, headers: corsHeaders }
        );
      } catch {
        return Response.json(
          { error: "Invalid request body" },
          { status: 400, headers: corsHeaders }
        );
      }
    }

    // GET /api/templates - Template manifest
    if (req.method === "GET" && pathname === "/api/templates") {
      try {
        const manifest = JSON.parse(require("fs").readFileSync(MANIFEST_PATH, "utf8"));
        return Response.json(manifest, { headers: corsHeaders });
      } catch {
        return Response.json({ error: "Manifest not found. Run: bun run gen-manifest" }, { status: 503, headers: corsHeaders });
      }
    }

    // GET /api/queue - Queue status
    if (req.method === "GET" && pathname === "/api/queue") {
      const pending = queue.map((jobId, position) => {
        const job = getJob(jobId);
        return {
          jobId,
          templateId: job?.templateId,
          status: job?.status,
          position,
        };
      });

      const active = getActiveJobs().map((job) => ({
        jobId: job.id,
        templateId: job.templateId,
        progress: job.progress,
      }));

      return Response.json(
        {
          active,
          activeCount: activeJobCount,
          maxConcurrent: MAX_CONCURRENT_JOBS,
          queued: pending,
          queueLength: queue.length,
        },
        { headers: corsHeaders }
      );
    }

    // GET /api/jobs/:id - Get job status
    if (req.method === "GET" && pathname.startsWith("/api/jobs/")) {
      const jobId = pathname.replace("/api/jobs/", "");
      const job = getJob(jobId);

      if (!job) {
        return Response.json(
          { error: "Job not found" },
          { status: 404, headers: corsHeaders }
        );
      }

      return Response.json(
        {
          jobId,
          templateId: job.templateId,
          status: job.status,
          progress: job.progress,
          result: job.result,
          error: job.error,
        },
        { headers: corsHeaders }
      );
    }

    // DELETE /api/jobs/:id - Cancel a queued job
    if (req.method === "DELETE" && pathname.startsWith("/api/jobs/")) {
      const jobId = pathname.replace("/api/jobs/", "");
      const job = getJob(jobId);

      if (!job) {
        return Response.json(
          { error: "Job not found" },
          { status: 404, headers: corsHeaders }
        );
      }

      if (job.status === "rendering") {
        return Response.json(
          { error: "Cannot cancel a job that is currently rendering" },
          { status: 409, headers: corsHeaders }
        );
      }

      if (job.status === "completed" || job.status === "failed") {
        return Response.json(
          { error: "Job already finished" },
          { status: 409, headers: corsHeaders }
        );
      }

      // Remove from queue
      const queueIdx = queue.indexOf(jobId);
      if (queueIdx !== -1) {
        queue.splice(queueIdx, 1);
      }

      updateJob(jobId, { status: "cancelled" });
      broadcastToJob(jobId, { type: "cancelled", jobId });

      return Response.json(
        { jobId, status: "cancelled" },
        { headers: corsHeaders }
      );
    }

    // GET /health - Health check for auto-launcher
    if (req.method === "GET" && pathname === "/health") {
      return Response.json(
        { status: "ok", activeJobs: activeJobCount, queuedJobs: queue.length },
        { headers: corsHeaders }
      );
    }

    // Static file serving: /output/*
    if (req.method === "GET" && pathname.startsWith("/output/")) {
      const filePath = pathname.replace("/output", "");
      return serveStaticFile(filePath);
    }

    // 404 for unknown routes
    return new Response("Not Found", { status: 404, headers: corsHeaders });
  },

  websocket: {
    open(ws) {
      // If jobId was provided in query string, auto-subscribe
      if (ws.data.jobId) {
        subscribeClient(ws, ws.data.jobId);
      }
    },

    message(ws, message) {
      try {
        const data = JSON.parse(message.toString()) as WSClientMessage;

        switch (data.type) {
          case "subscribe":
            if (data.jobId) {
              subscribeClient(ws, data.jobId);
            }
            break;
          case "unsubscribe":
            if (data.jobId) {
              unsubscribeClient(ws, data.jobId);
            }
            break;
        }
      } catch {
        // Invalid JSON, ignore
      }
    },

    close(ws) {
      // Clean up subscription
      if (ws.data.jobId) {
        unsubscribeClient(ws, ws.data.jobId);
      }
    },
  },
});

// Recover queued jobs from previous session
const recoveredJobs = getQueuedJobs();
if (recoveredJobs.length > 0) {
  console.log(`Recovering ${recoveredJobs.length} queued job(s) from previous session...`);
  for (const job of recoveredJobs) {
    queue.push(job.id);
  }
  processQueue();
}

// Reset any jobs stuck in "rendering" state (server crashed mid-render)
const stuckJobs = getActiveJobs();
for (const job of stuckJobs) {
  console.log(`Resetting stuck rendering job: ${job.id}`);
  updateJob(job.id, { status: "queued" });
  queue.push(job.id);
}
if (stuckJobs.length > 0) {
  processQueue();
}

console.log(`Server running at http://localhost:${server.port}`);
console.log(`WebSocket available at ws://localhost:${server.port}/ws`);

// Start idle timer on boot (if no recovered jobs, auto-shutdown after 60s)
startIdleTimer();
