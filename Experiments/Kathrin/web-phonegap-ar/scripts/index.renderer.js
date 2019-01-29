"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const phonegap_class_1 = require("./phonegap/phonegap.class");
let pg = new phonegap_class_1.PhoneGap();
const terminal = document.querySelector("#terminal");
const openedProject = document.querySelector("#opened-project");
const createdProject = document.querySelector("#created-project");
const loading = document.querySelector("#loading");
electron_1.ipcRenderer.on("opened-pg-project", (event, data) => {
    pg = new phonegap_class_1.PhoneGap("", "", data);
    openedProject.querySelector("span.project-name").innerHTML = pg.getAppName();
    if (!openedProject.classList.contains("show")) {
        openedProject.classList.add("show");
    }
    showPgProjectBtns();
});
electron_1.ipcRenderer.on("created-pg-project", (event, data) => {
    pg = new phonegap_class_1.PhoneGap("", "", data);
    createdProject.querySelector("span.project-name").innerHTML = pg.getAppName();
    if (!createdProject.classList.contains("show")) {
        createdProject.classList.add("show");
    }
    showPgProjectBtns();
});
function showPgProjectBtns() {
    const projectBtnContainer = document.querySelector("#project-btn-container");
    if (!projectBtnContainer.classList.contains("show")) {
        projectBtnContainer.classList.add("show");
    }
}
const servePortInput = document.querySelector("#serve-port");
const serveProjectBtn = document.querySelector("#serve-project");
const buildProjectBtn = document.querySelector("#build-project");
serveProjectBtn.addEventListener("click", (event) => {
    pg.serveProject(parseInt(servePortInput.nodeValue));
});
buildProjectBtn.addEventListener("click", (event) => {
    loading.classList.remove("hide");
    pg.buildProjectForAndroid(terminal);
});
terminal.addEventListener("process-data", (event) => {
    let child = document.createElement("div");
    child.classList.add("process-data");
    child.innerHTML = event.detail.data;
    terminal.appendChild(child);
    if (terminal.classList.contains("hide")) {
        terminal.classList.remove("hide");
    }
});
terminal.addEventListener("process-end", (event) => {
    let child = document.createElement("div");
    child.classList.add("process-data");
    if (event.detail.data == 0) {
        child.innerHTML = "Exit code: " + event.detail.data + " build successful";
    }
    else {
        child.innerHTML = "Exit code: " + event.detail.data + " something went wrong";
    }
    terminal.appendChild(child);
    loading.classList.add("hide");
    if (terminal.classList.contains("hide")) {
        terminal.classList.remove("hide");
    }
});
//# sourceMappingURL=index.renderer.js.map