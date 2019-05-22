"use strict";

import * as electron from "electron";
import * as path from "path";
import { format as formatUrl } from "url";
import Server from "./server";

const isDevelopment = process.env.NODE_ENV !== "production";

// global reference to mainWindow (necessary to prevent window from being garbage collected)
let mainWindow: electron.BrowserWindow | null;
const server: Server = new Server();
server.startApp();

electron.ipcMain.on("requestSettings", (event: any, arg: any) => {
  event.returnValue = { shareUrl: `http://localhost:${server.port}/` };
});

function createMainWindow() {
  const { width, height } = electron.screen.getPrimaryDisplay().workAreaSize;
  const window = new electron.BrowserWindow({
    width,
    height,
    webPreferences: {
      nodeIntegration: true
      //   webSecurity: false
    }
  });

  if (isDevelopment) {
    window.webContents.openDevTools();
  }

  window.loadURL(
    formatUrl({
      pathname: path.join(__dirname, "index.html"),
      protocol: "file:",
      slashes: true
    })
  );

  window.on("closed", () => {
    mainWindow = null;
  });

  window.webContents.on("devtools-opened", () => {
    window.focus();
    setImmediate(() => {
      window.focus();
    });
  });

  return window;
}

// quit application when all windows are closed
electron.app.on("window-all-closed", () => {
  // on macOS it is common for applications to stay open until the user explicitly quits
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});

electron.app.on("activate", () => {
  // on macOS it is common to re-create a window even after all windows have been closed
  if (mainWindow === null) {
    mainWindow = createMainWindow();
  }
});

// create main BrowserWindow when electron is ready
electron.app.on("ready", () => {
  mainWindow = createMainWindow();
});
