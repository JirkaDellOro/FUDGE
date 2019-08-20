///<reference types="../../node_modules/electron/Electron"/>

namespace Main {
  //#region Types and Data
  enum MENU {
    QUIT,
    PROJECT_SAVE,
    PROJECT_OPEN,
    VIEW_NODE_OPEN,
    NODE_DELETE,
    NODE_UPDATE
  }

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

  //#region View
  function createFudge(): void {
    console.log("createFudge");
    fudge = addWindow("../Html/Fudge.html");
    const menu: Electron.Menu = Menu.buildFromTemplate(getMenuFudge());
    fudge.setMenu(menu);
  }

  // function removeWindow(_event: Electron.Event): void {
  //   console.log("RemoveView");
  //   let window: Electron.BrowserWindow = _event["sender"];
  //   if (window == fudge)
  //     app.emit("window-all-closed");
  // }

  function addWindow(_url: string, width: number = defaultWidth, height: number = defaultHeight): Electron.BrowserWindow {
    let window: Electron.BrowserWindow = new BrowserWindow({
      width: width, height: height, webPreferences: {        // preload: path.join(__dirname, "preload.js"),
        nodeIntegration: true
      }
    });

    // window.once("focus", setMenu);
    // window.addListener("closed", removeWindow);
    window.webContents.openDevTools();
    window.loadFile(_url);

    return window;
  }
  // #endregion

  //#region Menus  

  // TODO: break up this function in subfunctions for the various views
  function menuSelect(_item: Electron.MenuItem, _window: Electron.BrowserWindow, _event: Electron.KeyboardEvent): void {
    console.log(`MenuSelect: Item-id=${MENU[_item.id]}`);
    switch (Number(_item.id)) {
      case MENU.PROJECT_OPEN:
        send(_window, "open", null);
        break;
      case MENU.PROJECT_SAVE:
        send(_window, "save", null);
        break;
      case MENU.QUIT:
        app.quit();
        break;
      default:
        break;
    }
  }

  function getMenuFudge(): Electron.MenuItemConstructorOptions[] {
    const menu: Electron.MenuItemConstructorOptions[] = [
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

  function getMenuNode(): Electron.MenuItemConstructorOptions[] {
    const menu: Electron.MenuItemConstructorOptions[] = [
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
}