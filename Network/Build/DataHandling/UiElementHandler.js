"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UiElementHandler = void 0;
class UiElementHandler {
    static getFundamentalDOMElements() {
        UiElementHandler.electronWindow = document;
    }
    static getMeshUiElements() {
        this.getFundamentalDOMElements();
        UiElementHandler.meshNetworkClientOrServerSwitch = document.getElementById("switch");
        UiElementHandler.meshServerElements = document.getElementById("server_elements");
        UiElementHandler.meshServerStartSignalingButton = document.getElementById("start_signalingServerButton");
        UiElementHandler.meshServerStopSignalingButton = document.getElementById("stop_signalingServerButton");
        UiElementHandler.meshClientElements = document.getElementById("client_elements");
        UiElementHandler.meshClientSignalingURL = document.getElementById("signaling_uri");
        UiElementHandler.meshClientSubmitButton = document.getElementById("submit_button");
        UiElementHandler.meshClientReadyButton = document.getElementById("readyForMesh");
    }
    static getAuthoritativeUiElements() {
        UiElementHandler.getFundamentalDOMElements();
        UiElementHandler.authoritativeSwitchToServerOrClientModeButton = document.getElementById("switch");
        UiElementHandler.authoritativeServerElements = document.getElementById("authoritative_elements");
        UiElementHandler.authoritativeServerStartSignalingButton = document.getElementById("start_signalingServerButton");
        UiElementHandler.authoritativeServerStopSignalingButton = document.getElementById("stop_signalingServerButton");
        UiElementHandler.authoritativeServerBroadcastButton = document.getElementById("broadcastButton");
        UiElementHandler.authoritativeServerMessageInput = document.getElementById("auth_server_input");
        // UiElementHandler.authoritativeServerMovingDiv = document.getElementById("moveIt") as HTMLElement;
        // UiElementHandler.authoritativeServerMovingDiv.style.position = "relative";
        // UiElementHandler.authoritativeServerMovingDiv.style.left = "0px";
        // UiElementHandler.authoritativeServerMovingDiv.style.top = "0px";
        UiElementHandler.authoritativeClientElements = document.getElementById("auth_client_elements");
        UiElementHandler.authoritativeClientSignalingUrlInput = document.getElementById("signaling_uri");
        UiElementHandler.authoritativeClientConnectToServerButton = document.getElementById("submit_button");
        UiElementHandler.authoritativeClientChatArea = document.getElementById("auth_client_chatbox");
        UiElementHandler.authoritativeClientMessageInput = document.getElementById("auth_client_message_input");
        UiElementHandler.authoritativeClientSendMessageButton = document.getElementById("auth_client_send_message_button");
    }
    static getPureWebSocketUiElements() {
        UiElementHandler.getFundamentalDOMElements();
        UiElementHandler.webSocketServerChatBox = document.getElementById("chatboxServer");
        UiElementHandler.webSocketServerMessageInput = document.getElementById("msgInputServer");
        UiElementHandler.webSocketServerSendMessageButton = document.getElementById("sendMessageAsServer");
        UiElementHandler.switchModeButton = document.getElementById("switch");
        UiElementHandler.serverElements = document.getElementById("server_elements");
        UiElementHandler.signalingElements = document.getElementById("signaling_elements");
        UiElementHandler.startSignalingButton = document.getElementById("start_signalingServerButton");
        UiElementHandler.stopSignalingServer = document.getElementById("stop_signalingServerButton");
        UiElementHandler.signalingUrl = document.getElementById("signaling_uri");
        UiElementHandler.signalingSubmit = document.getElementById("submit_button");
        UiElementHandler.loginNameInput = document.getElementById("login_name");
        UiElementHandler.loginButton = document.getElementById("login_button");
        UiElementHandler.msgInput = document.getElementById("msgInput");
        UiElementHandler.chatbox = document.getElementById("chatbox");
        UiElementHandler.sendMsgButton = document.getElementById("sendMessage");
    }
    static getAllUiElements() {
        UiElementHandler.getFundamentalDOMElements();
        UiElementHandler.moveableBoxElement = document.getElementById("moveIt");
        UiElementHandler.switchModeButton = document.getElementById("switch");
        UiElementHandler.authoritativeElements = document.getElementById("authoritative_elements");
        UiElementHandler.stopSignalingServer = document.getElementById("stop_signalingServerButton");
        UiElementHandler.signalingUrl = document.getElementById("signaling_uri");
        UiElementHandler.signalingSubmit = document.getElementById("submit_button");
        UiElementHandler.loginNameInput = document.getElementById("login_name");
        UiElementHandler.loginButton = document.getElementById("login_button");
        UiElementHandler.msgInput = document.getElementById("msgInput");
        UiElementHandler.chatbox = document.getElementById("chatbox");
        UiElementHandler.sendMsgButton = document.getElementById("sendMessage");
        UiElementHandler.connectToUserButton = document.getElementById("userConnect");
        UiElementHandler.usernameToConnectTo = document.getElementById("connectToUsername");
        UiElementHandler.disconnectButton = document.getElementById("disconnectBtn");
        UiElementHandler.startSignalingButton = document.getElementById("start_signalingServerButton");
        UiElementHandler.peerToPeerHtmlElements = document.getElementById("peer_to_peer_elements");
        UiElementHandler.broadcastButton = document.getElementById("broadcastButton");
    }
    static addMovingDivForAuth() {
        let movingDiv = document.createElement('div');
        movingDiv.style.cssText = "style=height:50px;width:50px;background-color:" + this.colorList[this.colorListIndex] + "; position:relative; left: 0px; top: 0px;";
        this.colorListIndex++;
        document.body.appendChild(movingDiv);
        return movingDiv;
    }
}
exports.UiElementHandler = UiElementHandler;
UiElementHandler.colorList = ["#ff1100", "#ffe600", "#aaff00", "#26ff00", "#00ffd9", "#0059ff", "#d900ff", "#ff0084"];
UiElementHandler.colorListIndex = 0;
