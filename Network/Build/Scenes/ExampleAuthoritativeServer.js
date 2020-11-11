"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const FudgeNetwork = __importStar(require("../ModuleCollector"));
const NetworkMessages_1 = require("../NetworkMessages");
let isServer = false;
const networkClient = new FudgeNetwork.ClientManagerAuthoritativeStructure();
const authoritativeSignalingServer = new FudgeNetwork.FudgeServerAuthoritativeSignaling();
FudgeNetwork.UiElementHandler.getAuthoritativeUiElements();
FudgeNetwork.UiElementHandler.authoritativeServerStartSignalingButton.addEventListener("click", startingUpSignalingServer);
FudgeNetwork.UiElementHandler.authoritativeServerStopSignalingButton.addEventListener("click", turnOffSignalingServer);
FudgeNetwork.UiElementHandler.authoritativeServerBroadcastButton.addEventListener("click", broadcastMessageToClients);
FudgeNetwork.UiElementHandler.authoritativeClientConnectToServerButton.addEventListener("click", connectToSignalingServer);
// FudgeNetwork.UiElementHandler.authoritativeClientLoginButton.addEventListener("click", createLoginRequestWithUsername);
FudgeNetwork.UiElementHandler.authoritativeClientSendMessageButton.addEventListener("click", sendMessageViaPeerConnectionChannel);
FudgeNetwork.UiElementHandler.authoritativeSwitchToServerOrClientModeButton.addEventListener("click", switchServerMode);
FudgeNetwork.UiElementHandler.authoritativeServerElements.style.display = "none";
console.log(FudgeNetwork.UiElementHandler.authoritativeSwitchToServerOrClientModeButton);
function addKeypressListener() {
    let browser = FudgeNetwork.UiElementHandler.electronWindow;
    browser.addEventListener("keydown", (event) => {
        if (event.keyCode == 27) {
            networkClient.sendDisconnectRequest();
        }
        else {
            networkClient.sendKeyPress(event.keyCode);
        }
    });
}
function createLoginRequestWithUsername() {
    let chosenUserName = "";
    if (FudgeNetwork.UiElementHandler.authoritativeClientLoginNameInput) {
        chosenUserName = FudgeNetwork.UiElementHandler.authoritativeClientLoginNameInput.value;
        console.log("Username:" + chosenUserName);
        networkClient.checkChosenUsernameAndCreateLoginRequest(chosenUserName);
    }
    else {
        console.error("UI element missing: Loginname Input field");
    }
}
function sendMessageViaPeerConnectionChannel() {
    let messageToSend = FudgeNetwork.UiElementHandler.authoritativeClientMessageInput.value;
    FudgeNetwork.UiElementHandler.authoritativeClientChatArea.innerHTML += "\n" + networkClient.localUserName + ": " + messageToSend;
    networkClient.sendMessageToSingularPeer(messageToSend);
}
function broadcastMessageToClients() {
    let stringifiedMessage = JSON.stringify(new NetworkMessages_1.PeerMessageSimpleText(networkClient.getLocalClientId(), FudgeNetwork.UiElementHandler.authoritativeServerMessageInput.value, networkClient.localUserName));
    authoritativeSignalingServer.getAuthoritativeServerEntity().broadcastMessageToAllConnectedClients(stringifiedMessage);
}
function switchServerMode() {
    let switchbutton = FudgeNetwork.UiElementHandler.authoritativeSwitchToServerOrClientModeButton;
    if (!isServer) {
        switchbutton.textContent = "Switch to Servermode";
        FudgeNetwork.UiElementHandler.authoritativeServerElements.style.display = "none";
        FudgeNetwork.UiElementHandler.authoritativeClientElements.style.display = "block";
        isServer = true;
    }
    else {
        switchbutton.textContent = "Switch To Client Mode";
        FudgeNetwork.UiElementHandler.authoritativeServerElements.style.display = "block";
        FudgeNetwork.UiElementHandler.authoritativeClientElements.style.display = "none";
        isServer = false;
    }
}
function startingUpSignalingServer() {
    console.log("Turning server ONLINE");
    authoritativeSignalingServer.startUpServer(8080);
    let startSignalingButton = FudgeNetwork.UiElementHandler.authoritativeServerStartSignalingButton;
    startSignalingButton.hidden = true;
    let stopSignalingButton = FudgeNetwork.UiElementHandler.authoritativeServerStopSignalingButton;
    stopSignalingButton.hidden = false;
    let switchButton = FudgeNetwork.UiElementHandler.authoritativeSwitchToServerOrClientModeButton;
    switchButton.hidden = true;
}
function turnOffSignalingServer() {
    console.log("Turning server offline");
    authoritativeSignalingServer.closeDownServer();
    let startSignalingButton = FudgeNetwork.UiElementHandler.authoritativeServerStartSignalingButton;
    startSignalingButton.hidden = false;
    let stopSignalingButton = FudgeNetwork.UiElementHandler.authoritativeServerStopSignalingButton;
    stopSignalingButton.hidden = true;
    let switchButton = FudgeNetwork.UiElementHandler.authoritativeSwitchToServerOrClientModeButton;
    switchButton.hidden = false;
}
function connectToSignalingServer() {
    networkClient.signalingServerConnectionUrl = "ws://" + FudgeNetwork.UiElementHandler.authoritativeClientSignalingUrlInput.value;
    networkClient.connectToSignalingServer();
    addKeypressListener();
}
// Changing HTML pages restarts the renderer process, causing connection loss on networking
// so not doable this way. Single page required or different way to change page (testing only so not that important)
// const { remote } = require('electron')
// function testbutton () {
//     remote.getCurrentWindow().loadURL('https://github.com')
// }
// FudgeNetwork.UiElementHandler.signalingSubmit.addEventListener("click", testbutton);
