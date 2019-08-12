/// <reference path="node_modules/electron/electron.d.ts"/>
// import {app, BrowserWindow, ipcMain, ipcRenderer} from 'electron'
let electron = require('electron');
let ipcRenderer = electron.ipcRenderer;
let windowButton = document.createElement("button");
windowButton.innerHTML = "Open up!";
windowButton.addEventListener("click", sendWindowRequest);
window.addEventListener("DOMContentLoaded", start);
function start(_event) {
    document.body.append(windowButton);
}
function sendWindowRequest() {
    ipcRenderer.send('open-up');
}
// console.log(ipcRenderer.sendSync('synchronous-message', 'ping')) // prints "pong"
// ipcRenderer.on('asynchronous-reply', (event, arg) => {
//   console.log(arg) // prints "pong"
// })
// ipcRenderer.send('asynchronous-message', 'ping')
//# sourceMappingURL=app.js.map