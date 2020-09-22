///<reference types="../../node_modules/electron"/>

/**
 * Main electron application running node. Starts the browser window to contain Fudge and sets up the main menu.
 * See subfolder Fudge for most of the other functionality
 */
namespace Main {
  const { app, BrowserWindow, Menu, ipcMain } = require("electron");

  let fudge: Electron.BrowserWindow;
  let defaultWidth: number = 800;
  let defaultHeight: number = 600;
  //#endregion
  
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
      width: width, height: height, webPreferences: {        // preload: path.join(__dirname, "preload.js"),
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
  function menuSelect(_item: Electron.MenuItem, _window: Electron.BrowserWindow, _event: Electron.KeyboardEvent): void {
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

  function getMenuFudge(): Electron.MenuItemConstructorOptions[] {
    const menu: Electron.MenuItemConstructorOptions[] = [
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
}