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
