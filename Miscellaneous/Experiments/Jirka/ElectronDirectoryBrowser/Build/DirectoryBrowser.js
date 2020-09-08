///<reference types="../../../../../node_modules/electron/Electron"/>
var Fudge;
///<reference types="../../../../../node_modules/electron/Electron"/>
(function (Fudge) {
    const { app, BrowserWindow, Menu, ipcMain } = require("electron");
    //#region Events
    ipcMain.addListener("openView", function (_event, ..._args) {
        // let view: View = addView(_type);
        console.log(_args);
    });
    ipcMain.on("getNode", function (_event, ..._args) {
        console.log("getNode", _event);
        // send(viewProject, "sendNode", _event["sender"].id);
    });
    // app.addListener("ready", createViewProject);
    app.addListener("window-all-closed", function () {
        console.log("Quit");
        if (process.platform !== "darwin")
            app.quit();
    });
    app.addListener("activate", function () {
        console.log("Activate");
        // if (viewProject === null) createViewProject();
    });
    app.addListener("ready", function () {
        console.log("Start");
        addView();
    });
    //#endregion
    //#region View 
    function addView(width = 800, height = 600) {
        let window = new BrowserWindow({
            width: width, height: height, webPreferences: {
                nodeIntegration: true
            }
        });
        window.once("focus", setMenu);
        window.webContents.openDevTools();
        window.loadFile("../Html/DirectoryBrowser.html");
        // views.push(window);
        // let view: View = { type: _type, window: window };
        // views.set(window, view);
        // console.info("View", views.size);
        // return view;
    }
    // #endregion
    //#region Menus  
    function setMenu(_event) {
        let window = _event["sender"];
        const viewMenu = Menu.buildFromTemplate(getMenuProject());
        window.setMenu(viewMenu);
    }
    // TODO: break up this function in subfunctions for the various views
    function menuSelect(_item, _window, _event) {
        console.log(`MenuSelect: Item=${_item.id} | Window=${_window}`);
        switch (Number(_item.id)) {
            default:
                break;
        }
    }
    function getMenuProject() {
        const menu = [
            {
                label: "Project", submenu: [
                    {
                        label: "Save", click: menuSelect, accelerator: process.platform == "darwin" ? "Command+S" : "Ctrl+S"
                    },
                    {
                        label: "Open", click: menuSelect, accelerator: process.platform == "darwin" ? "Command+O" : "Ctrl+O"
                    },
                    {
                        label: "Quit", click: menuSelect, accelerator: process.platform == "darwin" ? "Command+Q" : "Ctrl+Q"
                    }
                ]
            },
            {
                label: "View", submenu: [
                    {
                        label: "Node", click: menuSelect, accelerator: process.platform == "darwin" ? "Command+N" : "Ctrl+N"
                    }
                ]
            }
        ];
        return menu;
    }
    function getMenuNode() {
        const menu = [
            {
                label: "Node", submenu: [
                    {
                        label: "Update", click: menuSelect, accelerator: process.platform == "darwin" ? "Command+N" : "Ctrl+U"
                    },
                    {
                        label: "Delete", click: menuSelect, accelerator: process.platform == "darwin" ? "Command+N" : "Ctrl+D"
                    }
                ]
            }
        ];
        return menu;
    }
    // #endregion
})(Fudge || (Fudge = {}));
//# sourceMappingURL=DirectoryBrowser.js.map