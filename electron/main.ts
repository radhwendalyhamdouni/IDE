// ═══════════════════════════════════════════════════════════════════════════════
// المرجع IDE - Electron Main Process
// ═══════════════════════════════════════════════════════════════════════════════

import { app, BrowserWindow, ipcMain, dialog, shell, Menu, Tray, nativeImage } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { spawn, ChildProcess, exec } from 'child_process';
import * as http from 'http';

// ─────────────────────────────────────────────────────────────────────────────
// الأنواع
// ─────────────────────────────────────────────────────────────────────────────
interface OllamaStatus {
  installed: boolean;
  running: boolean;
  models: string[];
  recommendedModel: string | null;
}

interface InstallProgress {
  step: string;
  progress: number;
  message: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// المتغيرات العامة
// ─────────────────────────────────────────────────────────────────────────────
let mainWindow: BrowserWindow | null = null;
let setupWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let nextServer: ChildProcess | null = null;
let ollamaProcess: ChildProcess | null = null;
let isQuitting = false;

const PORT = 3000;
const OLLAMA_PORT = 11434;
const APP_NAME = 'المرجع IDE';

// مسارات التثبيت
const isDev = !app.isPackaged;
const appPath = isDev ? path.join(__dirname, '..') : path.dirname(app.getPath('exe'));
const resourcesPath = isDev ? path.join(__dirname, '..', 'resources') : path.join(process.resourcesPath, 'resources');

// ─────────────────────────────────────────────────────────────────────────────
// إنشاء النوافذ
// ─────────────────────────────────────────────────────────────────────────────
function createSetupWindow(): BrowserWindow {
  setupWindow = new BrowserWindow({
    width: 600,
    height: 500,
    frame: false,
    resizable: false,
    center: true,
    backgroundColor: '#0f172a',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    icon: path.join(resourcesPath, 'icon.png'),
  });

  setupWindow.loadFile(path.join(__dirname, 'setup.html'));

  setupWindow.on('closed', () => {
    setupWindow = null;
  });

  return setupWindow;
}

function createMainWindow(): BrowserWindow {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    show: false,
    backgroundColor: '#0f172a',
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 15, y: 15 },
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    icon: path.join(resourcesPath, 'icon.png'),
  });

  // تحميل التطبيق
  if (isDev) {
    mainWindow.loadURL(`http://localhost:${PORT}`);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadURL(`http://localhost:${PORT}`);
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow?.hide();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // إنشاء القائمة
  createMenu();

  return mainWindow;
}

function createMenu() {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: APP_NAME,
      submenu: [
        { role: 'about' as const, label: 'حول المرجع' },
        { type: 'separator' as const },
        { role: 'services' as const, label: 'الخدمات' },
        { type: 'separator' as const },
        { role: 'hide' as const, label: 'إخفاء' },
        { role: 'hideOthers' as const, label: 'إخفاء الباقي' },
        { role: 'unhide' as const, label: 'إظهار' },
        { type: 'separator' as const },
        { role: 'quit' as const, label: 'إنهاء' },
      ],
    },
    {
      label: 'ملف',
      submenu: [
        { label: 'ملف جديد', accelerator: 'CmdOrCtrl+N', click: () => mainWindow?.webContents.send('menu:newFile') },
        { label: 'فتح ملف', accelerator: 'CmdOrCtrl+O', click: () => mainWindow?.webContents.send('menu:openFile') },
        { label: 'حفظ', accelerator: 'CmdOrCtrl+S', click: () => mainWindow?.webContents.send('menu:saveFile') },
        { type: 'separator' },
        { label: 'تصدير', click: () => mainWindow?.webContents.send('menu:export') },
      ],
    },
    {
      label: 'تحرير',
      submenu: [
        { role: 'undo' as const, label: 'تراجع' },
        { role: 'redo' as const, label: 'إعادة' },
        { type: 'separator' as const },
        { role: 'cut' as const, label: 'قص' },
        { role: 'copy' as const, label: 'نسخ' },
        { role: 'paste' as const, label: 'لصق' },
        { role: 'selectAll' as const, label: 'تحديد الكل' },
      ],
    },
    {
      label: 'عرض',
      submenu: [
        { role: 'reload' as const, label: 'إعادة تحميل' },
        { role: 'forceReload' as const, label: 'إعادة تحميل إجبارية' },
        { role: 'toggleDevTools' as const, label: 'أدوات المطور' },
        { type: 'separator' as const },
        { role: 'resetZoom' as const, label: 'حجم طبيعي' },
        { role: 'zoomIn' as const, label: 'تكبير' },
        { role: 'zoomOut' as const, label: 'تصغير' },
        { type: 'separator' as const },
        { role: 'togglefullscreen' as const, label: 'ملء الشاشة' },
      ],
    },
    {
      label: 'تشغيل',
      submenu: [
        { label: 'تشغيل الكود', accelerator: 'F5', click: () => mainWindow?.webContents.send('run:code') },
        { label: 'إيقاف', accelerator: 'Shift+F5', click: () => mainWindow?.webContents.send('run:stop') },
        { type: 'separator' },
        { label: 'تنسيق الكود', accelerator: 'Shift+Alt+F', click: () => mainWindow?.webContents.send('format:code') },
      ],
    },
    {
      label: 'مساعدة',
      submenu: [
        { label: 'التوثيق', click: () => shell.openExternal('https://github.com/radhwendalyhamdouni/Al-Marjaa-Language') },
        { label: 'الاختصارات', accelerator: 'CmdOrCtrl+/', click: () => mainWindow?.webContents.send('show:shortcuts') },
        { type: 'separator' },
        { label: 'التحقق من التحديثات', click: () => checkForUpdates() },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function createTray() {
  const iconPath = path.join(resourcesPath, 'icon.png');
  const icon = nativeImage.createFromPath(iconPath);
  
  tray = new Tray(icon.resize({ width: 16, height: 16 }));
  
  const contextMenu = Menu.buildFromTemplate([
    { label: 'فتح المرجع IDE', click: () => mainWindow?.show() },
    { type: 'separator' },
    { label: 'حالة Ollama', click: () => checkOllamaStatus() },
    { label: 'إعادة تشغيل Ollama', click: () => restartOllama() },
    { type: 'separator' },
    { label: 'إنهاء', click: () => quitApp() },
  ]);

  tray.setToolTip(APP_NAME);
  tray.setContextMenu(contextMenu);
  
  tray.on('click', () => {
    mainWindow?.show();
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// إدارة Ollama
// ─────────────────────────────────────────────────────────────────────────────
async function getOllamaPath(): Promise<string> {
  const platform = process.platform;
  
  if (platform === 'win32') {
    const localAppData = process.env.LOCALAPPDATA || '';
    const programFiles = process.env.ProgramFiles || '';
    
    const paths = [
      path.join(localAppData, 'Programs', 'Ollama', 'ollama.exe'),
      path.join(programFiles, 'Ollama', 'ollama.exe'),
      'ollama.exe',
    ];
    
    for (const p of paths) {
      if (fs.existsSync(p)) return p;
    }
    return 'ollama.exe';
  }
  
  if (platform === 'darwin') {
    const paths = [
      '/usr/local/bin/ollama',
      '/opt/homebrew/bin/ollama',
      path.join(app.getPath('home'), '.ollama', 'bin', 'ollama'),
    ];
    
    for (const p of paths) {
      if (fs.existsSync(p)) return p;
    }
    return 'ollama';
  }
  
  // Linux
  const paths = [
    '/usr/local/bin/ollama',
    '/usr/bin/ollama',
    path.join(app.getPath('home'), '.ollama', 'bin', 'ollama'),
  ];
  
  for (const p of paths) {
    if (fs.existsSync(p)) return p;
  }
  return 'ollama';
}

async function isOllamaInstalled(): Promise<boolean> {
  return new Promise((resolve) => {
    exec('ollama --version', (error) => {
      resolve(!error);
    });
  });
}

async function isOllamaRunning(): Promise<boolean> {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: OLLAMA_PORT,
      path: '/api/tags',
      method: 'GET',
      timeout: 2000,
    }, (res) => {
      resolve(res.statusCode === 200);
    });
    
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
    req.end();
  });
}

async function getInstalledModels(): Promise<string[]> {
  return new Promise((resolve) => {
    exec('ollama list', (error, stdout) => {
      if (error) {
        resolve([]);
        return;
      }
      
      const lines = stdout.split('\n').slice(1);
      const models = lines
        .filter(line => line.trim())
        .map(line => line.split(/\s+/)[0])
        .filter(name => name);
      
      resolve(models);
    });
  });
}

async function checkOllamaStatus(): Promise<OllamaStatus> {
  const installed = await isOllamaInstalled();
  const running = installed ? await isOllamaRunning() : false;
  const models = running ? await getInstalledModels() : [];
  
  const recommendedModel = models.find(m => 
    m.toLowerCase().includes('qwen')
  ) || null;
  
  return { installed, running, models, recommendedModel };
}

async function startOllama(): Promise<boolean> {
  if (await isOllamaRunning()) return true;
  
  return new Promise((resolve) => {
    const platform = process.platform;
    
    if (platform === 'win32') {
      ollamaProcess = spawn('ollama', ['serve'], {
        detached: true,
        stdio: 'ignore',
        windowsHide: true,
      });
    } else {
      ollamaProcess = spawn('ollama', ['serve'], {
        detached: true,
        stdio: 'ignore',
      });
    }
    
    ollamaProcess.on('error', () => resolve(false));
    
    // انتظار تشغيل Ollama
    let attempts = 0;
    const checkInterval = setInterval(async () => {
      attempts++;
      if (await isOllamaRunning()) {
        clearInterval(checkInterval);
        resolve(true);
      } else if (attempts > 30) {
        clearInterval(checkInterval);
        resolve(false);
      }
    }, 1000);
  });
}

async function restartOllama(): Promise<void> {
  if (ollamaProcess) {
    ollamaProcess.kill();
    ollamaProcess = null;
  }
  await startOllama();
}

async function pullModel(modelName: string, onProgress: (progress: InstallProgress) => void): Promise<boolean> {
  return new Promise((resolve) => {
    const proc = spawn('ollama', ['pull', modelName]);
    
    proc.stdout.on('data', (data) => {
      const output = data.toString();
      onProgress({
        step: 'pulling',
        progress: 50,
        message: output,
      });
    });
    
    proc.stderr.on('data', (data) => {
      const output = data.toString();
      // تحليل التقدم
      const match = output.match(/(\d+)%/);
      if (match) {
        onProgress({
          step: 'downloading',
          progress: parseInt(match[1]),
          message: `جاري تحميل ${modelName}: ${match[1]}%`,
        });
      }
    });
    
    proc.on('close', (code) => {
      resolve(code === 0);
    });
    
    proc.on('error', () => resolve(false));
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// تثبيت Ollama
// ─────────────────────────────────────────────────────────────────────────────
async function installOllama(onProgress: (progress: InstallProgress) => void): Promise<boolean> {
  const platform = process.platform;
  const arch = process.arch;
  
  onProgress({
    step: 'checking',
    progress: 0,
    message: 'جاري التحقق من النظام...',
  });
  
  // إذا كان مثبتاً بالفعل
  if (await isOllamaInstalled()) {
    onProgress({
      step: 'installed',
      progress: 100,
      message: 'Ollama مثبت بالفعل!',
    });
    return true;
  }
  
  onProgress({
    step: 'downloading',
    progress: 10,
    message: 'جاري تحميل Ollama...',
  });
  
  try {
    if (platform === 'win32') {
      // تحميل وتثبيت Ollama على Windows
      const installerPath = path.join(app.getPath('temp'), 'ollama-setup.exe');
      const downloadUrl = 'https://ollama.com/download/OllamaSetup.exe';
      
      await downloadFile(downloadUrl, installerPath, (percent) => {
        onProgress({
          step: 'downloading',
          progress: 10 + percent * 0.6,
          message: `جاري تحميل Ollama: ${Math.round(percent)}%`,
        });
      });
      
      onProgress({
        step: 'installing',
        progress: 70,
        message: 'جاري تثبيت Ollama...',
      });
      
      // تشغيل المثبت
      await new Promise<void>((resolve, reject) => {
        exec(`"${installerPath}" /S`, (error) => {
          if (error) reject(error);
          else resolve();
        });
      });
      
      // تنظيف
      fs.unlinkSync(installerPath);
      
    } else if (platform === 'darwin') {
      // تحميل وتثبيت Ollama على macOS
      const installerPath = path.join(app.getPath('temp'), 'Ollama-darwin.zip');
      const downloadUrl = 'https://ollama.com/download/Ollama-darwin.zip';
      
      await downloadFile(downloadUrl, installerPath, (percent) => {
        onProgress({
          step: 'downloading',
          progress: 10 + percent * 0.6,
          message: `جاري تحميل Ollama: ${Math.round(percent)}%`,
        });
      });
      
      onProgress({
        step: 'installing',
        progress: 70,
        message: 'جاري تثبيت Ollama...',
      });
      
      // فك الضغط والتثبيت
      const appsPath = '/Applications';
      await new Promise<void>((resolve, reject) => {
        exec(`unzip -o "${installerPath}" -d "${appsPath}"`, (error) => {
          if (error) reject(error);
          else resolve();
        });
      });
      
      fs.unlinkSync(installerPath);
      
    } else {
      // Linux - استخدام سكربت التثبيت
      onProgress({
        step: 'installing',
        progress: 30,
        message: 'جاري تثبيت Ollama...',
      });
      
      await new Promise<void>((resolve, reject) => {
        exec('curl -fsSL https://ollama.com/install.sh | sh', (error) => {
          if (error) reject(error);
          else resolve();
        });
      });
    }
    
    onProgress({
      step: 'verifying',
      progress: 90,
      message: 'جاري التحقق من التثبيت...',
    });
    
    // انتظار التثبيت
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const installed = await isOllamaInstalled();
    
    onProgress({
      step: installed ? 'complete' : 'error',
      progress: 100,
      message: installed ? 'تم تثبيت Ollama بنجاح!' : 'فشل التثبيت',
    });
    
    return installed;
    
  } catch (error) {
    onProgress({
      step: 'error',
      progress: 0,
      message: `خطأ: ${error}`,
    });
    return false;
  }
}

async function downloadFile(url: string, dest: string, onProgress: (percent: number) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    
    http.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          downloadFile(redirectUrl, dest, onProgress).then(resolve).catch(reject);
          return;
        }
      }
      
      const totalSize = parseInt(response.headers['content-length'] || '0');
      let downloaded = 0;
      
      response.on('data', (chunk) => {
        downloaded += chunk.length;
        if (totalSize > 0) {
          onProgress((downloaded / totalSize) * 100);
        }
      });
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// عملية الإعداد التلقائي
// ─────────────────────────────────────────────────────────────────────────────
async function runSetup(): Promise<boolean> {
  return new Promise((resolve) => {
    createSetupWindow();
    
    const sendProgress = (progress: InstallProgress) => {
      setupWindow?.webContents.send('setup:progress', progress);
    };
    
    const runSteps = async () => {
      try {
        // الخطوة 1: التحقق من Ollama
        sendProgress({ step: 'checking', progress: 0, message: 'جاري التحقق من المتطلبات...' });
        
        const ollamaStatus = await checkOllamaStatus();
        
        if (!ollamaStatus.installed) {
          sendProgress({ step: 'installing-ollama', progress: 10, message: 'جاري تثبيت Ollama...' });
          
          const installed = await installOllama(sendProgress);
          if (!installed) {
            sendProgress({ step: 'error', progress: 0, message: 'فشل تثبيت Ollama. سيتم استخدام الأنماط المحلية.' });
            await new Promise(r => setTimeout(r, 2000));
            resolve(true);
            return;
          }
        }
        
        // الخطوة 2: تشغيل Ollama
        sendProgress({ step: 'starting-ollama', progress: 50, message: 'جاري تشغيل Ollama...' });
        
        const started = await startOllama();
        
        // الخطوة 3: التحقق من النماذج
        sendProgress({ step: 'checking-models', progress: 60, message: 'جاري التحقق من النماذج...' });
        
        const models = await getInstalledModels();
        const hasQwen = models.some(m => m.includes('qwen'));
        
        if (!hasQwen) {
          sendProgress({ step: 'downloading-model', progress: 70, message: 'جاري تحميل نموذج Qwen (هذا قد يستغرق بضع دقائق)...' });
          
          const modelPulled = await pullModel('qwen2.5:0.5b', sendProgress);
          if (!modelPulled) {
            sendProgress({ step: 'warning', progress: 95, message: 'تعذر تحميل النموذج. سيتم استخدام الأنماط المحلية.' });
          }
        }
        
        // الخطوة 4: الانتهاء
        sendProgress({ step: 'complete', progress: 100, message: 'تم الإعداد بنجاح!' });
        
        await new Promise(r => setTimeout(r, 1500));
        
        setupWindow?.close();
        resolve(true);
        
      } catch (error) {
        sendProgress({ step: 'error', progress: 0, message: `خطأ: ${error}` });
        await new Promise(r => setTimeout(r, 3000));
        setupWindow?.close();
        resolve(true); // المتابعة حتى مع الخطأ
      }
    };
    
    // انتظار تحميل الصفحة
    setupWindow?.webContents.on('did-finish-load', runSteps);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// بدء خادم Next.js
// ─────────────────────────────────────────────────────────────────────────────
async function startNextServer(): Promise<boolean> {
  return new Promise((resolve) => {
    if (isDev) {
      // في وضع التطوير، الخادم يعمل بالفعل
      resolve(true);
      return;
    }
    
    // في وضع الإنتاج، تشغيل الخادم المبني
    const serverPath = path.join(resourcesPath, 'server.js');
    
    if (!fs.existsSync(serverPath)) {
      console.error('Server not found:', serverPath);
      resolve(false);
      return;
    }
    
    nextServer = spawn(process.execPath, [serverPath], {
      cwd: resourcesPath,
      env: { ...process.env, PORT: String(PORT) },
      stdio: 'inherit',
    });
    
    nextServer.on('error', (err) => {
      console.error('Failed to start Next.js server:', err);
      resolve(false);
    });
    
    // انتظار تشغيل الخادم
    let attempts = 0;
    const checkInterval = setInterval(() => {
      attempts++;
      
      const req = http.request({
        hostname: 'localhost',
        port: PORT,
        path: '/',
        method: 'GET',
        timeout: 1000,
      }, (res) => {
        if (res.statusCode === 200) {
          clearInterval(checkInterval);
          resolve(true);
        }
      });
      
      req.on('error', () => {});
      req.on('timeout', () => req.destroy());
      req.end();
      
      if (attempts > 30) {
        clearInterval(checkInterval);
        resolve(false);
      }
    }, 1000);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// التحقق من التحديثات
// ─────────────────────────────────────────────────────────────────────────────
async function checkForUpdates(): Promise<void> {
  // TODO: تنفيذ التحقق من التحديثات
  dialog.showMessageBox(mainWindow!, {
    type: 'info',
    title: 'التحقق من التحديثات',
    message: 'أنت تستخدم أحدث إصدار من المرجع IDE',
    buttons: ['حسناً'],
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// إيقاف التطبيق
// ─────────────────────────────────────────────────────────────────────────────
function quitApp() {
  isQuitting = true;
  
  // إيقاف العمليات
  if (nextServer) {
    nextServer.kill();
  }
  
  if (ollamaProcess) {
    ollamaProcess.kill();
  }
  
  app.quit();
}

// ─────────────────────────────────────────────────────────────────────────────
// معالجات IPC
// ─────────────────────────────────────────────────────────────────────────────
ipcMain.handle('ollama:status', async (): Promise<OllamaStatus> => {
  return checkOllamaStatus();
});

ipcMain.handle('ollama:start', async (): Promise<boolean> => {
  return startOllama();
});

ipcMain.handle('ollama:restart', async (): Promise<void> => {
  return restartOllama();
});

ipcMain.handle('ollama:pull-model', async (_, modelName: string): Promise<boolean> => {
  return pullModel(modelName, () => {});
});

ipcMain.handle('app:version', (): string => {
  return app.getVersion();
});

ipcMain.handle('app:path', (): string => {
  return appPath;
});

ipcMain.on('app:quit', () => {
  quitApp();
});

ipcMain.on('app:restart', () => {
  app.relaunch();
  quitApp();
});

// ─────────────────────────────────────────────────────────────────────────────
// دورة حياة التطبيق
// ─────────────────────────────────────────────────────────────────────────────
app.whenReady().then(async () => {
  // إنشاء أيقونة النظام
  createTray();
  
  // تشغيل الإعداد التلقائي
  await runSetup();
  
  // بدء خادم Next.js
  const serverStarted = await startNextServer();
  
  if (!serverStarted) {
    dialog.showErrorBox('خطأ', 'فشل في بدء الخادم الداخلي');
    app.quit();
    return;
  }
  
  // إنشاء النافذة الرئيسية
  createMainWindow();
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    quitApp();
  }
});

app.on('before-quit', () => {
  isQuitting = true;
});

// منع التطبيقات المتعددة
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });
}
