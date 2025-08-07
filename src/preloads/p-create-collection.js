const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("createCollectionToMain", {
  openDirectoryDialog: () => ipcRenderer.invoke("open-directory-dialog"),
  submitCreate: (collectionData) =>
    ipcRenderer.invoke("submit-create", collectionData),
});
