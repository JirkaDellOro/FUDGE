"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference path="node_modules/electron/electron.d.ts"/>
const electron_1 = require("electron");
const url = require("url");
const path = require("path");
let window;
let secwindow;
// ipcMain.on('asynchronous-message', (event, arg) =>{
//     console.log(arg);
//     // event.reply('asynchronous-message', 'pong');
// })
// ipcMain.on('synchronous-message', (event, arg) =>{
//     console.log(arg);
//     event.returnValue = 'pong';
// })
electron_1.ipcMain.on('open-up', createSecondWindow);
function createWindow() {
    window = new electron_1.BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
        },
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
function createSecondWindow() {
    secwindow = new electron_1.BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
        },
    });
    secwindow.loadURL(url.format({
        pathname: path.join(__dirname, 'app.html'),
        protocol: 'file',
        slashes: true
    }));
    secwindow.webContents.toggleDevTools();
    secwindow.on('close', () => {
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