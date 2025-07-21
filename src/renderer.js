document.getElementById(
  "info"
).innerText = `This app is using Chrome (v${versions.chrome()}), Node.js (v${versions.node()}) and Electron (v${versions.electron()})`;

const urlInput = document.getElementById("url-input");
const responseText = document.getElementById("response-text");

urlInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    responseText.innerText = "Loading...";
    const url = urlInput.value;

    if (url === "") {
      responseText.innerText = "url field can't be empty";
    }

    myPostmanChan
      .getUrl(url)
      .then((result) => {
        if (result.success) {
          responseText.innerText = result.data;
        } else {
          responseText.innerText = `Error: ${result.error}`;
          console.error(result.error);
        }
      })
      .catch((error) => {
        console.error("IPC communication error:", error);
        responseText.innerText = `Communication error: ${error.message}`;
      });
    console.log("magagich");
  }
});
