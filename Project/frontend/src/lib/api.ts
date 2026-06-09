/**
 * api.ts
 * Central API service layer.
 * All fetch calls use VITE_API_BASE env variable – never hardcode localhost.
 */

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

// ── Utility ──────────────────────────────────────────────────────────────────
async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as any).detail || `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ── Health ────────────────────────────────────────────────────────────────────
export async function checkHealth(): Promise<{ status: string; message: string }> {
  const res = await fetch(`${API_BASE}/health`);
  return handleResponse(res);
}

// ── Schema parse ──────────────────────────────────────────────────────────────
export interface ParsedTable {
  name: string;
  columns: { name: string; type: string; pk: boolean; fk: string | null }[];
  foreign_keys: string[];
}

export interface ParseSchemaResponse {
  success: boolean;
  tables: ParsedTable[];
  generation_order: string[];
  summary: string;
}

export async function parseSchema(ddl: string): Promise<ParseSchemaResponse> {
  const res = await fetch(`${API_BASE}/api/parse`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ddl }),
  });
  return handleResponse(res);
}

// ── AI explain ────────────────────────────────────────────────────────────────
export interface ExplainSchemaResponse {
  success: boolean;
  explanation: string;
}

export async function explainSchema(ddl: string): Promise<ExplainSchemaResponse> {
  const res = await fetch(`${API_BASE}/api/ai/explain-schema`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ddl }),
  });
  return handleResponse(res);
}

// ── Generate data ─────────────────────────────────────────────────────────────
export interface GenerateDataResponse {
  success: boolean;
  generation_order: string[];
  all_data: Record<string, Record<string, unknown>[]>;
  passed: boolean;
  issues: string[];
  agent_log: string;
}

export async function generateData(ddl: string, numRows: number): Promise<GenerateDataResponse> {
  const res = await fetch(`${API_BASE}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ddl, num_rows: numRows }),
  });
  return handleResponse(res);
}

// ── Download helpers ──────────────────────────────────────────────────────────
export function getDownloadUrl(format: 'sql' | 'csv' | 'report'): string {
  return `${API_BASE}/api/download/${format}`;
}
