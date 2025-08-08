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
      await fs.mkdir(`${collectionData.path}`);
      await fs.appendFile(
        `${collectionData.path}\\${collectionData.collectionName}.json`,
        JSON.stringify(
          {
            version: "1",
            name: collectionData.collectionName,
            type: "collection",
            ignore: ["node_modules", ".git"],
          },
          null,
          2
        )
      );
      appWindow.webContents.send("create-collection", collectionData);
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
      const collectionPath = result.filePaths[0];
      const collectionDir = collectionPath.match(/[^\\]*$/)[0];
      const configcollectionName =
        collectionPath + "\\" + collectionDir + ".json";

      const content = await fs.readFile(configcollectionName, {
        encoding: "utf8",
      });
      const collectionName = JSON.parse(content)["name"];

      if (!collectionName) {
        dialog.showMessageBoxSync({
          type: "info",
          title: "Open collection error",
          message: "wrong format of collection config file",
          buttons: ["OK"],
        });
        resolve(null);
      } else resolve({ collectionName, path: collectionPath });
    } catch (error) {
      let message = error.message;
      if (error.code === "ENOENT") message = "not a collection directory";

      dialog.showMessageBoxSync({
        type: "info",
        title: "Open collection error",
        message: message,
        buttons: ["OK"],
      });
      resolve(null);
    }

    resolve(null);
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
