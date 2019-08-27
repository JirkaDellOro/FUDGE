import * as FudgeNetwork from "../ModuleCollector";

let isServer: boolean = false;
const meshClientManager: FudgeNetwork.ClientManagerFullMeshStructure = new FudgeNetwork.ClientManagerFullMeshStructure();
const meshServer: FudgeNetwork.FudgeServerMeshNetwork = new FudgeNetwork.FudgeServerMeshNetwork();


FudgeNetwork.UiElementHandler.getMeshUiElements();
FudgeNetwork.UiElementHandler.meshNetworkClientOrServerSwitch.addEventListener("click", switchServerMode);
FudgeNetwork.UiElementHandler.meshServerStartSignalingButton.addEventListener("click", startingUpSignalingServer);
FudgeNetwork.UiElementHandler.meshClientSubmitButton.addEventListener("click", connectToSignalingServer);
FudgeNetwork.UiElementHandler.meshClientReadyButton.addEventListener("click", setClientReady);


FudgeNetwork.UiElementHandler.meshClientElements.style.display = "block";
FudgeNetwork.UiElementHandler.meshServerElements.style.display = "none";


function setClientReady(): void {
    meshClientManager.sendReadySignalToServer();
}

function startingUpSignalingServer(): void {
    meshServer.startUpServer();
}

function connectToSignalingServer(): void {
    meshClientManager.signalingServerConnectionUrl = "ws://" + FudgeNetwork.UiElementHandler.meshClientSignalingURL.value;
    meshClientManager.connectToSignalingServer();
}

function switchServerMode(): void {
    let switchbutton: HTMLButtonElement = FudgeNetwork.UiElementHandler.meshNetworkClientOrServerSwitch as HTMLButtonElement;
    if (!isServer) {
        switchbutton.textContent = "Switch to Clientmode";
        FudgeNetwork.UiElementHandler.meshClientElements.style.display = "none";
        FudgeNetwork.UiElementHandler.meshServerElements.style.display = "block";
        isServer = true;
    }
    else {
        switchbutton.textContent = "Switch to Servermode";
        FudgeNetwork.UiElementHandler.meshClientElements.style.display = "block";
        FudgeNetwork.UiElementHandler.meshServerElements.style.display = "none";
        isServer = false;
    }
}