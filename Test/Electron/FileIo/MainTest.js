///<reference path="../../../node_modules/electron/Electron.d.ts"/>
const { app, BrowserWindow } = require("electron");
// const { path } = require("path");
var ElectronFileIo;
// const { path } = require("path");
(function (ElectronFileIo) {
    let mainWindow;
    app.addListener("ready", createWindow);
    app.addListener("window-all-closed", function () {
        if (process.platform !== "darwin")
            app.quit();
    });
    app.addListener("activate", function () {
        if (mainWindow === null)
            createWindow();
    });
    function createWindow() {
        // Create the browser window.
        mainWindow = new BrowserWindow({
            width: 1400, height: 600, webPreferences: {
                nodeIntegration: true //, preload: path.join(__dirname, 'preload.js')
            }
        });
        mainWindow.loadFile("Main.html");
        mainWindow.webContents.openDevTools();
        mainWindow.addListener("closed", function () {
            mainWindow = null;
        });
    }
})(ElectronFileIo || (ElectronFileIo = {}));
//# sourceMappingURL=MainTest.js.map