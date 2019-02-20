"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const phonegap_class_1 = require("./phonegap.class");
const electron_1 = require("electron");
let pg;
window.addEventListener("load", () => {
    init();
});
function init() {
    const domAppName = document.getElementById("app-name");
    const domAppDir = document.getElementById("app-dir");
    const domSubmitBtn = document.getElementById("create-phonegap-dir");
    domAppDir.addEventListener("change", (event) => {
        document.querySelector(".chose-path").innerHTML = domAppDir.files[0].name;
        document.querySelector(".chose-path-container").classList.add("show");
    });
    domSubmitBtn.addEventListener("click", (event) => {
        const appName = domAppName.value;
        const appDir = domAppDir.files[0].path;
        if ((appName === null || appName === "") && appDir == null) {
            alert("Please give the project a name and select a target path.");
        }
        else if (appName === null || appName === "") {
            alert("Please give the project a name.");
        }
        else if (appDir == null) {
            alert("Please select a path for saving your new project.");
        }
        else {
            createPhoneGapProject(appName, appDir);
        }
    });
}
function createPhoneGapProject(name, dir) {
    return __awaiter(this, void 0, void 0, function* () {
        let loading = document.querySelector("#loading");
        loading.classList.remove("hide");
        pg = new phonegap_class_1.PhoneGap(name, dir);
        pg.createProject()
            .then((created) => {
            if (created.getResult()) {
                electron_1.ipcRenderer.send("created-pg-project", pg);
                let win = electron_1.remote.getCurrentWindow();
                loading.classList.add("hide");
                win.close();
            }
            else {
                loading.classList.add("hide");
                alert(created.getMessage());
            }
        })
            .catch(error => {
            loading.classList.add("hide");
            console.log(error);
        });
    });
}
//# sourceMappingURL=phonegap-create.renderer.js.map