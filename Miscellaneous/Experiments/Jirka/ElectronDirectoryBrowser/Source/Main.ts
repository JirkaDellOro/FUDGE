namespace DirectoryBrowser {
  const { app, BrowserWindow, Menu, ipcMain } = require("electron");
  let window: Electron.BrowserWindow;

  //#region Events
  ipcMain.addListener("openView", function (_event: Event, ..._args: unknown[]): void {
    console.log(_args);
  });

  ipcMain.on("getNode", function (_event: Event, ..._args: unknown[]): void {
    console.log("getNode", _event);
  });

  app.addListener("window-all-closed", function (): void {
    console.log("Quit");
    if (process.platform !== "darwin") app.quit();
  });

  app.addListener("activate", function (): void {
    console.log("Activate");
  });

  app.addListener("ready", function (): void {
    console.log("Start");
    addView();
  });

  //#endregion

  //#region View 
  function addView(width: number = 800, height: number = 600): void {
    window = new BrowserWindow({
      width: width, height: height, webPreferences: {        // preload: path.join(__dirname, "preload.js"),
        nodeIntegration: true,
        enableRemoteModule: true
      }
    }); 

    window.once("focus", setMenu);
    window.webContents.openDevTools();
    window.loadFile("../Html/DirectoryBrowser.html");
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
    console.log(`MenuSelect: Item=${_item.id}`);
    switch (_item.id) {
      case "Open":
        console.log("Open");
        // let paths: string[] = dialog.showOpenDialogSync(null, { title: "Load Project", buttonLabel: "Load Project", properties: ["openDirectory"] });
        // let filenames: string[] = fs.readdirSync(paths[0], { withFileTypes: true });
        // console.log(filenames);
        window.webContents.send("Open");
        break;
      default:
        break;
    }
  }

  function getMenuProject(): Electron.MenuItemConstructorOptions[] {
    const menu: Electron.MenuItemConstructorOptions[] = [
      {
        label: "Directory", submenu: [
          {
            label: "Open", id: "Open", click: menuSelect, accelerator: process.platform == "darwin" ? "Command+O" : "Ctrl+O"
          }
        ]
      }
    ];
    return menu;
  }
  // #endregion
}