const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("createCollectionToMain", {
  openDirectoryDialog: () => ipcRenderer.invoke("open-directory-dialog"),
});
