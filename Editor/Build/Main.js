var Fudge;
(function (Fudge) {
    let CONTEXTMENU;
    (function (CONTEXTMENU) {
        CONTEXTMENU[CONTEXTMENU["ADD_NODE"] = 0] = "ADD_NODE";
        CONTEXTMENU[CONTEXTMENU["ADD_COMPONENT"] = 1] = "ADD_COMPONENT";
    })(CONTEXTMENU = Fudge.CONTEXTMENU || (Fudge.CONTEXTMENU = {}));
    let MENU;
    (function (MENU) {
        MENU["QUIT"] = "quit";
        MENU["PROJECT_SAVE"] = "projectSave";
        MENU["PROJECT_OPEN"] = "projectOpen";
        MENU["NODE_DELETE"] = "nodeDelete";
        MENU["NODE_UPDATE"] = "nodeUpdate";
        MENU["DEVTOOLS_OPEN"] = "devtoolsOpen";
        MENU["PANEL_GRAPH_OPEN"] = "panelGraphOpen";
        MENU["PANEL_ANIMATION_OPEN"] = "panelAnimationOpen";
        MENU["PANEL_PROJECT_OPEN"] = "panelProjectOpen";
    })(MENU = Fudge.MENU || (Fudge.MENU = {}));
    let EVENT_EDITOR;
    (function (EVENT_EDITOR) {
        EVENT_EDITOR["REMOVE"] = "removeNode";
        EVENT_EDITOR["HIDE"] = "hideNode";
        EVENT_EDITOR["ACTIVATE_VIEWPORT"] = "activateViewport";
        EVENT_EDITOR["SET_GRAPH"] = "setGraph";
        EVENT_EDITOR["FOCUS_NODE"] = "focusNode";
        EVENT_EDITOR["SET_PROJECT"] = "setProject";
        EVENT_EDITOR["FOCUS_RESOURCE"] = "focusResource";
    })(EVENT_EDITOR = Fudge.EVENT_EDITOR || (Fudge.EVENT_EDITOR = {}));
    let PANEL;
    (function (PANEL) {
        PANEL["GRAPH"] = "PanelGraph";
        PANEL["PROJECT"] = "PanelProject";
    })(PANEL = Fudge.PANEL || (Fudge.PANEL = {}));
    let VIEW;
    (function (VIEW) {
        VIEW["HIERARCHY"] = "ViewHierarchy";
        VIEW["ANIMATION"] = "ViewAnimation";
        VIEW["RENDER"] = "ViewRender";
        VIEW["COMPONENTS"] = "ViewComponents";
        VIEW["CAMERA"] = "ViewCamera";
        VIEW["INTERNAL"] = "ViewInternal";
        VIEW["EXTERNAL"] = "ViewExternal";
        VIEW["PROPERTIES"] = "ViewProperties";
        VIEW["PREVIEW"] = "ViewPreview";
        // PROJECT = ViewProject,
        // SKETCH = ViewSketch,
        // MESH = ViewMesh,
    })(VIEW = Fudge.VIEW || (Fudge.VIEW = {}));
})(Fudge || (Fudge = {}));
///<reference types="../../node_modules/electron"/>
/**
 * Main electron application running node. Starts the browser window to contain Fudge and sets up the main menu.
 * See subfolder Fudge for most of the other functionality
 */
var Main;
///<reference types="../../node_modules/electron"/>
/**
 * Main electron application running node. Starts the browser window to contain Fudge and sets up the main menu.
 * See subfolder Fudge for most of the other functionality
 */
(function (Main) {
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
        console.log(`MenuSelect: Item-id=${Fudge.MENU[_item.id]}`);
        // TODO: simplify switch by usinge enums as messages
        switch (_item.id) {
            case Fudge.MENU.DEVTOOLS_OPEN:
                _window.webContents.openDevTools();
                break;
            case Fudge.MENU.QUIT:
                app.quit();
                break;
            default:
                send(_window, _item.id, null);
                break;
        }
    }
    function getMenuFudge() {
        const menu = [
            {
                label: "Project", submenu: [
                    { label: "Save", id: Fudge.MENU.PROJECT_SAVE, click: menuSelect, accelerator: process.platform == "darwin" ? "Command+S" : "Ctrl+S" },
                    { label: "Open", id: Fudge.MENU.PROJECT_OPEN, click: menuSelect, accelerator: process.platform == "darwin" ? "Command+O" : "Ctrl+O" },
                    { label: "Quit", id: Fudge.MENU.QUIT, click: menuSelect, accelerator: process.platform == "darwin" ? "Command+Q" : "Ctrl+Q" }
                ]
            },
            {
                label: "Edit", submenu: [
                    { label: "Project", id: Fudge.MENU.PANEL_PROJECT_OPEN, click: menuSelect, accelerator: process.platform == "darwin" ? "Command+G" : "Ctrl+P" },
                    { label: "Graph", id: Fudge.MENU.PANEL_GRAPH_OPEN, click: menuSelect, accelerator: process.platform == "darwin" ? "Command+G" : "Ctrl+G" },
                    { label: "Animation", id: Fudge.MENU.PANEL_ANIMATION_OPEN, click: menuSelect, accelerator: process.platform == "darwin" ? "Command+I" : "Ctrl+I" },
                    { label: "setRoot(testing)", id: Fudge.MENU.NODE_UPDATE, click: menuSelect, accelerator: process.platform == "darwin" ? "Command+U" : "Ctrl+U" }
                ]
            },
            {
                label: "Debug", submenu: [
                    { label: "DevTool", id: Fudge.MENU.DEVTOOLS_OPEN, click: menuSelect, accelerator: process.platform == "darwin" ? "F12" : "F12" }
                ]
            }
        ];
        return menu;
    }
    // #endregion
})(Main || (Main = {}));
//# sourceMappingURL=Main.js.map