///<reference types="../../node_modules/electron/Electron"/>
var Fudge;
///<reference types="../../node_modules/electron/Electron"/>
(function (Fudge) {
    const { app, BrowserWindow, Menu } = require("electron");
    var ipcMain = require("electron").ipcMain;
    let editorProject;
    let views = [];
    let defaultWidth = 800;
    let defaultHeight = 600;
    ipcMain.addListener("openEditor", openView);
    app.addListener("ready", createViewProject);
    app.addListener("window-all-closed", function () {
        if (process.platform !== "darwin")
            app.quit();
    });
    app.addListener("activate", function () {
        if (editorProject === null)
            createViewProject();
    });
    function openView(_event, _args) {
        console.log("Open view", _args);
        switch (_args) {
            case "VIEW_NODE":
                addEditor("../Html/ViewNode.html");
                break;
            default:
                break;
        }
    }
    function createViewProject() {
        editorProject = addEditor("../Html/ViewProject.html");
        const mainMenu = Menu.buildFromTemplate(getMainMenu());
        Menu.setApplicationMenu(mainMenu);
    }
    function removeEditor(_event) {
        //tslint:disable-next-line
        let index = views.indexOf(_event.target);
        views.splice(index, 1);
        console.info("Editors", views.length);
    }
    function addEditor(urlToHtmlFile, width = defaultWidth, height = defaultHeight) {
        let window = new BrowserWindow({
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
    function getMainMenu() {
        //create menu template
        const mainMenuTemplate = [
            {
                label: "File", submenu: [
                    {
                        label: "Save", click() { editorProject.webContents.send("save", null); }
                    },
                    {
                        label: "Open", click() { editorProject.webContents.send("open", null); }
                    },
                    {
                        label: "Quit", accelerator: process.platform == "darwin" ? "Command+Q" : "Ctrl+Q", click() { app.quit(); }
                    }
                ]
            }
        ];
        return mainMenuTemplate;
    }
})(Fudge || (Fudge = {}));
//# sourceMappingURL=Fudge.js.map