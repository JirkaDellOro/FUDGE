///<reference types="../../node_modules/electron/Electron"/>

namespace Fudge {
  //#region Types and Data
  // TODO: enums should be available to all windows and not defined twice
  enum VIEW {
    PROJECT = "viewProject",
    NODE = "viewNode",
    ANIMATION = "viewAnimation",
    SKETCH = "viewSketch",
    MESH = "viewMesh"
  }
  enum MENU {
    QUIT,
    PROJECT_SAVE,
    PROJECT_OPEN,
    VIEW_NODE_OPEN,
    NODE_DELETE,
    NODE_UPDATE
  }
  interface View {
    type: VIEW;
    window: Electron.BrowserWindow;
  }
  type MapWindowToView = Map<Electron.BrowserWindow, View>;

  const url: Map<VIEW, string> = new Map([
    [VIEW.PROJECT, "../Html/ViewProject.html"],
    [VIEW.NODE, "../Html/ViewNode.html"]
  ]);

  const menu: {} = { [VIEW.PROJECT]: getMenuProject(), [VIEW.NODE]: getMenuNode() };

  const { app, BrowserWindow, Menu, ipcMain } = require("electron");

  let viewProject: View;
  let views: MapWindowToView = new Map();
  let defaultWidth: number = 800;
  let defaultHeight: number = 600;
  //#endregion

  //#region Events
  ipcMain.addListener("openView", function (_event: Event, _type: VIEW, ..._args: unknown[]): void {
    let view: View = addView(_type);
  });
  ipcMain.on("getNode", function (_event: Event, ..._args: unknown[]): void {
    console.log("getNode", _event);
    send(viewProject, "sendNode", _event["sender"].id);
  });

  app.addListener("ready", createViewProject);
  app.addListener("window-all-closed", function (): void {
    console.log("Quit");
    if (process.platform !== "darwin") app.quit();
  });
  app.addListener("activate", function (): void {
    console.log("Activate");
    if (viewProject === null) createViewProject();
  });

  function send(_view: View, _message: string, ..._args: unknown[]): void {
    console.log(`Send message to ${_view.type}: ${_message}`);
    _view.window.webContents.send(_message, _args);
  }
  //#endregion

  //#region View
  function createViewProject(): void {
    console.log("CreateViewProject");
    viewProject = addView(VIEW.PROJECT);
  }

  function removeView(_event: Electron.Event): void {
    console.log("RemoveView");
    let window: Electron.BrowserWindow = _event["sender"];
    views.delete(window);
    console.info("Views", views.size);
    if (window == viewProject.window)
      app.emit("window-all-closed");
  }

  function addView(_type: VIEW, width: number = defaultWidth, height: number = defaultHeight): View {
    let window: Electron.BrowserWindow = new BrowserWindow({
      width: width, height: height, webPreferences: {        // preload: path.join(__dirname, "preload.js"),
        nodeIntegration: true
      }
    });

    window.once("focus", setMenu);
    window.addListener("closed", removeView);
    window.webContents.openDevTools();
    window.loadFile(url.get(_type));

    // views.push(window);
    let view: View = { type: _type, window: window };
    views.set(window, view);
    console.info("View", views.size);

    return view;
  }
  // #endregion

  //#region Menus  
  function setMenu(_event: Electron.Event): void {
    let window: Electron.BrowserWindow = _event["sender"];
    let view: View = views.get(window);
    const viewMenu: Electron.Menu = Menu.buildFromTemplate(menu[view.type]);
    window.setMenu(viewMenu);
  }

  // TODO: break up this function in subfunctions for the various views
  function menuSelect(_item: Electron.MenuItem, _window: Electron.BrowserWindow, _event: Electron.KeyboardEvent): void {
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

  function getMenuProject(): Electron.MenuItemConstructorOptions[] {
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