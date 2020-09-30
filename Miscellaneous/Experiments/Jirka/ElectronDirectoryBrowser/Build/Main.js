var DirectoryBrowser;
(function (DirectoryBrowser) {
    const { app, BrowserWindow, Menu, ipcMain } = require("electron");
    let window;
    //#region Events
    ipcMain.addListener("openView", function (_event, ..._args) {
        console.log(_args);
    });
    ipcMain.on("getNode", function (_event, ..._args) {
        console.log("getNode", _event);
    });
    app.addListener("window-all-closed", function () {
        console.log("Quit");
        if (process.platform !== "darwin")
            app.quit();
    });
    app.addListener("activate", function () {
        console.log("Activate");
    });
    app.addListener("ready", function () {
        console.log("Start");
        addView();
    });
    //#endregion
    //#region View 
    function addView(width = 800, height = 600) {
        window = new BrowserWindow({
            width: width, height: height, webPreferences: {
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
    function setMenu(_event) {
        let window = _event["sender"];
        const viewMenu = Menu.buildFromTemplate(getMenuProject());
        window.setMenu(viewMenu);
    }
    // TODO: break up this function in subfunctions for the various views
    function menuSelect(_item, _window, _event) {
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
    function getMenuProject() {
        const menu = [
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
})(DirectoryBrowser || (DirectoryBrowser = {}));
//# sourceMappingURL=Main.js.map