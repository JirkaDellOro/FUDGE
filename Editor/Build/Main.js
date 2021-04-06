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
    })(CONTEXTMENU = Fudge.CONTEXTMENU || (Fudge.CONTEXTMENU = {}));
    let MENU;
    (function (MENU) {
        MENU["QUIT"] = "quit";
        MENU["PROJECT_SAVE"] = "projectSave";
        MENU["PROJECT_LOAD"] = "projectLoad";
        MENU["DEVTOOLS_OPEN"] = "devtoolsOpen";
        MENU["PANEL_GRAPH_OPEN"] = "panelGraphOpen";
        MENU["PANEL_ANIMATION_OPEN"] = "panelAnimationOpen";
        MENU["PANEL_PROJECT_OPEN"] = "panelProjectOpen";
        MENU["FULLSCREEN"] = "fullscreen";
        /* obsolete ?
        NODE_DELETE = "nodeDelete",
        NODE_UPDATE = "nodeUpdate",
        */
    })(MENU = Fudge.MENU || (Fudge.MENU = {}));
    let EVENT_EDITOR;
    (function (EVENT_EDITOR) {
        EVENT_EDITOR["SET_GRAPH"] = "setGraph";
        EVENT_EDITOR["FOCUS_NODE"] = "focusNode";
        EVENT_EDITOR["SET_PROJECT"] = "setProject";
        EVENT_EDITOR["UPDATE"] = "update";
        EVENT_EDITOR["DESTROY"] = "destroy";
        /* obsolete ?
        REMOVE = "removeNode",
        HIDE = "hideNode",
        ACTIVATE_VIEWPORT = "activateViewport",
        */
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
        VIEW["SCRIPT"] = "ViewScript";
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
    //#region Types and Data
    let MENU;
    (function (MENU) {
        MENU["PHYSICS_DEBUG"] = "physicsDebug";
        MENU["PHYSICS_DEBUG_M1"] = "physicsDebug1";
        MENU["PHYSICS_DEBUG_M2"] = "physicsDebug2";
        MENU["PHYSICS_DEBUG_M3"] = "physicsDebug3";
        MENU["PHYSICS_DEBUG_M4"] = "physicsDebug4";
        MENU["PHYSICS_DEBUG_M5"] = "physicsDebug5";
    })(MENU || (MENU = {}));
    const { app, BrowserWindow, Menu, ipcMain } = require("electron");
    let fudge;
    let defaultWidth = 800;
    let defaultHeight = 600;
    //#endregion
    // app.commandLine.appendSwitch("autoplay-policy", "no-user-gesture-required");
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
        // TODO: simplify switch by usinge enums as messages
        switch (_item.id) {
            case Fudge.MENU.DEVTOOLS_OPEN:
                _window.webContents.openDevTools();
                break;
            case Fudge.MENU.FULLSCREEN:
                _window.fullScreen = !_window.isFullScreen();
                break;
            case Fudge.MENU.QUIT:
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
                send(_window, _item.id, null);
                break;
        }
    }
    function getMenuFudge() {
        const menu = [
            {
                label: "Project", submenu: [
                    { label: "Save", id: Fudge.MENU.PROJECT_SAVE, click: menuSelect, accelerator: process.platform == "darwin" ? "Command+S" : "Ctrl+S" },
                    { label: "Open", id: Fudge.MENU.PROJECT_LOAD, click: menuSelect, accelerator: process.platform == "darwin" ? "Command+O" : "Ctrl+O" },
                    { label: "Quit", id: Fudge.MENU.QUIT, click: menuSelect, accelerator: process.platform == "darwin" ? "Command+Q" : "Ctrl+Q" }
                ]
            },
            {
                label: "Edit", submenu: [
                    { label: "Project", id: Fudge.MENU.PANEL_PROJECT_OPEN, click: menuSelect, accelerator: process.platform == "darwin" ? "Command+G" : "Ctrl+P" },
                    { label: "Graph", id: Fudge.MENU.PANEL_GRAPH_OPEN, click: menuSelect, accelerator: process.platform == "darwin" ? "Command+G" : "Ctrl+G" },
                    { label: "Animation", id: Fudge.MENU.PANEL_ANIMATION_OPEN, click: menuSelect, accelerator: process.platform == "darwin" ? "Command+I" : "Ctrl+I" }
                ]
            },
            {
                label: "Debug", submenu: [
                    { label: "DevTool", id: Fudge.MENU.DEVTOOLS_OPEN, click: menuSelect, accelerator: process.platform == "darwin" ? "F12" : "F12" },
                    { label: "Fullscreen", id: Fudge.MENU.FULLSCREEN, click: menuSelect, accelerator: process.platform == "darwin" ? "F11" : "F11" },
                    { type: "separator" },
                    {
                        label: "Physic Debug View", id: String(MENU.PHYSICS_DEBUG), click: menuSelect, accelerator: "CmdOrCtrl+P"
                    }, {
                        label: "Physics Debug Mode", "submenu": [{
                                "label": "Colliders", id: String(MENU.PHYSICS_DEBUG_M1), click: menuSelect
                            }, {
                                "label": "Colliders and Joints (Default)", id: String(MENU.PHYSICS_DEBUG_M2), click: menuSelect
                            }, {
                                "label": "Bounding Boxes", id: String(MENU.PHYSICS_DEBUG_M3), click: menuSelect
                            }, {
                                "label": "Contacts", id: String(MENU.PHYSICS_DEBUG_M4), click: menuSelect
                            },
                            {
                                "label": "Show Physics Objects ONLY", id: String(MENU.PHYSICS_DEBUG_M5), click: menuSelect
                            }]
                    }
                ]
            }
        ];
        return menu;
    }
    // #endregion
})(Main || (Main = {}));
//# sourceMappingURL=Main.js.map