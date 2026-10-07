var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// electron/main.ts
var import_electron = require("electron");
var import_path = __toESM(require("path"));
var import_http = __toESM(require("http"));
var import_fs = __toESM(require("fs"));
var mainWindow = null;
var serverInstance = null;
function checkServerReady(port) {
  return new Promise((resolve) => {
    const req = import_http.default.get(`http://localhost:${port}/`, (res) => {
      resolve(true);
      res.resume();
    });
    req.on("error", () => {
      resolve(false);
    });
    req.end();
  });
}
async function waitForServer(port, maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    const ready = await checkServerReady(port);
    if (ready) return true;
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
}
async function createWindow() {
  mainWindow = new import_electron.BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: import_path.default.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    },
    autoHideMenuBar: true,
    title: "WordArena"
  });
  const isDev = process.env.NODE_ENV === "development" || !import_electron.app.isPackaged;
  const port = 3e3;
  if (isDev) {
    mainWindow.loadURL(`http://localhost:${port}`);
  } else {
    try {
      const serverPath = import_path.default.join(__dirname, "server.js");
      if (import_fs.default.existsSync(serverPath)) {
        process.env.PORT = String(port);
        process.env.NODE_ENV = "production";
        serverInstance = require(serverPath);
      }
      const serverReady = await waitForServer(port);
      if (!serverReady) {
        throw new Error("WordArena local server failed to respond on port 3000.");
      }
      mainWindow.loadURL(`http://localhost:${port}`);
    } catch (err) {
      const parentWindow = mainWindow && !mainWindow.isDestroyed() ? mainWindow : void 0;
      const result = import_electron.dialog.showMessageBoxSync(parentWindow || {}, {
        type: "error",
        title: "WordArena Error",
        message: "WordArena could not start correctly.",
        detail: err?.message || "Unknown startup error.",
        buttons: ["Retry", "Close"]
      });
      if (result === 0) {
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.destroy();
        }
        createWindow();
      } else {
        import_electron.app.quit();
      }
      return;
    }
  }
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}
import_electron.app.whenReady().then(() => {
  createWindow();
  import_electron.app.on("activate", () => {
    if (import_electron.BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});
import_electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    import_electron.app.quit();
  }
});
