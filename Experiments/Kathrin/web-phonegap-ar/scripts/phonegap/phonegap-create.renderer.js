"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const phonegap_class_1 = require("./phonegap.class");
// namespace WebPhonegapAR {
// const PhoneGap = require('./phonegap.class');
window.addEventListener('load', () => {
    init();
});
function init() {
    const domAppName = document.getElementById('app-name');
    // const domAppDir: HTMLInputElement = document.getElementById('app-dir') as HTMLElement;
    const domAppDir = document.getElementById('app-dir');
    const domSubmitBtn = document.getElementById('create-phonegap-dir');
    domSubmitBtn.addEventListener('click', (event) => {
        const appName = domAppName.value;
        const appDir = domAppDir.files[0].path;
        if (appName == null && appDir == null) {
            alert('Bitte App-Name und App-Verzeichnis angeben.');
        }
        else if (appName == null) {
            alert('Bitte App-Name angeben.');
        }
        else if (appDir == null) {
            alert('Bitte App-Verzeichnis angeben');
        }
        else {
            createPhoneGapProject(appName, appDir);
        }
    });
}
function createPhoneGapProject(name, dir) {
    console.log(dir);
    const pg = new phonegap_class_1.PhoneGap(name, dir);
    pg.createProject();
}
// }
//# sourceMappingURL=phonegap-create.renderer.js.map