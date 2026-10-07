import { app, BrowserWindow, dialog } from 'electron';
import path from 'path';
import http from 'http';
import fs from 'fs';

let mainWindow: BrowserWindow | null = null;
let serverInstance: any = null;

function checkServerReady(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}/`, (res) => {
      resolve(true);
      res.resume();
    });
    req.on('error', () => {
      resolve(false);
    });
    req.end();
  });
}

async function waitForServer(port: number, maxAttempts = 30): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    const ready = await checkServerReady(port);
    if (ready) return true;
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    autoHideMenuBar: true,
    title: 'WordArena'
  });

  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  const port = 3000;

  if (isDev) {
    mainWindow.loadURL(`http://localhost:${port}`);
  } else {
    // Production packaged mode: start bundled server
    try {
      const serverPath = path.join(__dirname, 'server.js');
      if (fs.existsSync(serverPath)) {
        process.env.PORT = String(port);
        process.env.NODE_ENV = 'production';
        serverInstance = require(serverPath);
      }

      const serverReady = await waitForServer(port);
      if (!serverReady) {
        throw new Error('WordArena local server failed to respond on port 3000.');
      }

      mainWindow.loadURL(`http://localhost:${port}`);
    } catch (err: any) {
      const parentWindow = mainWindow && !mainWindow.isDestroyed() ? mainWindow : undefined;
      const result = dialog.showMessageBoxSync(parentWindow || ({} as BrowserWindow), {
        type: 'error',
        title: 'WordArena Error',
        message: 'WordArena could not start correctly.',
        detail: err?.message || 'Unknown startup error.',
        buttons: ['Retry', 'Close']
      });

      if (result === 0) {
        // Retry
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.destroy();
        }
        createWindow();
      } else {
        app.quit();
      }
      return;
    }
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
