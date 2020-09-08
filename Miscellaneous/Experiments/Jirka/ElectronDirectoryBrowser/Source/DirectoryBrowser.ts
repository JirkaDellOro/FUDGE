///<reference types="../../../../../node_modules/electron/Electron"/>

namespace Fudge {
  const { app, BrowserWindow, Menu, ipcMain } = require("electron");


  //#region Events
  ipcMain.addListener("openView", function (_event: Event, ..._args: unknown[]): void {
    // let view: View = addView(_type);
    console.log(_args);
  });
  ipcMain.on("getNode", function (_event: Event, ..._args: unknown[]): void {
    console.log("getNode", _event);
    // send(viewProject, "sendNode", _event["sender"].id);
  });

  // app.addListener("ready", createViewProject);
  app.addListener("window-all-closed", function (): void {
    console.log("Quit");
    if (process.platform !== "darwin") app.quit();
  });
  app.addListener("activate", function (): void {
    console.log("Activate");
    // if (viewProject === null) createViewProject();
  });
  app.addListener("ready", function (): void {
    console.log("Start");
    addView();
  });

  //#endregion

  //#region View 
  function addView(width: number = 800, height: number = 600): void {
    let window: Electron.BrowserWindow = new BrowserWindow({
      width: width, height: height, webPreferences: {        // preload: path.join(__dirname, "preload.js"),
        nodeIntegration: true
      }
    });

    window.once("focus", setMenu);
    window.webContents.openDevTools();
    window.loadFile("../Html/DirectoryBrowser.html");

    // views.push(window);
    // let view: View = { type: _type, window: window };
    // views.set(window, view);
    // console.info("View", views.size);

    // return view;
  }
  // #endregion

  //#region Menus  
  function setMenu(_event: Electron.Event): void {
    let window: Electron.BrowserWindow = _event["sender"];
    const viewMenu: Electron.Menu = Menu.buildFromTemplate(getMenuProject());
    window.setMenu(viewMenu);
  }

  // TODO: break up this function in subfunctions for the various views
  function menuSelect(_item: Electron.MenuItem, _window: Electron.BrowserWindow, _event: Electron.KeyboardEvent): void {
    console.log(`MenuSelect: Item=${_item.id} | Window=${_window}`);
    switch (Number(_item.id)) {
      default:
        break;
    }
  }

  function getMenuProject(): Electron.MenuItemConstructorOptions[] {
    const menu: Electron.MenuItemConstructorOptions[] = [
      {
        label: "Project", submenu: [
          {
            label: "Save", click: menuSelect, accelerator: process.platform == "darwin" ? "Command+S" : "Ctrl+S"
          },
          {
            label: "Open", click: menuSelect, accelerator: process.platform == "darwin" ? "Command+O" : "Ctrl+O"
          },
          {
            label: "Quit", click: menuSelect, accelerator: process.platform == "darwin" ? "Command+Q" : "Ctrl+Q"
          }
        ]
      },
      {
        label: "View", submenu: [
          {
            label: "Node", click: menuSelect, accelerator: process.platform == "darwin" ? "Command+N" : "Ctrl+N"
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
            label: "Update", click: menuSelect, accelerator: process.platform == "darwin" ? "Command+N" : "Ctrl+U"
          },
          {
            label: "Delete", click: menuSelect, accelerator: process.platform == "darwin" ? "Command+N" : "Ctrl+D"
          }
        ]
      }
    ];
    return menu;
  }
  // #endregion
}