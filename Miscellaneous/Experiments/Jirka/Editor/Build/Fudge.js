///<reference types="../../node_modules/electron/Electron"/>
var Fudge;
///<reference types="../../node_modules/electron/Electron"/>
(function (Fudge) {
    //#region Types and Data
    // TODO: enums should be available to all windows and not defined twice
    let VIEW;
    (function (VIEW) {
        VIEW["PROJECT"] = "viewProject";
        VIEW["NODE"] = "viewNode";
        VIEW["ANIMATION"] = "viewAnimation";
        VIEW["SKETCH"] = "viewSketch";
        VIEW["MESH"] = "viewMesh";
    })(VIEW || (VIEW = {}));
    let MENU;
    (function (MENU) {
        MENU[MENU["QUIT"] = 0] = "QUIT";
        MENU[MENU["PROJECT_SAVE"] = 1] = "PROJECT_SAVE";
        MENU[MENU["PROJECT_OPEN"] = 2] = "PROJECT_OPEN";
        MENU[MENU["VIEW_NODE_OPEN"] = 3] = "VIEW_NODE_OPEN";
        MENU[MENU["NODE_DELETE"] = 4] = "NODE_DELETE";
        MENU[MENU["NODE_UPDATE"] = 5] = "NODE_UPDATE";
    })(MENU || (MENU = {}));
    const url = new Map([
        [VIEW.PROJECT, "../Html/ViewProject.html"],
        [VIEW.NODE, "../Html/ViewNode.html"]
    ]);
    const menu = { [VIEW.PROJECT]: getMenuProject(), [VIEW.NODE]: getMenuNode() };
    const { app, BrowserWindow, Menu, ipcMain } = require("electron");
    let viewProject;
    let views = new Map();
    let defaultWidth = 800;
    let defaultHeight = 600;
    //#endregion
    //#region Events
    ipcMain.addListener("openView", function (_event, _type, ..._args) {
        let view = addView(_type);
    });
    ipcMain.on("getNode", function (_event, ..._args) {
        console.log("getNode", _event);
        send(viewProject, "sendNode", _event["sender"].id);
    });
    app.addListener("ready", createViewProject);
    app.addListener("window-all-closed", function () {
        console.log("Quit");
        if (process.platform !== "darwin")
            app.quit();
    });
    app.addListener("activate", function () {
        console.log("Activate");
        if (viewProject === null)
            createViewProject();
    });
    function send(_view, _message, ..._args) {
        console.log(`Send message to ${_view.type}: ${_message}`);
        _view.window.webContents.send(_message, _args);
    }
    //#endregion
    //#region View
    function createViewProject() {
        console.log("CreateViewProject");
        viewProject = addView(VIEW.PROJECT);
    }
    function removeView(_event) {
        console.log("RemoveView");
        let window = _event["sender"];
        views.delete(window);
        console.info("Views", views.size);
        if (window == viewProject.window)
            app.emit("window-all-closed");
    }
    function addView(_type, width = defaultWidth, height = defaultHeight) {
        let window = new BrowserWindow({
            width: width, height: height, webPreferences: {
                nodeIntegration: true
            }
        });
        window.once("focus", setMenu);
        window.addListener("closed", removeView);
        window.webContents.openDevTools();
        window.loadFile(url.get(_type));
        // views.push(window);
        let view = { type: _type, window: window };
        views.set(window, view);
        console.info("View", views.size);
        return view;
    }
    // #endregion
    //#region Menus  
    function setMenu(_event) {
        let window = _event["sender"];
        let view = views.get(window);
        const viewMenu = Menu.buildFromTemplate(menu[view.type]);
        window.setMenu(viewMenu);
    }
    // TODO: break up this function in subfunctions for the various views
    function menuSelect(_item, _window, _event) {
        console.log(`MenuSelect: Item-id=${MENU[_item.id]} | View-type=${views.get(_window).type}`);
        switch (Number(_item.id)) {
            case MENU.PROJECT_OPEN:
                send(viewProject, "open", null);
                break;
            case MENU.PROJECT_SAVE:
                send(viewProject, "save", null);
                break;
            case MENU.VIEW_NODE_OPEN:
                addView(VIEW.NODE);
                break;
            case MENU.NODE_UPDATE:
                send(views.get(_window), "update", null);
                break;
            case MENU.NODE_DELETE:
                send(views.get(_window), "delete", null);
                break;
            case MENU.QUIT:
                app.quit();
                break;
            default:
                break;
        }
    }
    function getMenuProject() {
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
                        label: "Update", id: String(MENU.NODE_UPDATE), click: menuSelect, accelerator: process.platform == "darwin" ? "Command+N" : "Ctrl+U"
                    },
                    {
                        label: "Delete", id: String(MENU.NODE_DELETE), click: menuSelect, accelerator: process.platform == "darwin" ? "Command+N" : "Ctrl+D"
                    }
                    // ,
                    // {
                    //   label: "Delete Node (Del)", click(): void { send(viewProject, "open", null); }
                    // },
                    // {
                    //   label: "Convert to Ressource (Ctrl+R)", click(): void { send(viewProject, "open", null); }
                    // }
                ]
            }
        ];
        return menu;
    }
    // #endregion
})(Fudge || (Fudge = {}));
//# sourceMappingURL=Fudge.js.map