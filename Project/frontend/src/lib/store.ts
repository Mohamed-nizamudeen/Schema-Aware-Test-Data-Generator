import { create } from 'zustand';
import type { ParsedTable } from './api';

interface StoreState {
  /** Raw DDL string the user uploaded or pasted */
  ddl: string;
  setDdl: (ddl: string) => void;

  /** Parsed table list returned by /api/parse */
  parsedSchema: ParsedTable[] | null;
  setParsedSchema: (schema: ParsedTable[] | null) => void;

  /** Table generation order returned by /api/parse */
  generationOrder: string[];
  setGenerationOrder: (order: string[]) => void;

  /** Generated data rows keyed by table name, from /api/generate */
  generatedData: Record<string, Record<string, unknown>[]> | null;
  setGeneratedData: (data: Record<string, Record<string, unknown>[]> | null) => void;

  /** Full text log from the AI agent */
  agentLog: string;
  setAgentLog: (log: string) => void;

  /** Validation issue strings */
  validationIssues: string[];
  setValidationIssues: (issues: string[]) => void;

  /** Whether all validations passed */
  validationPassed: boolean;
  setValidationPassed: (passed: boolean) => void;

  /** Schema summary text from /api/parse */
  schemaSummary: string;
  setSchemaSummary: (summary: string) => void;

  /** Backend connection status */
  backendStatus: 'unknown' | 'connected' | 'disconnected';
  setBackendStatus: (status: 'unknown' | 'connected' | 'disconnected') => void;
}

export const useStore = create<StoreState>((set) => ({
  ddl: '',
  setDdl: (ddl) => set({ ddl }),

  parsedSchema: null,
  setParsedSchema: (parsedSchema) => set({ parsedSchema }),

  generationOrder: [],
  setGenerationOrder: (generationOrder) => set({ generationOrder }),

  generatedData: null,
  setGeneratedData: (generatedData) => set({ generatedData }),

  agentLog: '',
  setAgentLog: (agentLog) => set({ agentLog }),

  validationIssues: [],
  setValidationIssues: (validationIssues) => set({ validationIssues }),

  validationPassed: false,
  setValidationPassed: (validationPassed) => set({ validationPassed }),

  schemaSummary: '',
  setSchemaSummary: (schemaSummary) => set({ schemaSummary }),

  backendStatus: 'unknown',
  setBackendStatus: (backendStatus) => set({ backendStatus }),
}));
