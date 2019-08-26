"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const FudgeNetwork = __importStar(require("../ModuleCollector"));
let asMode = false;
const networkClient = new FudgeNetwork.ClientManagerSinglePeer();
const peerToPeerSignalingServer = new FudgeNetwork.FudgeServerSinglePeer();
FudgeNetwork.UiElementHandler.getAllUiElements();
FudgeNetwork.UiElementHandler.startSignalingButton.addEventListener("click", startingUpSignalingServer);
FudgeNetwork.UiElementHandler.signalingSubmit.addEventListener("click", connectToSignalingServer);
FudgeNetwork.UiElementHandler.loginButton.addEventListener("click", createLoginRequestWithUsername);
FudgeNetwork.UiElementHandler.connectToUserButton.addEventListener("click", connectToOtherPeer);
FudgeNetwork.UiElementHandler.sendMsgButton.addEventListener("click", sendMessageViaPeerConnectionChannel);
FudgeNetwork.UiElementHandler.stopSignalingServer.addEventListener("click", turnOffSignalingServer);
function createLoginRequestWithUsername() {
    let chosenUserName = "";
    if (FudgeNetwork.UiElementHandler.loginNameInput) {
        chosenUserName = FudgeNetwork.UiElementHandler.loginNameInput.value;
        console.log("Username:" + chosenUserName);
        networkClient.checkChosenUsernameAndCreateLoginRequest(chosenUserName);
    }
    else {
        console.error("UI element missing: Loginname Input field");
    }
}
function connectToOtherPeer() {
    let userNameToConnectTo = "";
    if (FudgeNetwork.UiElementHandler.usernameToConnectTo) {
        userNameToConnectTo = FudgeNetwork.UiElementHandler.usernameToConnectTo.value;
        networkClient.checkUsernameToConnectToAndInitiateConnection(userNameToConnectTo);
    }
    else {
        console.error("Missing Ui Element: Username to connect to");
    }
}
function sendMessageViaPeerConnectionChannel() {
    let messageToSend = FudgeNetwork.UiElementHandler.msgInput.value;
    FudgeNetwork.UiElementHandler.chatbox.innerHTML += "\n" + networkClient.localUserName + ": " + messageToSend;
    networkClient.sendMessageToSingularPeer(messageToSend);
}
function startingUpSignalingServer() {
    console.log("Turning server ONLINE");
    peerToPeerSignalingServer.startUpServer(8080);
    let startSignalingButton = FudgeNetwork.UiElementHandler.startSignalingButton;
    startSignalingButton.hidden = true;
    let stopSignalingButton = FudgeNetwork.UiElementHandler.stopSignalingServer;
    stopSignalingButton.hidden = false;
}
function turnOffSignalingServer() {
    peerToPeerSignalingServer.closeDownServer();
    let startSignalingButton = FudgeNetwork.UiElementHandler.startSignalingButton;
    startSignalingButton.hidden = false;
    let stopSignalingButton = FudgeNetwork.UiElementHandler.stopSignalingServer;
    stopSignalingButton.hidden = true;
    let switchButton = FudgeNetwork.UiElementHandler.switchModeButton;
    switchButton.hidden = false;
}
function connectToSignalingServer() {
    networkClient.signalingServerConnectionUrl = "ws://" + FudgeNetwork.UiElementHandler.signalingUrl.value;
    networkClient.connectToSignalingServer();
}
// Changing HTML pages restarts the renderer process, causing connection loss on networking
// so not doable this way. Single page required or different way to change page (testing only so not that important)
// const { remote } = require('electron')
// function testbutton () {
//     remote.getCurrentWindow().loadURL('https://github.com')
// }
// FudgeNetwork.UiElementHandler.signalingSubmit.addEventListener("click", testbutton);
