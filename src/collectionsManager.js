const browseBtn = document.getElementById("browse-btn");
const dirnameField = document.getElementById("dirname-input");

browseBtn.addEventListener("click", async () => {
  console.log("sus");
  const path = await createFile.openDirectoryDialog();
  console.log(path);
  dirnameField.value = path;
});
