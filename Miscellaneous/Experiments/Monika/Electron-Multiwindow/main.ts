/// <reference path="node_modules/electron/electron.d.ts"/>
import {app, BrowserWindow, ipcMain, } from 'electron'

const url = require("url")
const path = require("path");
let window:BrowserWindow; 
let secwindow:BrowserWindow; 

// ipcMain.on('asynchronous-message', (event, arg) =>{
//     console.log(arg);
//     // event.reply('asynchronous-message', 'pong');
// })

// ipcMain.on('synchronous-message', (event, arg) =>{
//     console.log(arg);
//     event.returnValue = 'pong';
// })

ipcMain.on('open-up', createSecondWindow);

function createWindow(){
    window = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
          nodeIntegration: true,
        },
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

function createSecondWindow(){
    secwindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
          nodeIntegration: true,
        },
      })
      secwindow.loadURL(url.format({
        pathname: path.join(__dirname, 'app.html'),
        protocol: 'file',
        slashes: true
    }));
    secwindow.webContents.toggleDevTools();
    secwindow.on('close', () =>{
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