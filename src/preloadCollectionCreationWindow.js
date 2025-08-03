const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("createFile", {
  openDirectoryDialog: () => ipcRenderer.invoke("open-directory-dialog"),
});
