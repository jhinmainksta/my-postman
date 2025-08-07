document.addEventListener("DOMContentLoaded", () => {
  document.getElementById(
    "info"
  ).innerText = `This app is using Chrome (v${versions.chrome()}), Node.js (v${versions.node()}) and Electron (v${versions.electron()})`;

  const urlInputElem = document.getElementById("url-input");
  const statusElem = document.getElementById("response-status");
  const headersElem = document.getElementById("response-headers");
  const respBodyElem = document.getElementById("response-body");
  const methodElem = document.getElementById("method");
  const reqBodyElem = document.getElementById("request-body");
  const sideBarContentElem = document.getElementById("side-bar-content");

  function clearResponseFields() {
    statusElem.innerText = "";
    headersElem.innerText = "";
    respBodyElem.innerText = "";
    reqBodyElem.innerText = "";
  }

  urlInputElem.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      clearResponseFields();
      statusElem.innerText = "Loading...";
      const url = urlInputElem.value;

      if (url === "") {
        statusElem.innerText = "url field can't be empty";
        return;
      }

      const method = methodElem.value;

      const bodyText = reqBodyElem.value;
      let request = {
        url,
        params: {
          method,
          headers: {
            "Content-Type": "application/json",
          },
        },
      };

      if (bodyText !== "") {
        try {
          request.params.body = JSON.parse(bodyText);
        } catch (error) {}
      }

      appToMain
        .getUrl(request)
        .then((response) => {
          if (response.error)
            statusElem.innerText = `Error: ${response.message}`;
          else {
            statusElem.innerText = `Status: ${response.status} Message:${response.statusText}`;
            headersElem.innerText = JSON.stringify(response.headders, null, 2);
            respBodyElem.innerText = response.body;
          }
        })
        .catch((error) => {
          console.error("IPC communication error:", error);
          statusElem.innerText = `Communication error: ${error.message}`;
        });
    }
  });

  const tabButtons = document.querySelectorAll(".tab-btn");

  tabButtons.forEach((button) => {
    button.addEventListener("click", function () {
      document
        .querySelectorAll(".tab-btn")
        .forEach((btn) => btn.classList.remove("active"));
      document
        .querySelectorAll(".tab-content")
        .forEach((content) => content.classList.remove("active"));

      this.classList.add("active");

      const tabId = this.getAttribute("data-tab");
      document.getElementById(tabId).classList.add("active");
    });
  });

  const col_create_btn = document.getElementById("col-create-btn");

  col_create_btn.addEventListener("click", () => {
    appToMain.openCreateCollectionWindow();
  });

  window.appToMain.onCreateCollection((collectionData) => {
    sideBarContentElem.innerHTML += `<div class="collection" data-path="${collectionData.path}">${collectionData.filename}</div>`;
  });
});
