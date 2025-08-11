document.addEventListener("DOMContentLoaded", () => {
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

  document.getElementById("col-create-btn").addEventListener("click", () => {
    appToMain.openCreateCollectionWindow();
  });

  function renderCollection(node, parentElement) {
    if (!node) return;
    const element = document.createElement("div");
    element.className = node.type;

    const nameContainer = document.createElement("div");
    nameContainer.className = "name-container";
    nameContainer.textContent = node.name;
    element.appendChild(nameContainer);

    const menuDots = document.createElement("div");
    menuDots.className = "menu-dots";
    menuDots.innerHTML = " ⋮ ";
    menuDots.addEventListener("click", () => {
      console.log("Da nevedomo mne");
    });
    element.appendChild(menuDots);

    if (node.type === "folder" || node.type === "collection") {
      element.addEventListener("click", (e) => {
        if (!e.target.classList.contains("menu-dots"));
        element.classList.toggle("open");
      });

      if (node.childs) {
        const childContainer = document.createElement("div");
        childContainer.className = "childs";

        node.childs.forEach((child) => {
          renderCollection(child, childContainer);
        });
        parentElement.appendChild(element);
        parentElement.appendChild(childContainer);
      } else {
        parentElement.appendChild(element);
      }
    } else {
      parentElement.appendChild(element);
    }
  }

  document.getElementById("col-open-btn").addEventListener("click", () => {
    appToMain.callOpenCollection().then((collection) => {
      console.log(collection);
      renderCollection(collection, sideBarContentElem);
    });
  });

  window.appToMain.onCreateCollection((collection) => {
    console.log(collection);
    renderCollection(collection, sideBarContentElem);
  });
});
