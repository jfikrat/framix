import type { ServerWebSocket } from "bun";
import { renderVideo, type RenderOptions, type ProgressInfo, type RenderResult } from "./render";

// Job types
interface Job {
  status: "pending" | "rendering" | "completed" | "failed";
  progress: ProgressInfo | null;
  result: RenderResult | null;
  error: string | null;
  createdAt: number;
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
  | { type: "error"; jobId: string; error: string };

// Job storage
const jobs = new Map<string, Job>();

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
  const job = jobs.get(jobId);
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
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// Generate UUID
function generateId(): string {
  return crypto.randomUUID();
}

// Serve static files from output directory
async function serveStaticFile(path: string): Promise<Response> {
  const filePath = `./output${path}`;
  const file = Bun.file(filePath);

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

// Start render job
async function startRenderJob(jobId: string, templateId: string): Promise<void> {
  const job = jobs.get(jobId);
  if (!job) return;

  job.status = "rendering";

  const options: RenderOptions = {
    templateId,
    onProgress: (info: ProgressInfo) => {
      const currentJob = jobs.get(jobId);
      if (currentJob) {
        currentJob.progress = info;
        // Broadcast progress to WebSocket subscribers
        broadcastToJob(jobId, { type: "progress", jobId, ...info });
      }
    },
  };

  try {
    const result = await renderVideo(options);
    const currentJob = jobs.get(jobId);
    if (currentJob) {
      currentJob.status = result.success ? "completed" : "failed";
      currentJob.result = result;
      // Broadcast completion to WebSocket subscribers
      if (result.success) {
        broadcastToJob(jobId, { type: "complete", jobId, result });
      } else {
        broadcastToJob(jobId, { type: "error", jobId, error: result.error || "Render failed" });
      }
    }
  } catch (error) {
    const currentJob = jobs.get(jobId);
    if (currentJob) {
      currentJob.status = "failed";
      currentJob.error = error instanceof Error ? error.message : "Unknown error";
      // Broadcast error to WebSocket subscribers
      broadcastToJob(jobId, { type: "error", jobId, error: currentJob.error });
    }
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

    // POST /api/render - Start a render job
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

        const jobId = generateId();

        // Create job entry
        jobs.set(jobId, {
          status: "pending",
          progress: null,
          result: null,
          error: null,
          createdAt: Date.now(),
        });

        // Start render in background (don't await)
        startRenderJob(jobId, templateId);

        return Response.json(
          { jobId, status: "pending" },
          { status: 202, headers: corsHeaders }
        );
      } catch (error) {
        return Response.json(
          { error: "Invalid request body" },
          { status: 400, headers: corsHeaders }
        );
      }
    }

    // GET /api/jobs/:id - Get job status
    if (req.method === "GET" && pathname.startsWith("/api/jobs/")) {
      const jobId = pathname.replace("/api/jobs/", "");
      const job = jobs.get(jobId);

      if (!job) {
        return Response.json(
          { error: "Job not found" },
          { status: 404, headers: corsHeaders }
        );
      }

      return Response.json(
        {
          jobId,
          status: job.status,
          progress: job.progress,
          result: job.result,
          error: job.error,
        },
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

console.log(`Server running at http://localhost:${server.port}`);
console.log(`WebSocket available at ws://localhost:${server.port}/ws`);
