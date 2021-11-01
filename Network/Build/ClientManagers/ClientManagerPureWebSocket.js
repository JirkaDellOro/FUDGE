import * as FudgeNetwork from "../ModuleCollectorClient.js";
try {
    Reflect.set(window, "FudgeNetwork", FudgeNetwork);
}
catch (_e) {
    //
}
export class ClientManagerWebSocketOnly {
    // public signalingServerConnectionUrl: string = "ws://localhost:8080";
    localUserName;
    webSocketConnectionToSignalingServer;
    localClientID;
    constructor() {
        this.localUserName = "";
    }
    connectToSignalingServer = (_url) => {
        try {
            this.webSocketConnectionToSignalingServer = new WebSocket(_url);
            this.addWebSocketEventListeners();
        }
        catch (error) {
            console.log("Websocket generation failed");
        }
    };
    checkChosenUsernameAndCreateLoginRequest = (_loginName) => {
        if (_loginName.length <= 0) {
            console.log("Please enter username");
            return;
        }
        this.createLoginRequestAndSendToServer(_loginName);
    };
    sendDisconnectRequest = () => {
        try {
            //
        }
        catch (error) {
            console.error("Unexpected Error: Disconnect Request", error);
        }
    };
    sendKeyPress = (_keyCode) => {
        //
    };
    enableKeyboardPressesForSending = (_keyCode) => {
        //
    };
    addWebSocketEventListeners = () => {
        try {
            this.webSocketConnectionToSignalingServer.addEventListener("open", (_connOpen) => {
                console.log("Connection", _connOpen);
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
    parseMessageAndHandleMessageType = (_receivedMessage) => {
        // tslint:disable-next-line: typedef
        let objectifiedMessage = this.parseReceivedMessageAndReturnObject(_receivedMessage);
        switch (objectifiedMessage.messageType) {
            case FudgeNetwork.MESSAGE_TYPE.ID_ASSIGNED:
                this.assignIdAndSendConfirmation(objectifiedMessage);
                console.log("localClientId", this.localClientID);
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
        this.webSocketConnectionToSignalingServer.dispatchEvent(new CustomEvent("receive", { detail: objectifiedMessage }));
    };
    sendMessageToSignalingServer = (_message) => {
        console.log("Send", _message);
        let stringifiedMessage = this.stringifyObjectForNetworkSending(_message);
        if (this.webSocketConnectionToSignalingServer.readyState == 1) {
            this.webSocketConnectionToSignalingServer.send(stringifiedMessage);
        }
        else {
            console.error("Websocket Connection closed unexpectedly");
        }
    };
    sendTextMessageToSignalingServer = (_message) => {
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
    getLocalClientId() {
        return this.localClientID;
    }
    getLocalUserName() {
        return this.localUserName;
    }
    createLoginRequestAndSendToServer = (_requestingUsername) => {
        try {
            const loginMessage = new FudgeNetwork.NetworkMessageLoginRequest(this.getLocalClientId(), _requestingUsername);
            this.sendMessageToSignalingServer(loginMessage);
        }
        catch (error) {
            console.error("Unexpected error: Sending Login Request", error);
        }
    };
    displayServerMessage(_messageToDisplay) {
        // tslint:disable-next-line: no-any
        let parsedObject = this.parseReceivedMessageAndReturnObject(_messageToDisplay);
        // FudgeNetwork.UiElementHandler.chatbox.innerHTML += "\n" + parsedObject.originatorId + ": " + parsedObject.messageData;
        // FudgeNetwork.UiElementHandler.chatbox.scrollTop = FudgeNetwork.UiElementHandler.chatbox.scrollHeight;
    }
    assignIdAndSendConfirmation = (_message) => {
        try {
            this.setLocalClientId(_message.assignedId);
            this.sendMessageToSignalingServer(new FudgeNetwork.NetworkMessageIdAssigned(this.getLocalClientId()));
        }
        catch (error) {
            console.error("Unexpected Error: Sending ID Confirmation", error);
        }
    };
    loginValidAddUser = (_assignedId, _loginSuccess, _originatorUserName) => {
        if (_loginSuccess) {
            this.localUserName = _originatorUserName;
            console.log("Local Username: " + this.localUserName);
        }
        else {
            console.log("Login failed, username taken");
        }
    };
    // tslint:disable-next-line: no-any
    parseReceivedMessageAndReturnObject = (_receivedMessage) => {
        // tslint:disable-next-line: no-any
        let objectifiedMessage;
        try {
            console.log("Receive", _receivedMessage);
            objectifiedMessage = JSON.parse(_receivedMessage.data);
        }
        catch (error) {
            console.error("Invalid JSON", error);
        }
        return objectifiedMessage;
    };
    stringifyObjectForNetworkSending = (_objectToStringify) => {
        let stringifiedObject = "";
        try {
            stringifiedObject = JSON.stringify(_objectToStringify);
        }
        catch (error) {
            console.error("JSON Parse failed", error);
        }
        return stringifiedObject;
    };
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
}
