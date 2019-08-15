///<reference path="../../node_modules/electron/Electron.d.ts"/>
const { app, BrowserWindow, Menu } = require("electron");
var ElectronFileIo;
(function (ElectronFileIo) {
    app.addListener("ready", createWindow);
    app.addListener("window-all-closed", function () {
        if (process.platform !== "darwin")
            app.quit();
    });
    app.addListener("activate", function () {
        if (ElectronFileIo.mainWindow === null)
            createWindow();
    });
    function createWindow() {
        // Create the browser window.
        ElectronFileIo.mainWindow = new BrowserWindow({
            width: 1400, height: 600, webPreferences: {
                nodeIntegration: true //, preload: path.join(__dirname, 'preload.js')
            }
        });
        ElectronFileIo.mainWindow.loadFile("../Html/Fudge.html");
        ElectronFileIo.mainWindow.webContents.openDevTools();
        ElectronFileIo.mainWindow.addListener("closed", function () {
            ElectronFileIo.mainWindow = null;
        });
    }
})(ElectronFileIo || (ElectronFileIo = {}));
//# sourceMappingURL=Fudge.js.map