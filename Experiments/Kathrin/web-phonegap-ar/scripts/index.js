"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path = require("path");
let mainWindow;
const mainMenuTpl = [
    {
        label: "File",
        submenu: [
            {
                label: "Create new AR project",
                click() {
                    // changeMainWindowContent("CreateAR");
                    openNewWindow("ar/ar.html", "Create new AR project");
                }
            },
            {
                label: "Create new phonegap project",
                click() {
                    // changeMainWindowContent("CreatePhoneGapApp");
                    openNewWindow("phonegap/phonegap-create.html", "Create new phonegap project");
                }
            },
            {
                label: "Open existing phonegap project",
                click() {
                    // changeMainWindowContent("OpenPhoneGapApp");
                    openNewWindow("phonegap/phonegap-open.html", "Open existing phonegap project");
                }
            },
            {
                accelerator: process.platform === "darwin" ? "Command+Q" : "Ctrl+Q",
                label: "Quit",
                click() {
                    electron_1.app.quit();
                }
            }
        ]
    }
];
initializeApp();
// add dev tools when not in production
if (process.env.NODE_ENV !== "production") {
    mainMenuTpl.push({
        label: "DevTools",
        submenu: [
            {
                accelerator: process.platform === "darwin" ? "Command+I" : "Ctrl+I",
                label: "Toggle DevTools",
                click() {
                    mainWindow.toggleDevTools();
                }
            }
        ]
    });
}
function initializeApp() {
    electron_1.app.on("ready", () => {
        createMainWindow();
    });
    electron_1.app.on("window-all-closed", () => {
        if (process.platform !== "darwin") {
            electron_1.app.quit();
        }
    });
}
function changeMainWindowContent(content) {
    let file = "";
    switch (content) {
        case "CreateAR":
            file = "ar/ar.html";
            break;
        case "CreatePhoneGapApp":
            file = "phonegap/phonegap-create.html";
            break;
        case "OpenPhoneGapApp":
            file = "phonegap/phonegap-open.html";
            break;
        default:
            break;
    }
    mainWindow.loadFile(path.join(__dirname, "../templates/" + file));
}
function openNewWindow(file, winTitle) {
    let title = winTitle ? winTitle : "FUDGE";
    let win = new electron_1.BrowserWindow({
        width: 360,
        height: 640,
        resizable: false,
        minimizable: false,
        title: title,
        parent: mainWindow,
        titleBarStyle: "hidden"
    });
    win.setMenu(null);
    win.openDevTools();
    win.on("closed", (event) => {
        win = null;
    });
    win.loadFile(path.join(__dirname, "../templates/" + file));
}
function createMainWindow() {
    mainWindow = new electron_1.BrowserWindow({
        height: 900,
        webPreferences: {
            experimentalFeatures: true,
            nodeIntegration: true,
            plugins: true,
            webSecurity: false
        },
        width: 1200
    });
    // app.commandLine.appendSwitch('--enable-webxr');
    // app.commandLine.appendSwitch('--enable-webxr-hit-test');
    const mainMenu = electron_1.Menu.buildFromTemplate(mainMenuTpl);
    electron_1.Menu.setApplicationMenu(mainMenu);
    mainWindow.loadFile(path.join(__dirname, "../templates/index.html"));
    mainWindow.openDevTools();
    sendingDataToRenderer();
    mainWindow.on("closed", () => {
        mainWindow = null;
    });
}
function sendingDataToRenderer() {
    electron_1.ipcMain.on("opened-pg-project", (event, data) => {
        mainWindow.webContents.send("opened-pg-project", data);
    });
    electron_1.ipcMain.on("created-pg-project", (event, data) => {
        mainWindow.webContents.send("created-pg-project", data);
    });
}
//# sourceMappingURL=index.js.map