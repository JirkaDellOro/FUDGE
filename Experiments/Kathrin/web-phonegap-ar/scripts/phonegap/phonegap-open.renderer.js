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
const electron_1 = require("electron");
const phonegap_class_1 = require("./phonegap.class");
let pg;
window.addEventListener("load", () => {
    init();
});
function init() {
    const domAppDir = document.getElementById("app-dir");
    const domSubmitBtn = document.getElementById("open-phonegap-dir");
    domAppDir.addEventListener("change", (event) => {
        console.log("directory changed");
        document.querySelector(".chose-path").innerHTML = domAppDir.files[0].name;
        document.querySelector(".chose-path-container").classList.add("show");
    });
    domSubmitBtn.addEventListener("click", (event) => {
        const appDir = domAppDir.files[0].path;
        if (appDir == null) {
            alert("Please select app directory");
        }
        else {
            console.log("open phonegap project");
            openPhoneGapProject(appDir);
        }
    });
}
function openPhoneGapProject(dir) {
    return __awaiter(this, void 0, void 0, function* () {
        pg = new phonegap_class_1.PhoneGap();
        yield pg
            .openProject(dir)
            .then((opened) => {
            if (opened.getResult()) {
                sendPgObjectToMain();
            }
            else {
                alert(opened.getMessage());
            }
        })
            .catch((error) => {
            alert(error.message);
        });
    });
}
function sendPgObjectToMain() {
    electron_1.ipcRenderer.send("opened-pg-project", pg);
    let win = electron_1.remote.getCurrentWindow();
    win.close();
}
//# sourceMappingURL=phonegap-open.renderer.js.map