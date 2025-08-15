const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("getNameToMain", {
  getFolderName: (name) => ipcRenderer.invoke("get-folder-name", name),
});
