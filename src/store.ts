import { Database } from "bun:sqlite";
import { mkdirSync, existsSync } from "fs";

// Ensure data directory exists
const DATA_DIR = "./data";
if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true });
}

const db = new Database(`${DATA_DIR}/framix.db`);

// WAL mode for better concurrent reads
db.run("PRAGMA journal_mode = WAL");

// Create jobs table
db.run(`CREATE TABLE IF NOT EXISTS jobs (
  id TEXT PRIMARY KEY,
  template_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  progress TEXT,
  result TEXT,
  error TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
)`);

export interface StoredJob {
  id: string;
  templateId: string;
  status: string;
  progress: any | null;
  result: any | null;
  error: string | null;
  createdAt: number;
  updatedAt: number;
}

// Prepared statements
const insertStmt = db.prepare(
  "INSERT INTO jobs (id, template_id, status, progress, result, error, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
);
const getStmt = db.prepare("SELECT * FROM jobs WHERE id = ?");
const updateStmt = db.prepare(
  "UPDATE jobs SET status = ?, progress = ?, result = ?, error = ?, updated_at = ? WHERE id = ?"
);
const listStmt = db.prepare("SELECT * FROM jobs ORDER BY created_at DESC LIMIT ?");
const listByStatusStmt = db.prepare("SELECT * FROM jobs WHERE status = ? ORDER BY created_at ASC LIMIT ?");
const listActiveStmt = db.prepare("SELECT * FROM jobs WHERE status = 'rendering'");

function rowToJob(row: any): StoredJob | null {
  if (!row) return null;
  return {
    id: row.id,
    templateId: row.template_id,
    status: row.status,
    progress: row.progress ? JSON.parse(row.progress) : null,
    result: row.result ? JSON.parse(row.result) : null,
    error: row.error,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function createJob(id: string, templateId: string): StoredJob {
  const now = Date.now();
  insertStmt.run(id, templateId, "pending", null, null, null, now, now);
  return { id, templateId, status: "pending", progress: null, result: null, error: null, createdAt: now, updatedAt: now };
}

export function getJob(id: string): StoredJob | null {
  return rowToJob(getStmt.get(id));
}

export function updateJob(id: string, updates: { status?: string; progress?: any; result?: any; error?: string | null }): void {
  const current = getStmt.get(id) as any;
  if (!current) return;

  const status = updates.status ?? current.status;
  const progress = updates.progress !== undefined ? JSON.stringify(updates.progress) : current.progress;
  const result = updates.result !== undefined ? JSON.stringify(updates.result) : current.result;
  const error = updates.error !== undefined ? updates.error : current.error;

  updateStmt.run(status, progress, result, error, Date.now(), id);
}

export function listJobs(limit: number = 50): StoredJob[] {
  return (listStmt.all(limit) as any[]).map(rowToJob).filter(Boolean) as StoredJob[];
}

export function getQueuedJobs(): StoredJob[] {
  return (listByStatusStmt.all("queued", 100) as any[]).map(rowToJob).filter(Boolean) as StoredJob[];
}

export function getActiveJobs(): StoredJob[] {
  return (listActiveStmt.all() as any[]).map(rowToJob).filter(Boolean) as StoredJob[];
}
