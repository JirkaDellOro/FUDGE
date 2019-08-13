let {IPC_MESSAGE_TYPE } = require ("./IpcMessageEnum");
// Modules to control application life and create native browser window
const { app, BrowserWindow } = require("electron");
const path = require("path");
const { ipcMain } = require('electron');


let editorWindowCollection: any[];
let defaultWindowWidth: number = 800;
let defaultWindowHeight: number = 600;
let defaultStartingPage: string = "index.html";

ipcMain.on("open_window_message", (event, arg) =>{
  console.log("Opening window");
  createWindow(defaultWindowWidth, defaultWindowHeight, defaultStartingPage);
});

ipcMain.on(IPC_MESSAGE_TYPE.BROADCAST_REQUEST, (event, arg) => {
    console.log("Broadcast Request received, sending to all");
    editorWindowCollection.forEach(window => {
      // Window webcontents erlaubt dem Main an den jeweiligen Window
      // Renderer zu schicken
      window.webContents.send(IPC_MESSAGE_TYPE.BROADCAST_MESSAGE, arg);
      
    });
});


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow(width: number, height: number, htmlURL:string, webPreferences?: any): void{
  if(!editorWindowCollection)
  {
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
  mainWindow.on("closed", () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", appReadyStartWindowing);

function appReadyStartWindowing(): void{
  createWindow(defaultWindowWidth, defaultWindowHeight, defaultStartingPage);
}

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow(defaultWindowWidth, defaultWindowHeight, defaultStartingPage);
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
