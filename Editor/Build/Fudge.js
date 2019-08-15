///<reference path="../../node_modules/electron/Electron.d.ts"/>
const { app, BrowserWindow, Menu } = require("electron");
var FudgeEditor;
(function (FudgeEditor) {
    app.addListener("ready", createWindow);
    app.addListener("window-all-closed", function () {
        if (process.platform !== "darwin")
            app.quit();
    });
    app.addListener("activate", function () {
        if (FudgeEditor.mainWindow === null)
            createWindow();
    });
    function createWindow() {
        // Create the browser window.
        FudgeEditor.mainWindow = new BrowserWindow({
            width: 1400, height: 600, webPreferences: {
                nodeIntegration: true //, preload: path.join(__dirname, 'preload.js')
            }
        });
        FudgeEditor.mainWindow.loadFile("../Html/Fudge.html");
        FudgeEditor.mainWindow.webContents.openDevTools();
        FudgeEditor.mainWindow.addListener("closed", function () {
            FudgeEditor.mainWindow = null;
        });
    }
})(FudgeEditor || (FudgeEditor = {}));
//# sourceMappingURL=Fudge.js.map