import * as FudgeNetwork from "../ModuleCollector";

export class ClientManagerWebSocketOnly implements FudgeNetwork.ClientManagerWebSocketTemplate {

    public signalingServerConnectionUrl: string = "ws://localhost:8080";
    public localUserName: string;
    public webSocketConnectionToSignalingServer!: WebSocket;
    public localClientID!: string;

    constructor() {
        this.localUserName = "";
    }

    public connectToSignalingServer = () => {
        try {
            this.webSocketConnectionToSignalingServer = new WebSocket(this.signalingServerConnectionUrl);
            this.addWebSocketEventListeners();
        } catch (error) {
            console.log("Websocket Generation gescheitert");
        }
    }


    public checkChosenUsernameAndCreateLoginRequest = (_loginName: string): void => {
        if (_loginName.length <= 0) {
            console.log("Please enter username");
            return;
        }
        this.createLoginRequestAndSendToServer(_loginName);
    }

    public sendDisconnectRequest = () => {
        try {

        } catch (error) { console.error("Unexpected Error: Disconnect Request", error); }

    }
    public sendKeyPress = (_keyCode: number) => {

    }

    public enableKeyboardPressesForSending = (_keyCode: number) => {
    }

    private createLoginRequestAndSendToServer = (_requestingUsername: string) => {
        try {
            const loginMessage: FudgeNetwork.NetworkMessageLoginRequest = new FudgeNetwork.NetworkMessageLoginRequest(this.getLocalClientId(), _requestingUsername);
            this.sendMessageToSignalingServer(loginMessage);
        } catch (error) {
            console.error("Unexpected error: Sending Login Request", error);
        }
    }


    public addWebSocketEventListeners = (): void => {
        try {
            this.webSocketConnectionToSignalingServer.addEventListener("open", (_connOpen: Event) => {
                console.log("Conneced to the signaling server", _connOpen);
            });

            this.webSocketConnectionToSignalingServer.addEventListener("error", (_err: Event) => {
                console.error(_err);
            });

            this.webSocketConnectionToSignalingServer.addEventListener("message", (_receivedMessage: MessageEvent) => {
                this.parseMessageAndHandleMessageType(_receivedMessage);
            });
        } catch (error) {
            console.error("Unexpected Error: Adding websocket Eventlistener", error);
        }
    }



    public parseMessageAndHandleMessageType = (_receivedMessage: MessageEvent) => {
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
    }

    private displayServerMessage(_messageToDisplay: any) {
        // tslint:disable-next-line: no-any
        let parsedObject: FudgeNetwork.NetworkMessageMessageToClient = this.parseReceivedMessageAndReturnObject(_messageToDisplay);
        FudgeNetwork.UiElementHandler.chatbox.innerHTML += "\n" + parsedObject.originatorId + ": " + parsedObject.messageData;
        FudgeNetwork.UiElementHandler.chatbox.scrollTop = FudgeNetwork.UiElementHandler.chatbox.scrollHeight;
    }

    private assignIdAndSendConfirmation = (_message: FudgeNetwork.NetworkMessageIdAssigned) => {
        try {
            this.setLocalClientId(_message.assignedId);
            this.sendMessageToSignalingServer(new FudgeNetwork.NetworkMessageIdAssigned(this.getLocalClientId()));
        } catch (error) {
            console.error("Unexpected Error: Sending ID Confirmation", error);
        }
    }

    public sendMessageToSignalingServer = (_message: Object) => {
        console.log("Sending Message to Server");
        let stringifiedMessage: string = this.stringifyObjectForNetworkSending(_message);
        if (this.webSocketConnectionToSignalingServer.readyState == 1) {
            this.webSocketConnectionToSignalingServer.send(stringifiedMessage);
        }
        else {
            console.error("Websocket Connection closed unexpectedly");
        }
    }

    public sendTextMessageToSignalingServer = (_message: FudgeNetwork.NetworkMessageMessageToServer) => {
        FudgeNetwork.UiElementHandler.chatbox.innerHTML += "\n" + _message.originatorUserName + ": " + _message.messageData;
        FudgeNetwork.UiElementHandler.chatbox.scrollTop = FudgeNetwork.UiElementHandler.chatbox.scrollHeight;

        let stringifiedMessage: string = this.stringifyObjectForNetworkSending(_message);
        if (this.webSocketConnectionToSignalingServer.readyState == 1) {
            this.webSocketConnectionToSignalingServer.send(stringifiedMessage);
        }
        else {
            console.error("Websocket Connection closed unexpectedly");
        }
    }



    private loginValidAddUser = (_assignedId: string, _loginSuccess: boolean, _originatorUserName: string): void => {
        if (_loginSuccess) {
            this.localUserName = _originatorUserName;
            console.log("Local Username: " + this.localUserName);
        } else {
            console.log("Login failed, username taken");
        }
    }

    // tslint:disable-next-line: no-any
    private parseReceivedMessageAndReturnObject = (_receivedMessage: MessageEvent): any => {

        // tslint:disable-next-line: no-any
        let objectifiedMessage: any;
        try {
            console.log("RECEIVED: ", _receivedMessage);
            objectifiedMessage = JSON.parse(_receivedMessage.data);

        } catch (error) {
            console.error("Invalid JSON", error);
        }

        return objectifiedMessage;
    }

    private stringifyObjectForNetworkSending = (_objectToStringify: Object): string => {
        let stringifiedObject: string = "";
        try {
            stringifiedObject = JSON.stringify(_objectToStringify);
        } catch (error) {
            console.error("JSON Parse failed", error);
        }
        return stringifiedObject;
    }


    private setLocalClientId(_id: string): boolean {
        if (this.localClientID) {
            console.error("ID already assigned, change setter method if you're sure you want to change it");
            return false;
        }
        else {
            this.localClientID = _id;
            return true;
        }
    }
    public getLocalClientId(): string {
        return this.localClientID;
    }
    public getLocalUserName(): string {
        return this.localUserName;
    }
}
