///<reference types="../../node_modules/electron"/>

/**
 * Main electron application running node. Starts the browser window to contain Fudge and sets up the main menu.
 * See subfolder Fudge for most of the other functionality
 */
namespace Main {
  //#region Types and Data

  const { app, BrowserWindow, Menu, ipcMain } = require("electron");
  // TODO: use the following line in Electron version 14 and up
  // require("@electron/remote/main").initialize();

  let fudge: Electron.BrowserWindow;
  let defaultWidth: number = 800;
  let defaultHeight: number = 600;
  let saved: boolean = false;
  //#endregion

  // app.commandLine.appendSwitch("autoplay-policy", "no-user-gesture-required");

  //#region Events 
  app.addListener("ready", createFudge);
  app.addListener("activate", function (): void {
    console.log("Activate");
    if (fudge === null) createFudge();
  });

  ipcMain.addListener("enableMenuItem", function (_event: Electron.Event, _args: Object): void {
    Menu.getApplicationMenu().getMenuItemById(_args["item"]).enabled = _args["on"];
  });

  function quit(_event: Electron.Event | { type: string }): void {
    if (!saved) {
      console.log("Trying to save state!", _event.type);
      // _event.preventDefault();
      send(fudge, Fudge.MENU.QUIT);
      saved = true;
      if (process.platform !== "darwin")
        app.quit();
    }
  }

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
    // fudge.setMenu(menu);
    Menu.setApplicationMenu(menu);
    fudge.on("close", quit);
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

  function getMenuFudge(): Electron.MenuItemConstructorOptions[] {
    const menu: Electron.MenuItemConstructorOptions[] = [
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
          { label: "Animation", id: Fudge.MENU.PANEL_ANIMATION_OPEN, click: menuSelect, accelerator: process.platform == "darwin" ? "Command+I" : "Ctrl+I", enabled: false },
          { label: "Particle System", id: Fudge.MENU.PANEL_PARTICLE_SYSTEM_OPEN, click: menuSelect, accelerator: process.platform == "darwin" ? "" : "", enabled: false }
        ]
      },
      {
        label: "Debug", submenu: [
          { label: "DevTool", id: Fudge.MENU.DEVTOOLS_OPEN, click: menuSelect, accelerator: process.platform == "darwin" ? "F12" : "F12" },
          { label: "Fullscreen", id: Fudge.MENU.FULLSCREEN, click: menuSelect, accelerator: process.platform == "darwin" ? "F11" : "F11" }
        ]
      }];
    return menu;
  }
  // #endregion
}
