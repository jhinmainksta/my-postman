document.getElementById(
  "info"
).innerText = `This app is using Chrome (v${versions.chrome()}), Node.js (v${versions.node()}) and Electron (v${versions.electron()})`;

const urlInput = document.getElementById("url-input");
const statusElem = document.getElementById("response-status");
const headersElem = document.getElementById("response-headders");
const respBodyElem = document.getElementById("response-body");
const methodElem = document.getElementById("method");
const reqBodyElem = document.getElementById("request-body");

function clearResponseFields() {
  statusElem.innerText = "";
  headersElem.innerText = "";
  respBodyElem.innerText = "";
  reqBodyElem.innerText = "";
}

urlInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    clearResponseFields();
    statusElem.innerText = "Loading...";
    const url = urlInput.value;

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
      request.params.body = bodyText;
    }

    myPostmanChan
      .getUrl(request)
      .then((response) => {
        if (response.error) statusElem.innerText = `Error: ${response.message}`;
        else {
          statusElem.innerText = `Status: ${response.status}\n${response.statusText}`;
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
