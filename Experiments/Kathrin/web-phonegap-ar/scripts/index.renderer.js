"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const phonegap_class_1 = require("./phonegap/phonegap.class");
let pg = new phonegap_class_1.PhoneGap();
const projectInfo = document.querySelector("#project-info");
const openedProject = document.querySelector("#opened-project");
// const projectInfo: HTMLElement = document.querySelector('#show-project-info');
electron_1.ipcRenderer.on("opened-pg-project", (event, data) => {
    pg = new phonegap_class_1.PhoneGap("", "", data);
    projectInfo.classList.add("show");
    openedProject.querySelector("span.project-name").innerHTML = pg.getAppName();
    showPgProjectBtns();
});
function showPgProjectBtns() {
    const projectBtnContainer = document.querySelector("#project-btn-container");
    const servePortInput = document.querySelector("#serve-port");
    const serveProjectBtn = document.querySelector("#serve-project");
    projectBtnContainer.classList.add("show");
    serveProjectBtn.addEventListener("click", (event) => {
        pg.serveProject(parseInt(servePortInput.nodeValue));
    });
}
//# sourceMappingURL=index.renderer.js.map