///<reference types="../../node_modules/electron/Electron"/>
var Main;
///<reference types="../../node_modules/electron/Electron"/>
(function (Main) {
    //#region Types and Data
    let MENU;
    (function (MENU) {
        MENU[MENU["QUIT"] = 0] = "QUIT";
        MENU[MENU["PROJECT_SAVE"] = 1] = "PROJECT_SAVE";
        MENU[MENU["PROJECT_OPEN"] = 2] = "PROJECT_OPEN";
        MENU[MENU["VIEW_NODE_OPEN"] = 3] = "VIEW_NODE_OPEN";
        MENU[MENU["NODE_DELETE"] = 4] = "NODE_DELETE";
        MENU[MENU["NODE_UPDATE"] = 5] = "NODE_UPDATE";
        MENU[MENU["DEVTOOLS_OPEN"] = 6] = "DEVTOOLS_OPEN";
        MENU[MENU["VIEW_ANIMATION"] = 7] = "VIEW_ANIMATION";
        MENU[MENU["PHYSICS_DEBUG"] = 8] = "PHYSICS_DEBUG";
        MENU[MENU["PHYSICS_DEBUG_M1"] = 9] = "PHYSICS_DEBUG_M1";
        MENU[MENU["PHYSICS_DEBUG_M2"] = 10] = "PHYSICS_DEBUG_M2";
        MENU[MENU["PHYSICS_DEBUG_M3"] = 11] = "PHYSICS_DEBUG_M3";
        MENU[MENU["PHYSICS_DEBUG_M4"] = 12] = "PHYSICS_DEBUG_M4";
        MENU[MENU["PHYSICS_DEBUG_M5"] = 13] = "PHYSICS_DEBUG_M5";
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
                nodeIntegration: true
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
            case MENU.VIEW_NODE_OPEN:
                send(_window, "openViewNode", null);
                break;
            case MENU.NODE_UPDATE:
                send(_window, "updateNode", null);
                break;
            case MENU.DEVTOOLS_OPEN:
                _window.webContents.openDevTools();
                break;
            case MENU.VIEW_ANIMATION:
                send(_window, "openAnimationPanel");
                break;
            case MENU.QUIT:
                app.quit();
                break;
            //Physics Debug Menu Options | Marko Fehrenbach, HFU 2020  
            case MENU.PHYSICS_DEBUG:
                send(_window, "togglePhysicsDebugView");
                break;
            case MENU.PHYSICS_DEBUG_M1:
                send(_window, "PhysicsViewMode_1");
                break;
            case MENU.PHYSICS_DEBUG_M2:
                send(_window, "PhysicsViewMode_2");
                break;
            case MENU.PHYSICS_DEBUG_M3:
                send(_window, "PhysicsViewMode_3");
                break;
            case MENU.PHYSICS_DEBUG_M4:
                send(_window, "PhysicsViewMode_4");
                break;
            case MENU.PHYSICS_DEBUG_M5:
                send(_window, "PhysicsViewMode_5");
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
                        label: "Node", id: String(MENU.VIEW_NODE_OPEN), click: menuSelect, accelerator: process.platform == "darwin" ? "Command+N" : "Ctrl+N"
                    },
                    {
                        label: "setRoot(testing)", id: String(MENU.NODE_UPDATE), click: menuSelect, accelerator: process.platform == "darwin" ? "Command+U" : "Ctrl+U"
                    },
                    {
                        label: "Animation", id: String(MENU.VIEW_ANIMATION), click: menuSelect, accelerator: process.platform == "darwin" ? "Command+I" : "Ctrl+I"
                    }
                ]
            },
            {
                label: "Debug", submenu: [
                    {
                        label: "DevTool", id: String(MENU.DEVTOOLS_OPEN), click: menuSelect, accelerator: process.platform == "darwin" ? "F12" : "F12"
                    },
                    { type: 'separator' },
                    {
                        label: "Physic Debug View", id: String(MENU.PHYSICS_DEBUG), click: menuSelect, accelerator: "CmdOrCtrl+P"
                    }, {
                        label: "Physics Debug Mode", 'submenu': [{
                                'label': 'Colliders', id: String(MENU.PHYSICS_DEBUG_M1), click: menuSelect
                            }, {
                                'label': 'Colliders and Joints (Default)', id: String(MENU.PHYSICS_DEBUG_M2), click: menuSelect
                            }, {
                                'label': 'Bounding Boxes', id: String(MENU.PHYSICS_DEBUG_M3), click: menuSelect
                            }, {
                                'label': 'Contacts', id: String(MENU.PHYSICS_DEBUG_M4), click: menuSelect
                            },
                            {
                                'label': 'Show Physics Objects ONLY', id: String(MENU.PHYSICS_DEBUG_M5), click: menuSelect
                            }]
                    },
                ]
            }
        ];
        return menu;
    }
    // #endregion
    function test() {
        console.log("test");
    }
})(Main || (Main = {}));
//# sourceMappingURL=Main.js.map