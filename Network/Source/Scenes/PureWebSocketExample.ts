import * as FudgeNetwork from "./../ModuleCollector";
import { PeerMessageSimpleText, NetworkMessageMessageToClient } from "../NetworkMessages";
import { UiElementHandler } from "../DataCollectors";

let isServer: boolean = false;
const pureWebSocketClient: FudgeNetwork.PureWebSocketClientManager = new FudgeNetwork.PureWebSocketClientManager();
const pureWebSocketServer: FudgeNetwork.PureWebSocketServer = new FudgeNetwork.PureWebSocketServer();


FudgeNetwork.UiElementHandler.getPureWebSocketUiElements();
FudgeNetwork.UiElementHandler.startSignalingButton.addEventListener("click", startingUpSignalingServer);
FudgeNetwork.UiElementHandler.signalingSubmit.addEventListener("click", connectToSignalingServer);
FudgeNetwork.UiElementHandler.loginButton.addEventListener("click", createLoginRequestWithUsername);
FudgeNetwork.UiElementHandler.switchModeButton.addEventListener("click", switchServerMode);
FudgeNetwork.UiElementHandler.sendMsgButton.addEventListener("click", sendMessageToServer);
FudgeNetwork.UiElementHandler.sendMessageAsServer.addEventListener("click", broadcastMessageToClients);


FudgeNetwork.UiElementHandler.signalingElements.style.display = "block";
FudgeNetwork.UiElementHandler.serverElements.style.display = "none";

// function addKeypressListener(): void {
//     let browser: Document = FudgeNetwork.UiElementHandler.electronWindow;
//     browser.addEventListener("keydown", (event: KeyboardEvent) => {
//         if (event.keyCode == 27) {
//             networkClient.sendDisconnectRequest();
//         }
//         else {
//             networkClient.sendKeyPress(event.keyCode);
//         }
//     });
// }

function broadcastMessageToClients() {
    let messageToBroadcast = new NetworkMessageMessageToClient(UiElementHandler.msgInputServer.value);
    pureWebSocketServer.broadcastMessageToAllConnectedClients(messageToBroadcast);
}
function startingUpSignalingServer(): void {
    pureWebSocketServer.startUpServer();
}

function connectToSignalingServer(): void {
    pureWebSocketClient.signalingServerConnectionUrl = "ws://" + FudgeNetwork.UiElementHandler.signalingUrl.value;
    pureWebSocketClient.connectToSignalingServer();
}

function createLoginRequestWithUsername(): void {
    let chosenUserName: string = "";
    console.log(UiElementHandler.sendMsgButton);
    if (FudgeNetwork.UiElementHandler.loginNameInput) {
        chosenUserName = FudgeNetwork.UiElementHandler.loginNameInput.value;
        console.log("Username:" + chosenUserName);
        pureWebSocketClient.checkChosenUsernameAndCreateLoginRequest(chosenUserName);
    }
    else {
        console.error("UI element missing: Loginname Input field");
    }
}

function sendMessageToServer() {
    console.log("sending message");
    let messageToSend: FudgeNetwork.NetworkMessageMessageToServer = new FudgeNetwork.NetworkMessageMessageToServer(pureWebSocketClient.getLocalClientId(), UiElementHandler.msgInput.value);
    pureWebSocketClient.sendMessageToSignalingServer(messageToSend);
}

function switchServerMode(): void {
    let switchbutton: HTMLButtonElement = FudgeNetwork.UiElementHandler.switchModeButton as HTMLButtonElement;
    if (!isServer) {
        switchbutton.textContent = "Switch to Clientmode";
        FudgeNetwork.UiElementHandler.signalingElements.style.display = "none";
        FudgeNetwork.UiElementHandler.serverElements.style.display = "block";
        isServer = true;
    }
    else {
        switchbutton.textContent = "Switch to Servermode";
        FudgeNetwork.UiElementHandler.signalingElements.style.display = "block";
        FudgeNetwork.UiElementHandler.serverElements.style.display = "none";
        isServer = false;
    }
}



// function startingUpSignalingServer(): void {
//     console.log("Turning server ONLINE");
//     if (asMode) {
//         authoritativeSignalingServer.startUpServer(9090);
//     }
//     else {
//         peerToPeerSignalingServer.startUpServer(9090);

//     }
//     let startSignalingButton: HTMLButtonElement = FudgeNetwork.UiElementHandler.startSignalingButton as HTMLButtonElement;
//     startSignalingButton.hidden = true;
//     let stopSignalingButton: HTMLButtonElement = FudgeNetwork.UiElementHandler.stopSignalingServer as HTMLButtonElement;
//     stopSignalingButton.hidden = false;
//     let switchButton: HTMLButtonElement = FudgeNetwork.UiElementHandler.switchModeButton as HTMLButtonElement;
//     switchButton.hidden = true;
// }

// function turnOffSignalingServer(): void {
//     console.log("Turning server offline");
//     if (asMode) {

//         authoritativeSignalingServer.closeDownServer();
//     }
//     else {
//         peerToPeerSignalingServer.closeDownServer();
//     }

//     let startSignalingButton: HTMLButtonElement = FudgeNetwork.UiElementHandler.startSignalingButton as HTMLButtonElement;
//     startSignalingButton.hidden = false;
//     let stopSignalingButton: HTMLButtonElement = FudgeNetwork.UiElementHandler.stopSignalingServer as HTMLButtonElement;
//     stopSignalingButton.hidden = true;
//     let switchButton: HTMLButtonElement = FudgeNetwork.UiElementHandler.switchModeButton as HTMLButtonElement;
//     switchButton.hidden = false;
// }




// Changing HTML pages restarts the renderer process, causing connection loss on networking
// so not doable this way. Single page required or different way to change page (testing only so not that important)
// const { remote } = require('electron')
// function testbutton () {
//     remote.getCurrentWindow().loadURL('https://github.com')
// }
// FudgeNetwork.UiElementHandler.signalingSubmit.addEventListener("click", testbutton);
