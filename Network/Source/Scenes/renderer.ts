import * as FudgeNetwork from "./../ModuleCollector";
import { PeerMessageSimpleText } from "../NetworkMessages";

let asMode: boolean = false;
const networkClient: FudgeNetwork.NetworkClientManager = new FudgeNetwork.NetworkClientManager();
const peerToPeerSignalingServer: FudgeNetwork.SinglePeerSignalingServer = new FudgeNetwork.SinglePeerSignalingServer();
const authoritativeSignalingServer: FudgeNetwork.FudgeServerAuthoritativeSignaling = new FudgeNetwork.FudgeServerAuthoritativeSignaling();
const pureWebSocketClient: FudgeNetwork.ClientManagerWebSocketOnly = new FudgeNetwork.ClientManagerWebSocketOnly();



FudgeNetwork.UiElementHandler.getAllUiElements();
FudgeNetwork.UiElementHandler.startSignalingButton.addEventListener("click", startingUpSignalingServer);
FudgeNetwork.UiElementHandler.signalingSubmit.addEventListener("click", connectToSignalingServer);
FudgeNetwork.UiElementHandler.loginButton.addEventListener("click", createLoginRequestWithUsername);
FudgeNetwork.UiElementHandler.connectToUserButton.addEventListener("click", connectToOtherPeer);
FudgeNetwork.UiElementHandler.sendMsgButton.addEventListener("click", sendMessageViaPeerConnectionChannel);
FudgeNetwork.UiElementHandler.switchModeButton.addEventListener("click", switchServerMode);
FudgeNetwork.UiElementHandler.stopSignalingServer.addEventListener("click", turnOffSignalingServer);
FudgeNetwork.UiElementHandler.broadcastButton.addEventListener("click", broadcastMessageToClients);


function addKeypressListener(): void {
    let browser: Document = FudgeNetwork.UiElementHandler.electronWindow;
    browser.addEventListener("keydown", (event: KeyboardEvent) => {
        if (event.keyCode == 27) {
            networkClient.sendDisconnectRequest();
        }
        else {
            networkClient.sendKeyPress(event.keyCode);
        }
    });
}

function createLoginRequestWithUsername(): void {
    let chosenUserName: string = "";
    if (FudgeNetwork.UiElementHandler.loginNameInput) {
        chosenUserName = FudgeNetwork.UiElementHandler.loginNameInput.value;
        console.log("Username:" + chosenUserName);
        networkClient.checkChosenUsernameAndCreateLoginRequest(chosenUserName);
    }
    else {
        console.error("UI element missing: Loginname Input field");
    }
}

function connectToOtherPeer(): void {
    let userNameToConnectTo: string = "";
    if (FudgeNetwork.UiElementHandler.usernameToConnectTo) {
        userNameToConnectTo = FudgeNetwork.UiElementHandler.usernameToConnectTo.value;
        networkClient.checkUsernameToConnectToAndInitiateConnection(userNameToConnectTo);
    }
    else {
        console.error("Missing Ui Element: Username to connect to");
    }
}

function sendMessageViaPeerConnectionChannel(): void {
    let messageToSend: string = FudgeNetwork.UiElementHandler.msgInput.value;
    FudgeNetwork.UiElementHandler.chatbox.innerHTML += "\n" + networkClient.localUserName + ": " + messageToSend;
    networkClient.sendMessageToSingularPeer(messageToSend);
}

function broadcastMessageToClients(): void {
    let stringifiedMessage: string = JSON.stringify(new PeerMessageSimpleText(networkClient.getLocalClientId(), "Test"));
    authoritativeSignalingServer.getAuthoritativeServerEntity().broadcastMessageToAllConnectedClients(stringifiedMessage);
}



function switchServerMode(): void {
    let switchbutton: HTMLButtonElement = FudgeNetwork.UiElementHandler.switchModeButton as HTMLButtonElement;
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



function startingUpSignalingServer(): void {
    console.log("Turning server ONLINE");
    if (asMode) {
        authoritativeSignalingServer.startUpServer(9090);
    }
    else {
        peerToPeerSignalingServer.startUpServer(9090);

    }
    let startSignalingButton: HTMLButtonElement = FudgeNetwork.UiElementHandler.startSignalingButton as HTMLButtonElement;
    startSignalingButton.hidden = true;
    let stopSignalingButton: HTMLButtonElement = FudgeNetwork.UiElementHandler.stopSignalingServer as HTMLButtonElement;
    stopSignalingButton.hidden = false;
    let switchButton: HTMLButtonElement = FudgeNetwork.UiElementHandler.switchModeButton as HTMLButtonElement;
    switchButton.hidden = true;
}

function turnOffSignalingServer(): void {
    console.log("Turning server offline");
    if (asMode) {

        authoritativeSignalingServer.closeDownServer();
    }
    else {
        peerToPeerSignalingServer.closeDownServer();
    }

    let startSignalingButton: HTMLButtonElement = FudgeNetwork.UiElementHandler.startSignalingButton as HTMLButtonElement;
    startSignalingButton.hidden = false;
    let stopSignalingButton: HTMLButtonElement = FudgeNetwork.UiElementHandler.stopSignalingServer as HTMLButtonElement;
    stopSignalingButton.hidden = true;
    let switchButton: HTMLButtonElement = FudgeNetwork.UiElementHandler.switchModeButton as HTMLButtonElement;
    switchButton.hidden = false;
}
function connectToSignalingServer(): void {
    networkClient.signalingServerConnectionUrl = "ws://" + FudgeNetwork.UiElementHandler.signalingUrl.value;
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
