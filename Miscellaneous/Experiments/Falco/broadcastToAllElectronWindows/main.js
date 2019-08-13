var IPC_MESSAGE_TYPE = require("./IpcMessageEnum").IPC_MESSAGE_TYPE;
// Modules to control application life and create native browser window
var _a = require("electron"), app = _a.app, BrowserWindow = _a.BrowserWindow;
var path = require("path");
var ipcMain = require('electron').ipcMain;
var editorWindowCollection;
var defaultWindowWidth = 800;
var defaultWindowHeight = 600;
var defaultStartingPage = "index.html";
ipcMain.on("open_window_message", function (event, arg) {
    console.log("Opening window");
    createWindow(defaultWindowWidth, defaultWindowHeight, defaultStartingPage);
});
ipcMain.on(IPC_MESSAGE_TYPE.BROADCAST_REQUEST, function (event, arg) {
    console.log("Broadcast Request received, sending to all");
    editorWindowCollection.forEach(function (window) {
        // Window webcontents erlaubt dem Main an den jeweiligen Window
        // Renderer zu schicken
        window.webContents.send(IPC_MESSAGE_TYPE.BROADCAST_MESSAGE, arg);
    });
});
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow;
function createWindow(width, height, htmlURL, webPreferences) {
    if (!editorWindowCollection) {
        editorWindowCollection = new Array();
    }
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: width,
        height: height,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            nodeIntegration: true
        }
    });
    editorWindowCollection.push(mainWindow);
    console.log(editorWindowCollection.length);
    // and load the index.html of the app.
    mainWindow.webContents.openDevTools();
    mainWindow.loadFile(htmlURL);
    // Open the DevTools.
    // mainWindow.webContents.openDevTools()
    // Emitted when the window is closed.
    mainWindow.on("closed", function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });
}
;
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", appReadyStartWindowing);
function appReadyStartWindowing() {
    createWindow(defaultWindowWidth, defaultWindowHeight, defaultStartingPage);
}
// Quit when all windows are closed.
app.on("window-all-closed", function () {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== "darwin")
        app.quit();
});
app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null)
        createWindow(defaultWindowWidth, defaultWindowHeight, defaultStartingPage);
});
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
