var Fudge;
(function (Fudge) {
    let CONTEXTMENU;
    (function (CONTEXTMENU) {
        // SKETCH = ViewSketch,
        CONTEXTMENU[CONTEXTMENU["ADD_NODE"] = 0] = "ADD_NODE";
        CONTEXTMENU[CONTEXTMENU["ADD_COMPONENT"] = 1] = "ADD_COMPONENT";
        CONTEXTMENU[CONTEXTMENU["ADD_COMPONENT_SCRIPT"] = 2] = "ADD_COMPONENT_SCRIPT";
        CONTEXTMENU[CONTEXTMENU["EDIT"] = 3] = "EDIT";
        CONTEXTMENU[CONTEXTMENU["CREATE_MESH"] = 4] = "CREATE_MESH";
        CONTEXTMENU[CONTEXTMENU["CREATE_MATERIAL"] = 5] = "CREATE_MATERIAL";
        CONTEXTMENU[CONTEXTMENU["CREATE_GRAPH"] = 6] = "CREATE_GRAPH";
        CONTEXTMENU[CONTEXTMENU["REMOVE_COMPONENT"] = 7] = "REMOVE_COMPONENT";
        CONTEXTMENU[CONTEXTMENU["ADD_JOINT"] = 8] = "ADD_JOINT";
        CONTEXTMENU[CONTEXTMENU["TRANSLATE"] = 9] = "TRANSLATE";
        CONTEXTMENU[CONTEXTMENU["ROTATE"] = 10] = "ROTATE";
        CONTEXTMENU[CONTEXTMENU["SCALE"] = 11] = "SCALE";
    })(CONTEXTMENU = Fudge.CONTEXTMENU || (Fudge.CONTEXTMENU = {}));
    let MENU;
    (function (MENU) {
        MENU["QUIT"] = "quit";
        MENU["PROJECT_NEW"] = "projectNew";
        MENU["PROJECT_SAVE"] = "projectSave";
        MENU["PROJECT_LOAD"] = "projectLoad";
        MENU["DEVTOOLS_OPEN"] = "devtoolsOpen";
        MENU["PANEL_GRAPH_OPEN"] = "panelGraphOpen";
        MENU["PANEL_ANIMATION_OPEN"] = "panelAnimationOpen";
        MENU["PANEL_PROJECT_OPEN"] = "panelProjectOpen";
        MENU["PANEL_HELP_OPEN"] = "panelHelpOpen";
        MENU["FULLSCREEN"] = "fullscreen";
    })(MENU = Fudge.MENU || (Fudge.MENU = {}));
    let EVENT_EDITOR;
    (function (EVENT_EDITOR) {
        EVENT_EDITOR["SET_GRAPH"] = "setGraph";
        EVENT_EDITOR["FOCUS_NODE"] = "focusNode";
        EVENT_EDITOR["SET_PROJECT"] = "setProject";
        EVENT_EDITOR["UPDATE"] = "update";
        EVENT_EDITOR["REFRESH"] = "refresh";
        EVENT_EDITOR["DESTROY"] = "destroy";
        EVENT_EDITOR["CLEAR_PROJECT"] = "clearProject";
        EVENT_EDITOR["TRANSFORM"] = "transform";
    })(EVENT_EDITOR = Fudge.EVENT_EDITOR || (Fudge.EVENT_EDITOR = {}));
    let PANEL;
    (function (PANEL) {
        PANEL["GRAPH"] = "PanelGraph";
        PANEL["PROJECT"] = "PanelProject";
        PANEL["HELP"] = "PanelHelp";
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
        VIEW["SCRIPT"] = "ViewScript";
        // SKETCH = ViewSketch,
        // MESH = ViewMesh,
    })(VIEW = Fudge.VIEW || (Fudge.VIEW = {}));
    let TRANSFORM;
    (function (TRANSFORM) {
        TRANSFORM["TRANSLATE"] = "translate";
        TRANSFORM["ROTATE"] = "rotate";
        TRANSFORM["SCALE"] = "scale";
    })(TRANSFORM = Fudge.TRANSFORM || (Fudge.TRANSFORM = {}));
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
    //#region Types and Data
    const { app, BrowserWindow, Menu, ipcMain } = require("electron");
    // TODO: use the following line in Electron version 14 and up
    // require("@electron/remote/main").initialize();
    let fudge;
    let defaultWidth = 800;
    let defaultHeight = 600;
    let saved = false;
    //#endregion
    // app.commandLine.appendSwitch("autoplay-policy", "no-user-gesture-required");
    //#region Events 
    app.addListener("ready", createFudge);
    app.addListener("activate", function () {
        console.log("Activate");
        if (fudge === null)
            createFudge();
    });
    ipcMain.addListener("enableMenuItem", function (_event, _args) {
        Menu.getApplicationMenu().getMenuItemById(_args["item"]).enabled = _args["on"];
    });
    function quit(_event) {
        if (!saved) {
            console.log("Trying to save state!", _event.type);
            // _event.preventDefault();
            send(fudge, Fudge.MENU.QUIT);
            saved = true;
            if (process.platform !== "darwin")
                app.quit();
        }
    }
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
        // fudge.setMenu(menu);
        Menu.setApplicationMenu(menu);
        fudge.on("close", quit);
    }
    function addWindow(_url, width = defaultWidth, height = defaultHeight) {
        let window = new BrowserWindow({
            width: width,
            height: height,
            // fullscreen: true,
            webPreferences: {
                nodeIntegration: true,
                enableRemoteModule: true,
                contextIsolation: false
            }
        });
        window.webContents.openDevTools();
        window.loadFile(_url);
        window.maximize();
        return window;
    }
    // #endregion
    //#region Menus  
    function menuSelect(_item, _window, _event) {
        console.log(`MenuSelect: Item-id=${Fudge.MENU[_item.id]}`);
        // TODO: simplify switch using enums as messages
        switch (_item.id) {
            case Fudge.MENU.DEVTOOLS_OPEN:
                _window.webContents.openDevTools();
                break;
            case Fudge.MENU.FULLSCREEN:
                _window.fullScreen = !_window.isFullScreen();
                break;
            case Fudge.MENU.QUIT:
                quit({ type: "Ctrl+Q" });
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
                    { label: "New", id: Fudge.MENU.PROJECT_NEW, click: menuSelect, accelerator: process.platform == "darwin" ? "Command+N" : "Ctrl+N" },
                    { label: "Load", id: Fudge.MENU.PROJECT_LOAD, click: menuSelect, accelerator: process.platform == "darwin" ? "Command+L" : "Ctrl+L" },
                    { label: "Save", id: Fudge.MENU.PROJECT_SAVE, click: menuSelect, accelerator: process.platform == "darwin" ? "Command+S" : "Ctrl+S", enabled: false },
                    { label: "Quit", id: Fudge.MENU.QUIT, click: menuSelect, accelerator: process.platform == "darwin" ? "Command+Q" : "Ctrl+Q" }
                ]
            },
            {
                label: "Edit", submenu: [
                    { label: "Help", id: Fudge.MENU.PANEL_HELP_OPEN, click: menuSelect, accelerator: process.platform == "darwin" ? "Command+H" : "Ctrl+H", enabled: true },
                    { label: "Project", id: Fudge.MENU.PANEL_PROJECT_OPEN, click: menuSelect, accelerator: process.platform == "darwin" ? "Command+R" : "Ctrl+R", enabled: false },
                    { label: "Graph", id: Fudge.MENU.PANEL_GRAPH_OPEN, click: menuSelect, accelerator: process.platform == "darwin" ? "Command+G" : "Ctrl+G", enabled: false },
                    { label: "Animation", id: Fudge.MENU.PANEL_ANIMATION_OPEN, click: menuSelect, accelerator: process.platform == "darwin" ? "Command+I" : "Ctrl+I", enabled: false }
                ]
            },
            {
                label: "Debug", submenu: [
                    { label: "DevTool", id: Fudge.MENU.DEVTOOLS_OPEN, click: menuSelect, accelerator: process.platform == "darwin" ? "F12" : "F12" },
                    { label: "Fullscreen", id: Fudge.MENU.FULLSCREEN, click: menuSelect, accelerator: process.platform == "darwin" ? "F11" : "F11" }
                ]
            }
        ];
        return menu;
    }
    // #endregion
})(Main || (Main = {}));
//# sourceMappingURL=Main.js.map