///<reference types="../../node_modules/electron/Electron"/>
var FudgeEditor;
///<reference types="../../node_modules/electron/Electron"/>
(function (FudgeEditor) {
    const { app, BrowserWindow, Menu } = require("electron");
    var ipcMain = require("electron").ipcMain;
    let editorProject;
    let editors = [];
    let defaultWidth = 800;
    let defaultHeight = 600;
    ipcMain.addListener("openEditor", openEditor);
    app.addListener("ready", createEditorProject);
    app.addListener("window-all-closed", function () {
        if (process.platform !== "darwin")
            app.quit();
    });
    app.addListener("activate", function () {
        if (editorProject === null)
            createEditorProject();
    });
    function openEditor(_event, _args) {
        console.log("Opening window", _args);
        switch (_args) {
            case "EDITOR_NODE":
                addEditor("../Html/EditorNode.html");
                break;
            default:
                break;
        }
    }
    function createEditorProject() {
        editorProject = addEditor("../Html/EditorProject.html");
        const mainMenu = Menu.buildFromTemplate(getMainMenu());
        Menu.setApplicationMenu(mainMenu);
    }
    function removeEditor(_event) {
        //tslint:disable-next-line
        let index = editors.indexOf(_event.target);
        editors.splice(index, 1);
        console.info("Editors", editors.length);
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
        editors.push(window);
        console.info("Editors", editors.length);
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
})(FudgeEditor || (FudgeEditor = {}));
//# sourceMappingURL=Fudge.js.map