const { contextBridge, ipcRenderer } = require("electron");

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

  openCreateFolderWindow: (path, type) =>
    ipcRenderer.invoke("open-create-folder-window", path, type),
});
