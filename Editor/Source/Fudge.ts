///<reference types="../../node_modules/electron/Electron"/>
namespace Fudge {
  const { app, BrowserWindow, Menu } = require("electron");
  var ipcMain: Electron.IpcMain = require("electron").ipcMain;
  
  let editorProject: Electron.BrowserWindow;
  let views: Electron.BrowserWindow[] = [];
  let defaultWidth: number = 800;
  let defaultHeight: number = 600;
  
  ipcMain.addListener("openEditor", openView);

  app.addListener("ready", createViewProject);
  app.addListener("window-all-closed", function (): void {
    if (process.platform !== "darwin") app.quit();
  });
  app.addListener("activate", function (): void {
    if (editorProject === null) createViewProject();
  });

  function openView(_event: string, _args: Object): void {
    console.log("Open view", _args);
    switch (_args) {
      case "VIEW_NODE":
        addEditor("../Html/ViewNode.html");
        break;
      default:
        break;
    }
  }

  function createViewProject(): void {
    editorProject = addEditor("../Html/ViewProject.html");
    const mainMenu: Electron.Menu = Menu.buildFromTemplate(getMainMenu());
    Menu.setApplicationMenu(mainMenu);
  }

  function removeEditor(_event: Electron.Event): void {
    //tslint:disable-next-line
    let index: number = views.indexOf(<any>_event.target);
    views.splice(index, 1);
    console.info("Editors", views.length);
  }

  function addEditor(urlToHtmlFile: string, width: number = defaultWidth, height: number = defaultHeight): Electron.BrowserWindow {
    let window: Electron.BrowserWindow = new BrowserWindow({
      width: width,
      height: height,
      webPreferences: {
        // preload: path.join(__dirname, "preload.js"),
        nodeIntegration: true
      }
    });

    window.webContents.openDevTools();
    window.loadFile(urlToHtmlFile);
    window.addListener("closed", removeEditor);

    views.push(window);
    console.info("View", views.length);

    return window;
  }

  //TODO: this should go to EditorProject-Window
  function getMainMenu(): Electron.MenuItemConstructorOptions[] {
    //create menu template
    const mainMenuTemplate: Electron.MenuItemConstructorOptions[] = [
      {
        label: "File", submenu: [
          {
            label: "Save", click(): void { editorProject.webContents.send("save", null); }
          },
          {
            label: "Open", click(): void { editorProject.webContents.send("open", null); }
          },
          {
            label: "Quit", accelerator: process.platform == "darwin" ? "Command+Q" : "Ctrl+Q", click(): void { app.quit(); }
          }
        ]
      }
    ];
    return mainMenuTemplate;
  }
}