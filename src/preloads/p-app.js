const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("versions", {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
});

contextBridge.exposeInMainWorld("appToMain", {
  getUrl: (request) => ipcRenderer.invoke("get-url", request),
  openCreateCollectionWindow: () =>
    ipcRenderer.invoke("open-create-collection-window"),
  onCreateCollection: (callback) =>
    ipcRenderer.on("create-collection", (_event, collectionData) =>
      callback(collectionData)
    ),
  callOpenCollection: (collectionData) =>
    ipcRenderer.invoke("call-open-collection", collectionData),
});
