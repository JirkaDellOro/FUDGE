System.register(["electron"], function (exports_1, context_1) {
    "use strict";
    var electron_1, url, path, window;
    var __moduleName = context_1 && context_1.id;
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
    return {
        setters: [
            function (electron_1_1) {
                electron_1 = electron_1_1;
            }
        ],
        execute: function () {
            url = require("url");
            path = require("path");
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
        }
    };
});
//# sourceMappingURL=main.js.map