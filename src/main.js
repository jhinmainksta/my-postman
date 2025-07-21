const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("node:path");

function handleGetUrl(event, url) {
  console.log(url);
  return new Promise(async (resolve) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Response status: ${response.status}`);
      const data = await response.text();
      console.log(data);
      return resolve({ success: true, data });
    } catch (error) {
      console.error(error.message);
      return resolve({ success: false, error: error.message });
    }
  });
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
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "drawin") app.quit();
});
