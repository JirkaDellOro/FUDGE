/// <reference path="../../../node_modules/electron/electron.d.ts"/>
import {app, BrowserWindow, ipcMain, } from 'electron'

const url = require("url")
const path = require("path");
let window:BrowserWindow; 

function createWindow(){
    window = new BrowserWindow({
        width: 1920,
        height: 1080,
        // webPreferences: {
        //   nodeIntegration: true,
        // },
      })
    window.loadURL(url.format({
        pathname: path.join(__dirname, 'app.html'),
        protocol: 'file',
        slashes: true
    }));
    window.webContents.toggleDevTools();
    window.on('close', () =>{
        window = null;
    })
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if(process.platform !== 'darwin'){
        app.quit();
    }
});

app.on('activate', () =>{
    if (window === null){
        createWindow();
    }
});