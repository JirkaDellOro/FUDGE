import * as FudgeNetwork from "../ModuleCollector.js";
let isServer = false;
const meshClientManager = new FudgeNetwork.ClientManagerFullMeshStructure();
const meshServer = new FudgeNetwork.FudgeServerMeshNetwork();
FudgeNetwork.UiElementHandler.getMeshUiElements();
FudgeNetwork.UiElementHandler.meshNetworkClientOrServerSwitch.addEventListener("click", switchServerMode);
FudgeNetwork.UiElementHandler.meshServerStartSignalingButton.addEventListener("click", startingUpSignalingServer);
FudgeNetwork.UiElementHandler.meshClientSubmitButton.addEventListener("click", connectToSignalingServer);
FudgeNetwork.UiElementHandler.meshClientReadyButton.addEventListener("click", setClientReady);
FudgeNetwork.UiElementHandler.meshClientElements.style.display = "block";
FudgeNetwork.UiElementHandler.meshServerElements.style.display = "none";
function setClientReady() {
    meshClientManager.sendReadySignalToServer();
}
function startingUpSignalingServer() {
    meshServer.startUpServer();
}
function connectToSignalingServer() {
    meshClientManager.signalingServerConnectionUrl = "ws://" + FudgeNetwork.UiElementHandler.meshClientSignalingURL.value;
    meshClientManager.connectToSignalingServer();
}
function switchServerMode() {
    let switchbutton = FudgeNetwork.UiElementHandler.meshNetworkClientOrServerSwitch;
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
