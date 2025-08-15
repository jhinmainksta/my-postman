document.addEventListener("DOMContentLoaded", () => {
  const createBtn = document.getElementById("create-btn");
  const nameField = document.getElementById("name-input");

  const type = new URL(window.location.href).searchParams.get("type");

  createBtn.addEventListener("click", () => {
    if (nameField.value === "") {
      console.log("empty fields");
    } else {
      if (type === "folder") {
        getNameToMain.getFolderName(nameField.value).then((success) => {
          if (success) window.close();
        });
      }
    }
  });
});
