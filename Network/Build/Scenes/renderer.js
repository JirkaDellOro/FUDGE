"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const FudgeNetwork = __importStar(require("./../ModuleCollector"));
const NetworkMessages_1 = require("../NetworkMessages");
let asMode = false;
const test = new FudgeNetwork.NetworkClientManager();
FudgeNetwork.UiElementHandler.getAllUiElements();
FudgeNetwork.UiElementHandler.startSignalingButton.addEventListener("click", startingUpSignalingServer);
FudgeNetwork.UiElementHandler.signalingSubmit.addEventListener("click", connectToSignalingServer);
FudgeNetwork.UiElementHandler.loginButton.addEventListener("click", createLoginRequestWithUsername);
FudgeNetwork.UiElementHandler.connectToUserButton.addEventListener("click", connectToOtherPeer);
FudgeNetwork.UiElementHandler.sendMsgButton.addEventListener("click", sendMessageViaPeerConnectionChannel);
FudgeNetwork.UiElementHandler.switchModeButton.addEventListener("click", switchServerMode);
FudgeNetwork.UiElementHandler.stopSignalingServer.addEventListener("click", turnOffSignalingServer);
FudgeNetwork.UiElementHandler.broadcastButton.addEventListener("click", broadcastMessageToClients);
function addKeypressListener() {
    let browser = FudgeNetwork.UiElementHandler.electronWindow;
    browser.addEventListener("keydown", (event) => {
        if (event.keyCode == 27) {
            test.sendDisconnectRequest();
        }
        else {
            test.sendKeyPress(event.keyCode);
        }
    });
}
function createLoginRequestWithUsername() {
    let chosenUserName = "";
    if (FudgeNetwork.UiElementHandler.loginNameInput) {
        chosenUserName = FudgeNetwork.UiElementHandler.loginNameInput.value;
        console.log("Username:" + chosenUserName);
        test.checkChosenUsernameAndCreateLoginRequest(chosenUserName);
    }
    else {
        console.error("UI element missing: Loginname Input field");
    }
}
function connectToOtherPeer() {
    let userNameToConnectTo = "";
    if (FudgeNetwork.UiElementHandler.usernameToConnectTo) {
        userNameToConnectTo = FudgeNetwork.UiElementHandler.usernameToConnectTo.value;
        test.checkUsernameToConnectToAndInitiateConnection(userNameToConnectTo);
    }
    else {
        console.error("Missing Ui Element: Username to connect to");
    }
}
function sendMessageViaPeerConnectionChannel() {
    let messageToSend = FudgeNetwork.UiElementHandler.msgInput.value;
    FudgeNetwork.UiElementHandler.chatbox.innerHTML += "\n" + test.ownUserName + ": " + messageToSend;
    test.sendMessageViaDirectPeerConnection(messageToSend);
}
function broadcastMessageToClients() {
    let stringifiedMessage = JSON.stringify(new NetworkMessages_1.PeerMessageSimpleText(test.getOwnClientId(), "Test"));
    FudgeNetwork.AuthoritativeSignalingServer.authoritativeServerEntity.broadcastMessageToAllConnectedClients(stringifiedMessage);
}
function switchServerMode() {
    let switchbutton = FudgeNetwork.UiElementHandler.switchModeButton;
    if (!asMode) {
        switchbutton.textContent = "Switch To P2P Mode";
        FudgeNetwork.UiElementHandler.peerToPeerHtmlElements.style.display = "none";
        FudgeNetwork.UiElementHandler.authoritativeElements.style.display = "block";
        asMode = true;
    }
    else {
        switchbutton.textContent = "Switch To Authoritative Mode";
        FudgeNetwork.UiElementHandler.peerToPeerHtmlElements.style.display = "block";
        FudgeNetwork.UiElementHandler.authoritativeElements.style.display = "none";
        asMode = false;
    }
}
function startingUpSignalingServer() {
    console.log("Turning server ONLINE");
    if (asMode) {
        FudgeNetwork.AuthoritativeSignalingServer.startUpServer(9090);
    }
    else {
        FudgeNetwork.PeerToPeerSignalingServer.startUpServer(9090);
    }
    let startSignalingButton = FudgeNetwork.UiElementHandler.startSignalingButton;
    startSignalingButton.hidden = true;
    let stopSignalingButton = FudgeNetwork.UiElementHandler.stopSignalingServer;
    stopSignalingButton.hidden = false;
    let switchButton = FudgeNetwork.UiElementHandler.switchModeButton;
    switchButton.hidden = true;
}
function turnOffSignalingServer() {
    console.log("Turning server offline");
    if (asMode) {
        FudgeNetwork.AuthoritativeSignalingServer.closeDownServer();
    }
    else {
        FudgeNetwork.PeerToPeerSignalingServer.closeDownServer();
    }
    let startSignalingButton = FudgeNetwork.UiElementHandler.startSignalingButton;
    startSignalingButton.hidden = false;
    let stopSignalingButton = FudgeNetwork.UiElementHandler.stopSignalingServer;
    stopSignalingButton.hidden = true;
    let switchButton = FudgeNetwork.UiElementHandler.switchModeButton;
    switchButton.hidden = false;
}
function connectToSignalingServer() {
    test.signalingServerConnectionUrl = "ws://" + FudgeNetwork.UiElementHandler.signalingUrl.value;
    test.connectToSpecifiedSignalingServer();
    addKeypressListener();
}
// Changing HTML pages restarts the renderer process, causing connection loss on networking
// so not doable this way. Single page required or different way to change page (testing only so not that important)
// const { remote } = require('electron')
// function testbutton () {
//     remote.getCurrentWindow().loadURL('https://github.com')
// }
// FudgeNetwork.UiElementHandler.signalingSubmit.addEventListener("click", testbutton);
