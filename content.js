let selectionTimeout;
let ui;

document.addEventListener("selectionchange", () => {
  clearTimeout(selectionTimeout);
  selectionTimeout = setTimeout(() => {
    const selection = window.getSelection().toString().trim();
    if (selection) {
      if (!ui) {
        ui = document.createElement("div");
        ui.style.position = "absolute";
        ui.style.top = "0";
        ui.style.left = "0";
        ui.style.zIndex = "99999";
        ui.style.display = "flex";
        ui.style.flexDirection = "column";
        ui.style.alignItems = "center";
        ui.style.backgroundColor = "#fff";
        ui.style.borderRadius = "5px";
        ui.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.5)";
        ui.innerHTML = "<button style='margin: 5px;'>Option 1</button><button style='margin: 5px;'>Option 2</button>";
        document.body.appendChild(ui);
      }
      const range = window.getSelection().getRangeAt(0);
      const rect = range.getBoundingClientRect();
      ui.style.top = `${rect.bottom}px`;
      ui.style.left = `${rect.right + 10}px`;
    } else {
      if (ui) {
        ui.remove();
        ui = null;
      }
    }
  }, 200);
});

document.addEventListener("mousedown", (event) => {
  if (ui && !ui.contains(event.target)) {
    ui.remove();
    ui = null;
  }
});