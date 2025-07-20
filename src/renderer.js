const information = document.getElementById("info");
information.innerText = `This app is using Chrome (v${versions.chrome()}), Node.js (v${versions.node()}) and Electron (v${versions.electron()})`;

const urlInput = document.getElementById("url-input");

urlInput.addEventListener("keypress", async (e) => {
  if (e.key === "Enter") {
    const responseText = document.getElementById("response-text");
    responseText.innerText = "Loading...";
    const url = urlInput.value;
    try {
      const result = await myPostmanChan.getUrl(url);
      if (result.success) {
        responseText.innerText = result.data;
      } else {
        responseText.innerText = `Error: ${result.error}`;
        console.error(result.error);
      }
    } catch (error) {
      console.error("IPC communication error:", error);
      document.getElementById(
        "response-text"
      ).innerText = `Communication error: ${error.message}`;
    }
  }
});
