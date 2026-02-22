#!/usr/bin/env bun
import * as readline from 'node:readline';
import { join, resolve } from 'node:path';
import { readdir } from 'node:fs/promises';
import { listJobs } from './src/store';
import puppeteer from 'puppeteer';

// Configuration
const SERVER_URL = 'http://localhost:3001';
const TEMPLATES_DIR = resolve('./src/templates');
const OUTPUT_DIR = 'output';
const MANIFEST_PATH = resolve('./src/templates/manifest.json');

// Types
interface JsonRpcRequest {
  jsonrpc: string;
  id?: number | string;
  method: string;
  params?: any;
}

interface McpTool {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, any>;
    required?: string[];
  };
}

// Tools Definition
const TOOLS: McpTool[] = [
  {
    name: "list_templates",
    description: "Scan the source code for available video templates and return their IDs and names.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "get_render_status",
    description: "Get the status of a specific render job from the Framix server.",
    inputSchema: {
      type: "object",
      properties: {
        jobId: { type: "string", description: "The ID of the job to check" },
      },
      required: ["jobId"],
    },
  },
  {
    name: "render_template",
    description: "Trigger a new render job for a specific template. Requires render server running (bun run server).",
    inputSchema: {
      type: "object",
      properties: {
        templateId: { type: "string", description: "The ID of the template to render (kebab-case slug)" },
      },
      required: ["templateId"],
    },
  },
  {
    name: "render_batch",
    description: "Trigger multiple render jobs at once.",
    inputSchema: {
      type: "object",
      properties: {
        templateIds: {
          type: "array",
          items: { type: "string" },
          description: "List of template IDs to render",
        },
      },
      required: ["templateIds"],
    },
  },
  {
    name: "get_queue_status",
    description: "Check the current status of the render queue.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "cancel_render",
    description: "Cancel a running or queued render job.",
    inputSchema: {
      type: "object",
      properties: {
        jobId: { type: "string", description: "The ID of the job to cancel" },
      },
      required: ["jobId"],
    },
  },
  {
    name: "list_recent_jobs",
    description: "List the most recent render jobs from the local database.",
    inputSchema: {
      type: "object",
      properties: {
        limit: { type: "number", description: "Number of jobs to return (default 10)" },
      },
    },
  },
  {
    name: "read_template_source",
    description: "Read the source code of a template file. Useful for understanding a template before modifying it.",
    inputSchema: {
      type: "object",
      properties: {
        templateId: { type: "string", description: "The ID of the template to read" },
      },
      required: ["templateId"],
    },
  },
  {
    name: "get_output_file",
    description: "Check if a rendered output file exists and get its path and URL.",
    inputSchema: {
      type: "object",
      properties: {
        filename: { type: "string", description: "The filename to check (e.g., metrics-reel.mp4)" },
      },
      required: ["filename"],
    },
  },
  {
    name: "screenshot_frame",
    description: "Take a Puppeteer screenshot of specific frame(s) and return the images directly. Use this to visually validate template appearance during design — much faster than a full render. Requires dev server running (bun run dev).",
    inputSchema: {
      type: "object",
      properties: {
        templateId: { type: "string", description: "Template ID (kebab-case slug)" },
        frames: {
          type: "array",
          items: { type: "number" },
          description: "Frame numbers to capture. Default: [0, 90, 180, 270]",
        },
      },
      required: ["templateId"],
    },
  },
];

// ─── Manifest Loader ─────────────────────────────────

interface ManifestEntry {
  id: string;
  name: string;
  category?: string;
  color?: string;
  brand?: string;
  file: string;
  hasInputs: boolean;
}

async function loadManifest(): Promise<ManifestEntry[]> {
  try {
    const raw = await Bun.file(MANIFEST_PATH).text();
    return JSON.parse(raw).templates as ManifestEntry[];
  } catch {
    throw new Error('Manifest not found. Run: bun run gen-manifest');
  }
}

async function findTemplateEntry(templateId: string): Promise<ManifestEntry | null> {
  const templates = await loadManifest();
  return templates.find(t => t.id === templateId) ?? null;
}

// ─── Content Types ────────────────────────────────────

type TextContent = { type: 'text'; text: string };
type ImageContent = { type: 'image'; data: string; mimeType: string };
type ContentBlock = TextContent | ImageContent;

// Tools that return raw content blocks (not wrapped in text)
type RawResult = { __raw: true; content: ContentBlock[] };

function isRaw(v: unknown): v is RawResult {
  return typeof v === 'object' && v !== null && (v as any).__raw === true;
}

const DEV_SERVER_URL = 'http://localhost:4200';

// ─── Tool Handlers ────────────────────────────────────

async function handleToolCall(name: string, args: any): Promise<unknown> {
  switch (name) {
    case 'list_templates':
      return await loadManifest();

    case 'get_render_status': {
      const response = await fetch(`${SERVER_URL}/api/jobs/${args.jobId}`);
      if (!response.ok) throw new Error(`Server responded with ${response.status}. Is the server running? (bun run server)`);
      return await response.json();
    }

    case 'render_template': {
      const response = await fetch(`${SERVER_URL}/api/render`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId: args.templateId }),
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Failed to start render (${response.status}): ${text}. Is the server running? Start with: bun run server`);
      }
      return await response.json();
    }

    case 'render_batch': {
      const response = await fetch(`${SERVER_URL}/api/render/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateIds: args.templateIds }),
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Failed to start batch render (${response.status}): ${text}`);
      }
      return await response.json();
    }

    case 'get_queue_status': {
      const response = await fetch(`${SERVER_URL}/api/queue`);
      if (!response.ok) throw new Error(`Failed to get queue status: ${response.statusText}`);
      return await response.json();
    }

    case 'cancel_render': {
      const response = await fetch(`${SERVER_URL}/api/jobs/${args.jobId}`, { method: 'DELETE' });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Failed to cancel job: ${text}`);
      }
      return await response.json();
    }

    case 'list_recent_jobs': {
      const limit = typeof args.limit === 'number' ? args.limit : 10;
      return listJobs(limit);
    }

    case 'read_template_source': {
      const entry = await findTemplateEntry(args.templateId);
      if (!entry) throw new Error(`Template not found with ID: "${args.templateId}". Use list_templates to see available templates.`);
      const content = await Bun.file(join(TEMPLATES_DIR, entry.file)).text();
      return { file: entry.file, content };
    }

    case 'get_output_file': {
      const { filename } = args;
      if (!filename || !/^[a-zA-Z0-9._-]+$/.test(filename)) {
        throw new Error('Invalid filename. Only alphanumeric, dots, underscores, and hyphens are allowed.');
      }
      const filePath = join(OUTPUT_DIR, filename);
      const file = Bun.file(filePath);
      const exists = await file.exists();
      return {
        path: filePath,
        exists,
        size: exists ? file.size : 0,
        url: exists ? `${SERVER_URL}/output/${filename}` : null,
      };
    }

    case 'screenshot_frame': {
      const { templateId, frames: requestedFrames } = args as { templateId: string; frames?: number[] };
      const frames = Array.isArray(requestedFrames) && requestedFrames.length > 0
        ? requestedFrames
        : [0, 90, 180, 270];

      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
      });

      try {
        const page = await browser.newPage();
        await page.goto(`${DEV_SERVER_URL}?render=${templateId}`, {
          waitUntil: 'networkidle0',
          timeout: 30000,
        });
        await page.waitForFunction(() => (window as any).__renderReady === true, { timeout: 10000 });

        const config: { width: number; height: number } = await page.evaluate(
          () => (window as any).__config
        );
        await page.setViewport({ width: config.width, height: config.height, deviceScaleFactor: 1 });

        const content: ContentBlock[] = [];
        content.push({ type: 'text', text: `Template: ${templateId} (${config.width}×${config.height})` });

        for (const f of frames) {
          await page.evaluate((n) => (window as any).__setFrame(n), f);
          await new Promise((r) => setTimeout(r, 20));

          const buffer = await page.screenshot({ type: 'jpeg', quality: 90 }) as Buffer;
          const base64 = buffer.toString('base64');

          content.push({ type: 'text', text: `Frame ${f}:` });
          content.push({ type: 'image', data: base64, mimeType: 'image/jpeg' });
        }

        return { __raw: true, content } as RawResult;
      } finally {
        await browser.close();
      }
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

// ─── JSON-RPC Loop ────────────────────────────────────

const rl = readline.createInterface({ input: process.stdin, terminal: false });

rl.on('line', async (line) => {
  if (!line.trim()) return;

  let request: JsonRpcRequest;
  try {
    request = JSON.parse(line);
  } catch {
    console.error('Failed to parse JSON-RPC message:', line);
    return;
  }

  const respond = (payload: object) => {
    process.stdout.write(JSON.stringify(payload) + '\n');
  };

  try {
    switch (request.method) {
      case 'initialize':
        respond({
          jsonrpc: '2.0',
          id: request.id,
          result: {
            protocolVersion: '2024-11-05',
            serverInfo: { name: 'framix-mcp', version: '1.0.0' },
            capabilities: { tools: {} },
          },
        });
        break;

      case 'notifications/initialized':
        // No response for notifications
        break;

      case 'tools/list':
        respond({
          jsonrpc: '2.0',
          id: request.id,
          result: { tools: TOOLS },
        });
        break;

      case 'tools/call': {
        const { name, arguments: args } = request.params as { name: string; arguments: any };
        try {
          const result = await handleToolCall(name, args ?? {});
          respond({
            jsonrpc: '2.0',
            id: request.id,
            result: {
              content: isRaw(result)
                ? result.content
                : [{ type: 'text', text: JSON.stringify(result, null, 2) }],
              isError: false,
            },
          });
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : String(error);
          respond({
            jsonrpc: '2.0',
            id: request.id,
            result: {
              content: [{ type: 'text', text: `Error: ${message}` }],
              isError: true,
            },
          });
        }
        break;
      }

      default:
        if (request.id !== undefined) {
          respond({
            jsonrpc: '2.0',
            id: request.id,
            error: { code: -32601, message: `Method not found: ${request.method}` },
          });
        }
    }
  } catch (error) {
    console.error('Unhandled error processing request:', error);
  }
});

console.error('Framix MCP Server ready. Listening on stdin...');
