import * as FudgeNetwork from "../ModuleCollector";
import { PeerMessageSimpleText } from "../NetworkMessages";

let isServer: boolean = false;
const networkClient: FudgeNetwork.ClientManagerAuthoritativeStructure = new FudgeNetwork.ClientManagerAuthoritativeStructure();
const authoritativeSignalingServer: FudgeNetwork.FudgeServerAuthoritativeSignaling = new FudgeNetwork.FudgeServerAuthoritativeSignaling();

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
    if (FudgeNetwork.UiElementHandler.authoritativeClientLoginNameInput) {
        chosenUserName = FudgeNetwork.UiElementHandler.authoritativeClientLoginNameInput.value;
        console.log("Username:" + chosenUserName);
        networkClient.checkChosenUsernameAndCreateLoginRequest(chosenUserName);
    }
    else {
        console.error("UI element missing: Loginname Input field");
    }
}

function sendMessageViaPeerConnectionChannel(): void {
    let messageToSend: string = FudgeNetwork.UiElementHandler.authoritativeClientMessageInput.value;
    FudgeNetwork.UiElementHandler.authoritativeClientChatArea.innerHTML += "\n" + networkClient.localUserName + ": " + messageToSend;
    networkClient.sendMessageToSingularPeer(messageToSend);
}

function broadcastMessageToClients(): void {
    let stringifiedMessage: string = JSON.stringify(new PeerMessageSimpleText(networkClient.getLocalClientId(), FudgeNetwork.UiElementHandler.authoritativeServerMessageInput.value, networkClient.localUserName));
    authoritativeSignalingServer.getAuthoritativeServerEntity().broadcastMessageToAllConnectedClients(stringifiedMessage);
}



function switchServerMode(): void {
    let switchbutton: HTMLButtonElement = FudgeNetwork.UiElementHandler.authoritativeSwitchToServerOrClientModeButton as HTMLButtonElement;
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



function startingUpSignalingServer(): void {
    console.log("Turning server ONLINE");
    authoritativeSignalingServer.startUpServer(8080);

    let startSignalingButton: HTMLButtonElement = FudgeNetwork.UiElementHandler.authoritativeServerStartSignalingButton as HTMLButtonElement;
    startSignalingButton.hidden = true;
    let stopSignalingButton: HTMLButtonElement = FudgeNetwork.UiElementHandler.authoritativeServerStopSignalingButton as HTMLButtonElement;
    stopSignalingButton.hidden = false;
    let switchButton: HTMLButtonElement = FudgeNetwork.UiElementHandler.authoritativeSwitchToServerOrClientModeButton as HTMLButtonElement;
    switchButton.hidden = true;
}

function turnOffSignalingServer(): void {
    console.log("Turning server offline");

    authoritativeSignalingServer.closeDownServer();

    let startSignalingButton: HTMLButtonElement = FudgeNetwork.UiElementHandler.authoritativeServerStartSignalingButton as HTMLButtonElement;
    startSignalingButton.hidden = false;
    let stopSignalingButton: HTMLButtonElement = FudgeNetwork.UiElementHandler.authoritativeServerStopSignalingButton as HTMLButtonElement;
    stopSignalingButton.hidden = true;
    let switchButton: HTMLButtonElement = FudgeNetwork.UiElementHandler.authoritativeSwitchToServerOrClientModeButton as HTMLButtonElement;
    switchButton.hidden = false;
}
function connectToSignalingServer(): void {
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
