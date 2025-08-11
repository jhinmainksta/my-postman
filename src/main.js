const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("node:path");
const fs = require("node:fs/promises");
const Swal = require("sweetalert2");

let appWindow;
let collectionWindow;

function createAppWindow() {
  appWindow = new BrowserWindow({
    width: 1200,
    height: 1000,
    webPreferences: {
      preload: path.join(__dirname, "preloads/p-app.js"),
    },
  });

  appWindow.loadFile("src/renderers/app/app.html");
}

function createCollectionWindow() {
  collectionWindow = new BrowserWindow({
    width: 400,
    height: 300,
    parent: appWindow,
    modal: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preloads/p-create-collection.js"),
    },
  });

  collectionWindow.loadFile(
    "src/renderers/create-collection/create-collection.html"
  );
}

function getUrlHandler(event, request) {
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

function openCreateCollectionWindowHandler() {
  if (collectionWindow) {
    collectionWindow.focus();
    return;
  }

  createCollectionWindow();

  collectionWindow.on("closed", () => {
    collectionWindow = null;
  });
}

function submitCreateCollectionHandler(event, collectionData) {
  collectionData.path += `\\${collectionData.collectionName}`;

  return new Promise(async (resolve) => {
    try {
      const collection = {
        name: collectionData.collectionName,
        type: "collection",
        ignore: ["node_modules", ".git"],
      };

      await fs.mkdir(`${collectionData.path}`);
      await fs.appendFile(
        `${collectionData.path}\\${collectionData.collectionName}.json`,
        JSON.stringify(collection, null, 2)
      );
      appWindow.webContents.send("create-collection", collection);
      resolve(true);
    } catch (error) {
      dialog.showMessageBoxSync({
        type: "info",
        title: "Create collection error",
        message: error.message,
        buttons: ["OK"],
      });
      resolve(false);
    }
  });
}

async function openDirectoryDialogHandler() {
  const result = await dialog.showOpenDialog({
    properties: ["openDirectory"],
  });
  return result.filePaths[0] || null;
}

function callOpenCollectionHandler() {
  return new Promise(async (resolve) => {
    try {
      const result = await dialog.showOpenDialog({
        properties: ["openDirectory"],
      });

      if (result.canceled) {
        resolve(null);
        return;
      }

      const collectionDir = result.filePaths[0];
      const collectionConfigPath = getConfigPath(collectionDir);
      const content = await fs.readFile(collectionConfigPath, {
        encoding: "utf8",
      });

      const collectionObj = await JSON.parse(content);

      if (!collectionObj.name || !collectionObj.type) {
        alert("wrong config format");
        resolve(null);
        return;
      }

      collectionObj.childs = await gatherChilds(collectionDir);

      resolve(collectionObj);
    } catch (error) {
      let message = error.message;
      if (error.code === "ENOENT") message = "not a collection directory";
      alert(message);
      resolve(null);
    }
  });
}

async function gatherChilds(dir) {
  const childs = [];
  const files = await fs.readdir(dir);
  const configName = getFileNameFromPath(dir) + ".json";

  for (const file of files) {
    const filePath = dir + "\\" + file;
    if (file === configName) continue;
    try {
      if (!(await fs.stat(filePath)).isDirectory()) {
        const content = await fs.readFile(filePath);
        const fileObj = JSON.parse(content);
        fileObj.path = filePath;
        childs.push(fileObj);
      } else {
        const folderPath = filePath + "\\" + file + ".json";
        const content = await fs.readFile(folderPath);
        const folderObj = JSON.parse(content);
        folderObj.path = folderPath;
        folderObj.childs = await gatherChilds(filePath);
        childs.push(folderObj);
      }
    } catch (error) {
      console.log(error.message);
    }
  }
  return childs;
}

function getFileNameFromPath(path) {
  return path.match(/[^\\]*$/)[0];
}

function getConfigPath(path) {
  return path + "\\" + getFileNameFromPath(path) + ".json";
}

function alert(message) {
  dialog.showMessageBoxSync({
    type: "info",
    title: "Open collection error",
    message: message,
    buttons: ["OK"],
  });
}

app.whenReady().then(() => {
  ipcMain.handle("get-url", getUrlHandler);
  ipcMain.handle("open-directory-dialog", openDirectoryDialogHandler);
  ipcMain.handle(
    "open-create-collection-window",
    openCreateCollectionWindowHandler
  );
  ipcMain.handle("call-open-collection", callOpenCollectionHandler);
  ipcMain.handle("submit-create", submitCreateCollectionHandler);

  createAppWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "drawin") app.quit();
});
