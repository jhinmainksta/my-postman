const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("node:path");

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

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1200,
    height: 1000,
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
