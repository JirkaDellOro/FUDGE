// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
// In renderer process (web page).
const { ipcRenderer } = require("electron");
let {types} = require("./IpcMessageEnum");
let openButton: HTMLButtonElement = document.getElementById("openNewWindow") as HTMLButtonElement;
let broadcastMessage: HTMLInputElement = document.getElementById("randomMessage") as HTMLInputElement;
let broadcastButton: HTMLButtonElement  = document.getElementById("sendBroadcast") as HTMLButtonElement;

broadcastButton.addEventListener("click", () =>{
    console.log("Sending Broadcast Request: " + broadcastMessage.value);
    ipcRenderer.send(types.BROADCAST_REQUEST, broadcastMessage.value);
});

openButton.addEventListener("click", () => {
    console.log("Clicked");
    ipcRenderer.send("open_window_message");
});

ipcRenderer.on(types.BROADCAST_MESSAGE, (event, arg) =>{
    console.log("Message received:", arg);
})



