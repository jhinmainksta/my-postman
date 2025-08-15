document.addEventListener("DOMContentLoaded", () => {
  const urlInputElem = document.getElementById("url-input");
  const statusElem = document.getElementById("response-status");
  const headersElem = document.getElementById("response-headers");
  const respBodyElem = document.getElementById("response-body");
  const methodElem = document.getElementById("method");
  const reqBodyElem = document.getElementById("request-body");
  const sideBarContentElem = document.getElementById("side-bar-content");
  let currentDropdown = null;

  document.addEventListener("click", (e) => {
    if (currentDropdown && !e.target.closest(".menu-dots")) {
      currentDropdown.classList.remove("show");
      currentDropdown = null;
    }
  });

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

  function renderDropdownMenu(node) {
    const dropdown = document.createElement("div");
    dropdown.className = "dropdown";

    if (node.type === "collection") {
      const element = document.createElement("div");
      element.innerHTML = "create folder";
      element.className = "dropdown-item";
      element.addEventListener("click", () => {
        appToMain.openCreateFolderWindow(node.path, "folder");
        dropdown.classList.remove("show");
      });

      dropdown.appendChild(element);

      const element2 = document.createElement("div");
      element2.innerHTML = "create request";
      element2.className = "dropdown-item";
      element.addEventListener("click", () => {
        console.log("called request creation");
        dropdown.classList.remove("show");
      });

      dropdown.appendChild(element2);
    } else {
      const element = document.createElement("div");
      element.innerHTML = "sosal?";
      element.className = "dropdown-item";
      element.addEventListener("click", () => {
        console.log("amogus");
        dropdown.classList.remove("show");
      });

      dropdown.appendChild(element);
    }
    return dropdown;
  }

  function renderCollection(node, parent, depth = 0) {
    if (!node) return;

    const item = document.createElement("div");
    item.className = "item";

    const icon = document.createElement("span");
    icon.className = `${node.type}-icon icon`;
    item.appendChild(icon);

    const name = document.createElement("span");
    name.className = "name";
    name.textContent = node.name;
    item.appendChild(name);

    const menu = document.createElement("span");
    menu.className = "menu";
    menu.textContent = "⋮";

    const dropdown = renderDropdownMenu(node);
    menu.appendChild(dropdown);

    menu.addEventListener("click", (e) => {
      e.stopPropagation();
      if (currentDropdown) currentDropdown.classList.remove("show");
      dropdown.classList.toggle("show");
      currentDropdown = dropdown;
    });

    item.appendChild(menu);

    if (node.type === "folder" || node.type === "collection") {
      icon.addEventListener("click", () => {
        item.classList.toggle("open");
      });

      const childs = document.createElement("div");
      childs.className = "childs";

      node.childs.forEach((child) => {
        renderCollection(child, childs, depth + 1);
      });

      parent.appendChild(item);
      parent.appendChild(childs);
    } else {
      parent.appendChild(item);
    }
  }

  document.addEventListener("click", () => {
    if (currentDropdown) {
      currentDropdown.classList.remove("show");
      currentDropdown = null;
    }
  });

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
