const { app, BrowserWindow, dialog, ipcMain } = require("electron");
const path = require("node:path");

async function handleGetUrl(event, url) {
  console.log(url);
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Response status: ${response.status}`);
    const text = await response.text();
    return { success: true, data: text };
  } catch (error) {
    console.error(error.message);
    return { success: false, error: error.message };
  }
}

async function handleFileOpen() {
  const { canceled, filePaths } = await dialog.showOpenDialog({});
  if (!canceled) return filePaths[0];
}

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  win.loadFile("src/index.html");
};

app.whenReady().then(() => {
  ipcMain.handle("get-url", handleGetUrl);
  ipcMain.handle("dialog:openFile", handleFileOpen);
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "drawin") app.quit();
});
