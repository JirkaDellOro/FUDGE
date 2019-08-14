///<reference path="../../../node_modules/electron/Electron.d.ts"/>
const { app, BrowserWindow, Menu } = require("electron");
var ƒBug;
(function (ƒBug) {
    app.addListener("ready", createWindow);
    app.addListener("window-all-closed", function () {
        if (process.platform !== "darwin")
            app.quit();
    });
    app.addListener("activate", function () {
        if (ƒBug.mainWindow === null)
            createWindow();
    });
    function createWindow() {
        // Create the browser window.
        ƒBug.mainWindow = new BrowserWindow({
            width: 1400, height: 600, webPreferences: {
                nodeIntegration: true //, preload: path.join(__dirname, 'preload.js')
            }
        });
        ƒBug.mainWindow.loadFile("Main.html");
        ƒBug.mainWindow.webContents.openDevTools();
        ƒBug.mainWindow.addListener("closed", function () {
            ƒBug.mainWindow = null;
        });
    }
})(ƒBug || (ƒBug = {}));
//# sourceMappingURL=Main.js.map