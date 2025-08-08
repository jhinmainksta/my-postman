document.addEventListener("DOMContentLoaded", () => {
  const browseBtn = document.getElementById("browse-btn");
  const createCollectionBtn = document.getElementById("create-collection-btn");
  const path = document.getElementById("path-input");
  const filenameField = document.getElementById("filename-input");

  browseBtn.addEventListener("click", async () => {
    path.value = await createCollectionToMain.openDirectoryDialog();
  });

  createCollectionBtn.addEventListener("click", () => {
    if (path.value === "" || filenameField.value === "") {
      console.log("empty fields");
    } else {
      createCollectionToMain
        .submitCreate({
          collectionName: filenameField.value,
          path: path.value,
        })
        .then((success) => {
          if (success) window.close();
        });
    }
  });
});
