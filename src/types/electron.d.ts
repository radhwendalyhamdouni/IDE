// ═══════════════════════════════════════════════════════════════════════════════
// المرجع IDE - Electron API Types
// ═══════════════════════════════════════════════════════════════════════════════

export interface OllamaStatus {
  installed: boolean;
  running: boolean;
  models: string[];
  recommendedModel: string | null;
}

export interface InstallProgress {
  step: string;
  progress: number;
  message: string;
}

export interface ElectronAPI {
  app: {
    version: () => Promise<string>;
    path: () => Promise<string>;
    quit: () => void;
    restart: () => void;
  };
  ollama: {
    status: () => Promise<OllamaStatus>;
    start: () => Promise<boolean>;
    restart: () => Promise<void>;
    pullModel: (modelName: string) => Promise<boolean>;
  };
  on: (channel: string, callback: (...args: unknown[]) => void) => void;
  off: (channel: string) => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export {};
