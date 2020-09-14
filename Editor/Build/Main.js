///<reference types="../../node_modules/electron"/>
var Main;
///<reference types="../../node_modules/electron"/>
(function (Main) {
    //#region Types and Data
    let MENU;
    (function (MENU) {
        MENU[MENU["QUIT"] = 0] = "QUIT";
        MENU[MENU["PROJECT_SAVE"] = 1] = "PROJECT_SAVE";
        MENU[MENU["PROJECT_OPEN"] = 2] = "PROJECT_OPEN";
        MENU[MENU["PANEL_GRAPH_OPEN"] = 3] = "PANEL_GRAPH_OPEN";
        MENU[MENU["NODE_DELETE"] = 4] = "NODE_DELETE";
        MENU[MENU["NODE_UPDATE"] = 5] = "NODE_UPDATE";
        MENU[MENU["DEVTOOLS_OPEN"] = 6] = "DEVTOOLS_OPEN";
        MENU[MENU["PANEL_ANIMATION_OPEN"] = 7] = "PANEL_ANIMATION_OPEN";
    })(MENU || (MENU = {}));
    const { app, BrowserWindow, Menu, ipcMain } = require("electron");
    let fudge;
    let defaultWidth = 800;
    let defaultHeight = 600;
    //#endregion
    //#region Events
    app.addListener("ready", createFudge);
    app.addListener("window-all-closed", function () {
        console.log("Quit");
        if (process.platform !== "darwin")
            app.quit();
    });
    app.addListener("activate", function () {
        console.log("Activate");
        if (fudge === null)
            createFudge();
    });
    function send(_window, _message, ..._args) {
        console.log(`Send message ${_message}`);
        _window.webContents.send(_message, _args);
    }
    //#endregion
    //#region Window
    function createFudge() {
        console.log("createFudge");
        fudge = addWindow("../Html/Fudge.html");
        const menu = Menu.buildFromTemplate(getMenuFudge());
        fudge.setMenu(menu);
    }
    function addWindow(_url, width = defaultWidth, height = defaultHeight) {
        let window = new BrowserWindow({
            width: width, height: height, webPreferences: {
                nodeIntegration: true,
                enableRemoteModule: true
            }
        });
        window.webContents.openDevTools();
        window.loadFile(_url);
        return window;
    }
    // #endregion
    //#region Menus  
    function menuSelect(_item, _window, _event) {
        console.log(`MenuSelect: Item-id=${MENU[_item.id]}`);
        switch (Number(_item.id)) {
            case MENU.PROJECT_OPEN:
                send(_window, "open", null);
                break;
            case MENU.PROJECT_SAVE:
                send(_window, "save", null);
                break;
            case MENU.PANEL_GRAPH_OPEN:
                send(_window, "openPanelGraph", null);
                break;
            case MENU.NODE_UPDATE:
                send(_window, "updateNode", null);
                break;
            case MENU.DEVTOOLS_OPEN:
                _window.webContents.openDevTools();
                break;
            case MENU.PANEL_ANIMATION_OPEN:
                send(_window, "openPanelAnimation");
                break;
            case MENU.QUIT:
                app.quit();
                break;
            default:
                break;
        }
    }
    function getMenuFudge() {
        const menu = [
            {
                label: "Project", submenu: [
                    {
                        label: "Save", id: String(MENU.PROJECT_SAVE), click: menuSelect, accelerator: process.platform == "darwin" ? "Command+S" : "Ctrl+S"
                    },
                    {
                        label: "Open", id: String(MENU.PROJECT_OPEN), click: menuSelect, accelerator: process.platform == "darwin" ? "Command+O" : "Ctrl+O"
                    },
                    {
                        label: "Quit", id: String(MENU.QUIT), click: menuSelect, accelerator: process.platform == "darwin" ? "Command+Q" : "Ctrl+Q"
                    }
                ]
            },
            {
                label: "View", submenu: [
                    {
                        label: "Graph", id: String(MENU.PANEL_GRAPH_OPEN), click: menuSelect, accelerator: process.platform == "darwin" ? "Command+G" : "Ctrl+G"
                    },
                    {
                        label: "setRoot(testing)", id: String(MENU.NODE_UPDATE), click: menuSelect, accelerator: process.platform == "darwin" ? "Command+U" : "Ctrl+U"
                    },
                    {
                        label: "Animation", id: String(MENU.PANEL_ANIMATION_OPEN), click: menuSelect, accelerator: process.platform == "darwin" ? "Command+I" : "Ctrl+I"
                    }
                ]
            },
            {
                label: "Debug", submenu: [
                    {
                        label: "DevTool", id: String(MENU.DEVTOOLS_OPEN), click: menuSelect, accelerator: process.platform == "darwin" ? "F12" : "F12"
                    }
                ]
            }
        ];
        return menu;
    }
    // #endregion
})(Main || (Main = {}));
//# sourceMappingURL=Main.js.map