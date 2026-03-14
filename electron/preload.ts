// ═══════════════════════════════════════════════════════════════════════════════
// المرجع IDE - Electron Preload Script
// ═══════════════════════════════════════════════════════════════════════════════

import { contextBridge, ipcRenderer } from 'electron';

// ─────────────────────────────────────────────────────────────────────────────
// واجهة برمجة التطبيقات للعميل
// ─────────────────────────────────────────────────────────────────────────────
const electronAPI = {
  // معلومات التطبيق
  app: {
    version: () => ipcRenderer.invoke('app:version'),
    path: () => ipcRenderer.invoke('app:path'),
    quit: () => ipcRenderer.send('app:quit'),
    restart: () => ipcRenderer.send('app:restart'),
  },
  
  // Ollama
  ollama: {
    status: () => ipcRenderer.invoke('ollama:status'),
    start: () => ipcRenderer.invoke('ollama:start'),
    restart: () => ipcRenderer.invoke('ollama:restart'),
    pullModel: (modelName: string) => ipcRenderer.invoke('ollama:pull-model', modelName),
  },
  
  // الأحداث
  on: (channel: string, callback: (...args: unknown[]) => void) => {
    const validChannels = [
      'setup:progress',
      'menu:newFile',
      'menu:openFile',
      'menu:saveFile',
      'menu:export',
      'run:code',
      'run:stop',
      'format:code',
      'show:shortcuts',
    ];
    
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (_event, ...args) => callback(...args));
    }
  },
  
  off: (channel: string) => {
    ipcRenderer.removeAllListeners(channel);
  },
};

// كشف الواجهة للعميل
contextBridge.exposeInMainWorld('electronAPI', electronAPI);

// تعريف الأنواع لـ TypeScript
export type ElectronAPI = typeof electronAPI;
