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
let pg;
window.addEventListener("load", () => {
    init();
});
function init() {
    const domAppName = document.getElementById("app-name");
    // const domAppDir: HTMLInputElement = document.getElementById('app-dir') as HTMLElement;
    const domAppDir = document.getElementById("app-dir");
    const domSubmitBtn = document.getElementById("create-phonegap-dir");
    domSubmitBtn.addEventListener("click", (event) => {
        const appName = domAppName.value;
        const appDir = domAppDir.files[0].path;
        if (appName == null && appDir == null) {
            alert("Bitte App-Name und App-Verzeichnis angeben.");
        }
        else if (appName == null) {
            alert("Bitte App-Name angeben.");
        }
        else if (appDir == null) {
            alert("Bitte App-Verzeichnis angeben");
        }
        else {
            createPhoneGapProject(appName, appDir);
        }
    });
}
function createPhoneGapProject(name, dir) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(dir);
        pg = new phonegap_class_1.PhoneGap(name, dir);
        try {
            const projectCreated = yield pg.createProject();
            // if(projectCreated) {
            createServeProjectBtn();
            // }
        }
        catch (error) {
            console.error(error);
        }
    });
}
function createServeProjectBtn() {
    let body = document.getElementsByTagName("body")[0];
    let runBtn = document.createElement("button");
    runBtn.setAttribute("id", "serve-phonegap-btn");
    runBtn.innerHTML = "Serve project";
    runBtn.addEventListener("click", function (event) {
        pg.serveProject();
    });
    body.appendChild(document.createElement("br"));
    body.appendChild(runBtn);
}
//# sourceMappingURL=phonegap-create.renderer.js.map