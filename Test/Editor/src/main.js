"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference path="../node_modules/electron/electron.d.ts"/>
const electron_1 = require("electron");
const url = require("url");
const path = require("path");
let window;
function createWindow() {
    window = new electron_1.BrowserWindow({
        width: 1920,
        height: 1080,
    });
    window.loadURL(url.format({
        pathname: path.join(__dirname, 'app.html'),
        protocol: 'file',
        slashes: true
    }));
    window.webContents.toggleDevTools();
    window.on('close', () => {
        window = null;
    });
}
electron_1.app.on('ready', createWindow);
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.app.on('activate', () => {
    if (window === null) {
        createWindow();
    }
});
//# sourceMappingURL=main.js.map