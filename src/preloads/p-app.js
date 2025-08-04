const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("versions", {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
});

contextBridge.exposeInMainWorld("appToMain", {
  getUrl: (request) => ipcRenderer.invoke("get-url", request),
  openCreateFileWindow: () =>
    ipcRenderer.invoke("open-create-collection-window"),
});
