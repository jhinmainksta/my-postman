const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const fs = require("fs");
const path = require("node:path");

let mainWindow;
let createFileWindow;

function handleGetUrl(event, request) {
  return new Promise(async (resolve) => {
    console.log(request);
    try {
      const response = await fetch(request.url, request.params);
      const simpleResponse = {
        status: response.status,
        statusText: response.statusText,
        headders: Object.fromEntries(response.headers.entries()),
        body: await response.text(),
      };
      resolve(simpleResponse);
    } catch (error) {
      console.error(error.message);
      resolve({
        error: true,
        message: error.message,
      });
    }
  });
}

ipcMain.handle("open-directory-dialog", async () => {
  const result = await dialog.showOpenDialog({
    properties: ["openDirectory"],
  });
  return result.filePaths[0] || null;
});

ipcMain.handle("open-create-collection-window", () => {
  if (createFileWindow) {
    createFileWindow.focus();
    return;
  }

  createFileWindow = new BrowserWindow({
    width: 400,
    height: 300,
    parent: mainWindow,
    modal: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preloadCollectionCreationWindow.js"),
    },
  });

  createFileWindow.loadFile("src/create-collection.html");

  createFileWindow.on("closed", () => {
    createFileWindow = null;
  });
});

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 1000,
    webPreferences: {
      preload: path.join(__dirname, "preloadMainWindow.js"),
    },
  });

  mainWindow.loadFile("src/index.html");
};

app.whenReady().then(() => {
  ipcMain.handle("get-url", handleGetUrl);
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "drawin") app.quit();
});
