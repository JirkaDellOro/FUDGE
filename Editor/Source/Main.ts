///<reference types="../../node_modules/electron"/>

/**
 * Main electron application running node. Starts the browser window to contain Fudge and sets up the main menu.
 * See subfolder Fudge for most of the other functionality
 */
namespace Main {
  //#region Types and Data
  enum MENU {
    PHYSICS_DEBUG = "physicsDebug",
    PHYSICS_DEBUG_M1 = "physicsDebug1",
    PHYSICS_DEBUG_M2 = "physicsDebug2",
    PHYSICS_DEBUG_M3 = "physicsDebug3",
    PHYSICS_DEBUG_M4 = "physicsDebug4",
    PHYSICS_DEBUG_M5 = "physicsDebug5"
  }

  const { app, BrowserWindow, Menu, ipcMain } = require("electron");

  let fudge: Electron.BrowserWindow;
  let defaultWidth: number = 800;
  let defaultHeight: number = 600;
  //#endregion

  // app.commandLine.appendSwitch("autoplay-policy", "no-user-gesture-required");

  //#region Events 
  app.addListener("ready", createFudge);
  app.addListener("window-all-closed", function (): void {
    console.log("Quit");
    if (process.platform !== "darwin") app.quit();
  });
  app.addListener("activate", function (): void {
    console.log("Activate");
    if (fudge === null) createFudge();
  });

  function send(_window: Electron.BrowserWindow, _message: string, ..._args: unknown[]): void {
    console.log(`Send message ${_message}`);
    _window.webContents.send(_message, _args);
  }
  //#endregion

  //#region Window
  function createFudge(): void {
    console.log("createFudge");
    fudge = addWindow("../Html/Fudge.html");
    const menu: Electron.Menu = Menu.buildFromTemplate(getMenuFudge());
    fudge.setMenu(menu);
  }

  function addWindow(_url: string, width: number = defaultWidth, height: number = defaultHeight): Electron.BrowserWindow {
    let window: Electron.BrowserWindow = new BrowserWindow({
      width: width,
      height: height,
      // fullscreen: true,
      webPreferences: {        // preload: path.join(__dirname, "preload.js"),
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
  function menuSelect(_item: Electron.MenuItem, _window: Electron.BrowserWindow, _event: Electron.KeyboardEvent): void {
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

  function getMenuFudge(): Electron.MenuItemConstructorOptions[] {
    const menu: Electron.MenuItemConstructorOptions[] = [
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
}