var resizer = document.querySelector(".resizer"),
  cover = document.querySelector(".cover");

function initResizeFn() {
  var y, h;

  function ds_mousedownHandler(e) {
    y = e.clientY;

    var sbHeight = window.getComputedStyle(cover).height;
    h = parseInt(sbHeight, 10);

    document.addEventListener("mousemove", ds_mousemoveHandler);
    document.addEventListener("mouseup", ds_mouseupHandler);
  }

  function ds_mouseupHandler() {
    document.removeEventListener("mouseup", ds_mouseupHandler);
    document.removeEventListener("mousemove", ds_mousemoveHandler);
  }

  function ds_mousemoveHandler(e) {
    var dy = e.clientY - y;

    var ch = h + dy;

    var maxh = parseInt(document.body.clientHeight);

    if (ch > 200 && maxh - ch > 200) {
      cover.style.height = `${ch}px`;
    }
  }

  resizer.addEventListener("mousedown", ds_mousedownHandler);
}

initResizeFn();
