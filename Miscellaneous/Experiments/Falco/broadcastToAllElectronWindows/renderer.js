// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
// In renderer process (web page).
var ipcRenderer = require("electron").ipcRenderer;
var types = require("./IpcMessageEnum").types;
var openButton = document.getElementById("openNewWindow");
var broadcastMessage = document.getElementById("randomMessage");
var broadcastButton = document.getElementById("sendBroadcast");
broadcastButton.addEventListener("click", function () {
    console.log("Sending Broadcast Request: " + broadcastMessage.value);
    ipcRenderer.send(types.BROADCAST_REQUEST, broadcastMessage.value);
});
openButton.addEventListener("click", function () {
    console.log("Clicked");
    ipcRenderer.send("open_window_message");
});
ipcRenderer.on(types.BROADCAST_MESSAGE, function (event, arg) {
    console.log("Message received:", arg);
});
