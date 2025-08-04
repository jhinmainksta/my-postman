document.addEventListener("DOMContentLoaded", () => {
  const browseBtn = document.getElementById("browse-btn");
  const dirnameField = document.getElementById("dirname-input");

  browseBtn.addEventListener("click", async () => {
    const path = await createCollectionToMain.openDirectoryDialog();
    dirnameField.value = path;
  });
});
