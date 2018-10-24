const electron = require("electron");
const url = require("url");
const path = require("path");

const {app, BrowserWindow, Menu, ipcMain} = electron;

let mainWindow;
let addWindow;

//listen for the app to be ready
app.on("ready", function(){
    // create new window
    mainWindow = new BrowserWindow({});
    // load html into window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, "mainwindow.html"),
        protocol:"file:",
        slashes:true
    }));

    //Quit App when closed
    mainWindow.on("closed", function(){
        app.quit();
    });

    //Build menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    //Insert the menu
    Menu.setApplicationMenu(mainMenu);
});

//open Add Window
function createAddWindow(){
    // create new window
    addWindow = new BrowserWindow({
        width: "Add Item",
        width: 300,
        height: 200
    });
    // load html into window
    addWindow.loadURL(url.format({
        pathname: path.join(__dirname, "addwindow.html"),
        protocol:"file:",
        slashes:true
    }));

    //Garbage collection
    addWindow.on("close", function(){
        addWindow = null;
    });
}

//Catch item:add
ipcMain.on("item:add", function(e, item){
    mainWindow.webContents.send("item:add", item);
    console.log(item);
    addWindow.close();
});

//create menu template
const mainMenuTemplate = [
    {
        label:"File",
        submenu: [
            {
                label:"Add Item",
                click(){
                    createAddWindow();
                }
            },
            {
                label:"Clear Items"
            },
            {
                label:"Quit",
                accelerator: process.platform == "darwin" ? "Command+Q" : "Ctrl+Q",
                click(){
                    app.quit();
                }
            }
        ]
    }
];

//if Mac, add empty object to menu

if(process.platform == "darwin"){
    mainMenuTemplate.unshift({});
}

//add Developer Tools item if not in prod
if (process.env.NODE_ENV !== "production"){
    mainMenuTemplate.push({
        label: "Devtools",
        submenu: [
            {
                label: "Toggle Devtools",
                accelerator: process.platform == "darwin" ? "Command+I" : "Ctrl+I",
                click(item, focusedWindow){
                    focusedWindow.toggleDevTools();
                }
            }
        ]
    });
}