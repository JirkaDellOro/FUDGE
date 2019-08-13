import { app, BrowserWindow, Menu, MenuItemConstructorOptions, MenuItem, ContextMenuParams, ipcMain, IpcMessageEvent, dialog } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

// const { app, BrowserWindow, Menu } = require('electron');
// const path = require('path');
// const url = require('url');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win: BrowserWindow;

function createWindow(): void {
    // Create the browser window.
    win = new BrowserWindow({ width: 1200, height: 1000, show: false });

    // and load the index.html of the app.
    win.loadFile(path.join(__dirname, 'electron-app/index.html'));

    win.maximize();
    win.show();

    // Open the DevTools.
    // win.webContents.openDevTools();

    // Emitted when the window is closed.
    win.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null;
    });

    // create custom menu
    createCustomMenu();
    // context menu listener
    win.webContents.on('context-menu', contextMenuHandler);
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
        createWindow();
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

let meshSelected = false;
let customMenu: Menu;
let scenePath: string;

// create application menu
function createCustomMenu(): void {
    // create menu template
    const template: MenuItemConstructorOptions[] = [
        {
            label: 'File',
            submenu: [
                {
                    label: 'New Scene',
                    click: newScene,
                    accelerator: 'ctrl + n'
                },
                {
                    label: 'Load Scene',
                    click: loadScene,
                    accelerator: 'ctrl + o'
                },
                { type: 'separator' },
                {
                    label: 'Save Scene',
                    click: saveScene,
                    accelerator: 'ctrl + s'
                },
                {
                    label: 'Save Scene as',
                    click: saveScene,
                    accelerator: 'ctrl+shift+s'
                },
                { type: 'separator' },
                { role: 'Reload' },
                { role: 'Quit' }
            ]
        },

        {
            label: 'Mesh',
            submenu: [
                {
                    label: 'Create Mesh',
                    submenu: [
                        {
                            label: 'Box',
                            click: createMesh,
                            accelerator: 'ctrl+shift+b'
                        },
                        {
                            label: 'Sphere',
                            click: createMesh,
                            accelerator: 'ctrl+shift+k'
                        },
                        {
                            label: 'Cylinder',
                            click: createMesh,
                            accelerator: 'ctrl+shift+c'
                        },
                        {
                            label: 'Disc',
                            click: createMesh,
                            accelerator: 'ctrl+shift+d'
                        },
                        {
                            label: 'Torus',
                            click: createMesh,
                            accelerator: 'ctrl+shift+t'
                        },
                        {
                            label: 'Plane',
                            click: createMesh,
                            accelerator: 'ctrl+shift+p'
                        },
                        {
                            label: 'Ground',
                            click: createMesh,
                            accelerator: 'ctrl+shift+g'
                        }
                    ]
                },
                {
                    label: 'Delete Mesh',
                    enabled: meshSelected,
                    click: deleteMesh,
                    accelerator: 'delete'
                }
            ]
        },
        {
            label: 'Edit',
            submenu: [
                { label: 'Translation', click: editMode, accelerator: 'alt+q' },
                { label: 'Rotation', click: editMode, accelerator: 'alt+w' },
                { label: 'Scaling', click: editMode, accelerator: 'alt+e' },
                { type: 'separator' },
                { label: 'Reset mesh', enabled: meshSelected, click: resetMesh, accelerator: 'alt+r' },
                { label: 'Reset camera', click: resetCamera }
            ]
        },
        {
            label: 'Debug',
            submenu: [
                { role: 'toggleDevTools' }
            ]
        }
    ];

    // create menu from template
    customMenu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(customMenu);
}

// create context menu
function contextMenuHandler(e: Event, params: ContextMenuParams): void {
    const contextMenu: Menu = new Menu();

    if (params.mediaType === 'canvas') {
        // select edit mode
        contextMenu.append(new MenuItem({ label: 'Translation', click: editMode }));
        contextMenu.append(new MenuItem({ label: 'Rotation', click: editMode }));
        contextMenu.append(new MenuItem({ label: 'Scaling', click: editMode }));

        // separator
        contextMenu.append(new MenuItem({ type: 'separator' }));

        // create meshes
        contextMenu.append(new MenuItem({
            label: 'Create mesh',
            submenu: [
                { label: 'Box', click: createMesh },
                { label: 'Sphere', click: createMesh },
                { label: 'Cylinder', click: createMesh },
                { label: 'Disc', click: createMesh },
                { label: 'Torus', click: createMesh },
                { label: 'Plane', click: createMesh },
                { label: 'Ground', click: createMesh }
            ]
        }));

        // delete mesh
        contextMenu.append(new MenuItem({ label: 'Delete mesh', enabled: meshSelected, click: deleteMesh }));

        // separator
        contextMenu.append(new MenuItem({ type: 'separator' }));

        // reset mesh
        contextMenu.append(new MenuItem({ label: 'Reset mesh', enabled: meshSelected, click: resetMesh }));

        // camera
        contextMenu.append(new MenuItem({ label: 'Reset camera', click: resetCamera }));
    } else {
        contextMenu.append(new MenuItem({ role: 'cut' }));
        contextMenu.append(new MenuItem({ role: 'copy' }));
        contextMenu.append(new MenuItem({ role: 'paste' }));
        contextMenu.append(new MenuItem({ role: 'selectAll' }));
    }
    contextMenu.popup({});
}


/*
*  reacts to the  menu / context menu
*/

function newScene(_menuItem: MenuItem, _win: BrowserWindow, _event: Event): void {
    scenePath = undefined;
    win.webContents.send('new-scene-request');
}

function loadScene(_menuItem: MenuItem, _win: BrowserWindow, _event: Event): void {
    win.webContents.send('load-request');
}

function saveScene(_menuItem: MenuItem, _win: BrowserWindow, _event: Event): void {
    if (_menuItem.label === 'Save Scene' && scenePath !== undefined) {
        win.webContents.send('save-request', true);
    } else {
        win.webContents.send('save-request', false);
    }
}


function createMesh(_menuItem: MenuItem, _win: BrowserWindow, _event: Event): void {
    win.webContents.send('create-mesh', _menuItem.label);
}

function deleteMesh(_menuItem: MenuItem, _win: BrowserWindow, _event: Event): void {
    win.webContents.send('delete-mesh');
}

function resetMesh(_menuItem: MenuItem, _win: BrowserWindow, _event: Event): void {
    win.webContents.send('reset-mesh');
}

function resetCamera(_menuItem: MenuItem, _win: BrowserWindow, _event: Event): void {
    win.webContents.send('reset-camera');
}

function editMode(_menuItem: MenuItem, _win: BrowserWindow, _event: Event): void {
    win.webContents.send('edit-mode', _menuItem.label);
}


/*
*  ipcMain
*/

// save scene
ipcMain.on('save-scene', (_event: IpcMessageEvent, data: string) => {
    fs.writeFile(scenePath, data, (err) => {
        if (err) {
            _event.returnValue = false;
        } else {
            _event.returnValue = true;
        }
    });
});

// save scene in a new file
ipcMain.on('saveAs-scene', (_event: IpcMessageEvent, data: string) => {
    dialog.showSaveDialog(
        {
            filters: [
                { name: 'babylon', extensions: ['babylon'] },
                { name: 'All Files', extensions: ['*'] }
            ]
        },
        (_filePath: string) => {
            if (_filePath) {
                fs.writeFile(_filePath, data, (err) => {
                    if (err) {
                        _event.returnValue = false;
                    } else {
                        _event.returnValue = true;
                    }
                });

                scenePath = _filePath;
            } else {
                _event.returnValue = false;
            }
        });
});

// eventhandler for scene path
ipcMain.on('load-scene', (_event: IpcMessageEvent) => {
    dialog.showOpenDialog(
        {
            properties: ['openFile'],
            filters: [
                { name: 'babylon', extensions: ['babylon'] },
                { name: 'All Files', extensions: ['*'] }
            ]
        },
        (_filepaths) => {
            if (_filepaths) {
                _event.returnValue = _filepaths[0];
                scenePath = _filepaths[0];
            } else {
                _event.returnValue = '';
            }
        });
});


// eventhandler for texture path
ipcMain.on('get-texture-path', (_event: IpcMessageEvent, arg: number) => {
    dialog.showOpenDialog(
        { properties: ['openFile'] },
        (_filepaths) => {
            if (_filepaths) {
                _event.sender.send('texturePath-reply', _filepaths[0]);
            } else {
                _event.sender.send('texturePath-reply', '');
            }
        });
});

// receive selected mesh andupdaate menu
ipcMain.on('send-mesh-selected', (_event: IpcMessageEvent, arg: boolean) => {
    meshSelected = arg;
    // update menu
    createCustomMenu();
});


// show messages
ipcMain.on('show-message', (_event: IpcMessageEvent, arg: string, type: string) => {
    dialog.showMessageBox(win, { message: arg, type: type });
});
