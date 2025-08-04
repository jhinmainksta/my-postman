document.addEventListener("DOMContentLoaded", () => {
  let resizer = document.querySelector(".resizer");
  let cover = document.querySelector(".cover");

  function initResizeFn() {
    let resizer_pos, cover_height;

    function ds_mousedownHandler(e) {
      resizer_pos = e.clientY;

      cover_height = parseInt(window.getComputedStyle(cover).height);

      document.addEventListener("mousemove", ds_mousemoveHandler);
      document.addEventListener("mouseup", ds_mouseupHandler);
    }

    function ds_mouseupHandler() {
      document.removeEventListener("mouseup", ds_mouseupHandler);
      document.removeEventListener("mousemove", ds_mousemoveHandler);
    }

    function ds_mousemoveHandler(e) {
      const cover_min = resizer.dataset.cover_min;
      const outer_min = resizer.dataset.outer_min;

      const new_cover_height = cover_height + e.clientY - resizer_pos;

      const window_height = parseInt(document.body.clientHeight);

      if (
        new_cover_height > cover_min &&
        window_height - new_cover_height > outer_min
      ) {
        cover.style.height = `${new_cover_height}px`;
      }
    }

    resizer.addEventListener("mousedown", ds_mousedownHandler);
  }

  initResizeFn();
});
