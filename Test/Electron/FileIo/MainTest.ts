/*
///<reference path="../../node_modules/electron/Electron.d.ts"/>
const { app, BrowserWindow } = require("electron");
// const { path } = require("path");

namespace ElectronFileIo {
  let mainWindow: Electron.BrowserWindow;

  app.addListener("ready", createWindow);
  app.addListener("window-all-closed", function (): void {
    if (process.platform !== "darwin") app.quit();
  });
  app.addListener("activate", function (): void {
    if (mainWindow === null) createWindow();
  });


  function createWindow(): void {
    // Create the browser window.
    mainWindow = new BrowserWindow({
      width: 1400, height: 600, webPreferences: {
        nodeIntegration: true //, preload: path.join(__dirname, 'preload.js')
      }
    });

    mainWindow.loadFile("Main.html");
    mainWindow.webContents.openDevTools();
    mainWindow.addListener("closed", function (): void {
      mainWindow = null;
    });
  }
}
*/