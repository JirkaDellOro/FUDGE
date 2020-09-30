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
exports.ClientManagerWebSocketOnly = void 0;
const FudgeNetwork = __importStar(require("../ModuleCollector"));
class ClientManagerWebSocketOnly {
    constructor() {
        this.signalingServerConnectionUrl = "ws://localhost:8080";
        this.connectToSignalingServer = () => {
            try {
                this.webSocketConnectionToSignalingServer = new WebSocket(this.signalingServerConnectionUrl);
                this.addWebSocketEventListeners();
            }
            catch (error) {
                console.log("Websocket Generation gescheitert");
            }
        };
        this.checkChosenUsernameAndCreateLoginRequest = (_loginName) => {
            if (_loginName.length <= 0) {
                console.log("Please enter username");
                return;
            }
            this.createLoginRequestAndSendToServer(_loginName);
        };
        this.sendDisconnectRequest = () => {
            try {
            }
            catch (error) {
                console.error("Unexpected Error: Disconnect Request", error);
            }
        };
        this.sendKeyPress = (_keyCode) => {
        };
        this.enableKeyboardPressesForSending = (_keyCode) => {
        };
        this.createLoginRequestAndSendToServer = (_requestingUsername) => {
            try {
                const loginMessage = new FudgeNetwork.NetworkMessageLoginRequest(this.getLocalClientId(), _requestingUsername);
                this.sendMessageToSignalingServer(loginMessage);
            }
            catch (error) {
                console.error("Unexpected error: Sending Login Request", error);
            }
        };
        this.addWebSocketEventListeners = () => {
            try {
                this.webSocketConnectionToSignalingServer.addEventListener("open", (_connOpen) => {
                    console.log("Conneced to the signaling server", _connOpen);
                });
                this.webSocketConnectionToSignalingServer.addEventListener("error", (_err) => {
                    console.error(_err);
                });
                this.webSocketConnectionToSignalingServer.addEventListener("message", (_receivedMessage) => {
                    this.parseMessageAndHandleMessageType(_receivedMessage);
                });
            }
            catch (error) {
                console.error("Unexpected Error: Adding websocket Eventlistener", error);
            }
        };
        this.parseMessageAndHandleMessageType = (_receivedMessage) => {
            // tslint:disable-next-line: typedef
            let objectifiedMessage = this.parseReceivedMessageAndReturnObject(_receivedMessage);
            switch (objectifiedMessage.messageType) {
                case FudgeNetwork.MESSAGE_TYPE.ID_ASSIGNED:
                    console.log("ID received, assigning to self");
                    this.assignIdAndSendConfirmation(objectifiedMessage);
                    break;
                case FudgeNetwork.MESSAGE_TYPE.LOGIN_RESPONSE:
                    this.loginValidAddUser(objectifiedMessage.originatorId, objectifiedMessage.loginSuccess, objectifiedMessage.originatorUsername);
                    break;
                case FudgeNetwork.MESSAGE_TYPE.CLIENT_TO_SERVER_MESSAGE:
                    console.log("BroadcastMessage received, requires further handling", _receivedMessage);
                    break;
                case FudgeNetwork.MESSAGE_TYPE.SERVER_TO_CLIENT_MESSAGE:
                    this.displayServerMessage(_receivedMessage);
                    break;
                default:
                    console.error("Unrecognized Messagetype, did you handle it in Client?");
            }
        };
        this.assignIdAndSendConfirmation = (_message) => {
            try {
                this.setLocalClientId(_message.assignedId);
                this.sendMessageToSignalingServer(new FudgeNetwork.NetworkMessageIdAssigned(this.getLocalClientId()));
            }
            catch (error) {
                console.error("Unexpected Error: Sending ID Confirmation", error);
            }
        };
        this.sendMessageToSignalingServer = (_message) => {
            console.log("Sending Message to Server");
            let stringifiedMessage = this.stringifyObjectForNetworkSending(_message);
            if (this.webSocketConnectionToSignalingServer.readyState == 1) {
                this.webSocketConnectionToSignalingServer.send(stringifiedMessage);
            }
            else {
                console.error("Websocket Connection closed unexpectedly");
            }
        };
        this.sendTextMessageToSignalingServer = (_message) => {
            FudgeNetwork.UiElementHandler.chatbox.innerHTML += "\n" + _message.originatorUserName + ": " + _message.messageData;
            FudgeNetwork.UiElementHandler.chatbox.scrollTop = FudgeNetwork.UiElementHandler.chatbox.scrollHeight;
            let stringifiedMessage = this.stringifyObjectForNetworkSending(_message);
            if (this.webSocketConnectionToSignalingServer.readyState == 1) {
                this.webSocketConnectionToSignalingServer.send(stringifiedMessage);
            }
            else {
                console.error("Websocket Connection closed unexpectedly");
            }
        };
        this.loginValidAddUser = (_assignedId, _loginSuccess, _originatorUserName) => {
            if (_loginSuccess) {
                this.localUserName = _originatorUserName;
                console.log("Local Username: " + this.localUserName);
            }
            else {
                console.log("Login failed, username taken");
            }
        };
        // tslint:disable-next-line: no-any
        this.parseReceivedMessageAndReturnObject = (_receivedMessage) => {
            // tslint:disable-next-line: no-any
            let objectifiedMessage;
            try {
                console.log("RECEIVED: ", _receivedMessage);
                objectifiedMessage = JSON.parse(_receivedMessage.data);
            }
            catch (error) {
                console.error("Invalid JSON", error);
            }
            return objectifiedMessage;
        };
        this.stringifyObjectForNetworkSending = (_objectToStringify) => {
            let stringifiedObject = "";
            try {
                stringifiedObject = JSON.stringify(_objectToStringify);
            }
            catch (error) {
                console.error("JSON Parse failed", error);
            }
            return stringifiedObject;
        };
        this.localUserName = "";
    }
    displayServerMessage(_messageToDisplay) {
        // tslint:disable-next-line: no-any
        let parsedObject = this.parseReceivedMessageAndReturnObject(_messageToDisplay);
        FudgeNetwork.UiElementHandler.chatbox.innerHTML += "\n" + parsedObject.originatorId + ": " + parsedObject.messageData;
        FudgeNetwork.UiElementHandler.chatbox.scrollTop = FudgeNetwork.UiElementHandler.chatbox.scrollHeight;
    }
    setLocalClientId(_id) {
        if (this.localClientID) {
            console.error("ID already assigned, change setter method if you're sure you want to change it");
            return false;
        }
        else {
            this.localClientID = _id;
            return true;
        }
    }
    getLocalClientId() {
        return this.localClientID;
    }
    getLocalUserName() {
        return this.localUserName;
    }
}
exports.ClientManagerWebSocketOnly = ClientManagerWebSocketOnly;
