import * as FudgeNetwork from "../ModuleCollector";

export class NetworkClientManager implements FudgeNetwork.PeerConnectionClientTemplate {
    public signalingServerConnectionUrl: string = "ws://localhost:8080";
    public ownUserName: string;
    private ownClientId: string;
    public webSocketConnectionToSignalingServer!: WebSocket;

    public ownPeerConnection!: RTCPeerConnection;
    public remoteClientId: string;
    public ownPeerDataChannel: RTCDataChannel | undefined;
    public remoteEventPeerDataChannel: RTCDataChannel | undefined;
    public isInitiator: boolean;
    // More info from here https://developer.mozilla.org/en-US/docs/Web/API/RTCConfiguration
    // tslint:disable-next-line: typedef
    readonly configuration = {
        iceServers: [
            { urls: "stun:stun2.1.google.com:19302" },
            { urls: "stun:stun.example.com" }
        ]
    };

    constructor() {
        this.ownUserName = "";
        this.ownClientId = "undefined";
        this.remoteClientId = "";
        this.isInitiator = false;
        this.remoteEventPeerDataChannel = undefined;
        this.createRTCPeerConnectionAndAddListeners();
    }

    // public startUpSignalingServerFile = (_serverFileUri: string): void => {
    //     // TODO You can start the signaling server inside  the componente, so it can be toggled/clicked to make it happen
    //     let server_test = require("./Server/ServerMain");
    // }
    public connectToSpecifiedSignalingServer = () => {
        try {
            this.webSocketConnectionToSignalingServer = new WebSocket(this.signalingServerConnectionUrl);
            this.addWsEventListeners();
        } catch (error) {
            console.log("Websocket Generation gescheitert");
        }
    }
    public addWsEventListeners = (): void => {
        try {
            this.webSocketConnectionToSignalingServer.addEventListener("open", (_connOpen: Event) => {
                console.log("Conneced to the signaling server", _connOpen);
            });

            this.webSocketConnectionToSignalingServer.addEventListener("error", (_err: Event) => {
                console.error(_err);
            });

            this.webSocketConnectionToSignalingServer.addEventListener("message", (_receivedMessage: MessageEvent) => {
                this.parseMessageAndCallCorrespondingMessageHandler(_receivedMessage);
            });
        } catch (error) {
            console.error("Unexpected Error: Adding websocket Eventlistener", error);
        }
    }
    public parseMessageAndCallCorrespondingMessageHandler = (_receivedMessage: MessageEvent) => {
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

            case FudgeNetwork.MESSAGE_TYPE.RTC_OFFER:
                // console.log("Received offer, current signaling state: ", this.connection.signalingState);
                this.receiveOfferAndSetRemoteDescriptionThenCreateAndSendAnswer(objectifiedMessage);
                break;

            case FudgeNetwork.MESSAGE_TYPE.RTC_ANSWER:
                // console.log("Received answer, current signaling state: ", this.connection.signalingState);
                this.receiveAnswerAndSetRemoteDescription(objectifiedMessage.clientId, objectifiedMessage.answer);
                break;

            case FudgeNetwork.MESSAGE_TYPE.ICE_CANDIDATE:
                // console.log("Received candidate, current signaling state: ", this.connection.signalingState);
                this.handleReceivedCandidate(objectifiedMessage);
                break;
        }
    }



    public checkChosenUsernameAndCreateLoginRequest = (_loginName: string): void => {
        if (_loginName.length <= 0) {
            console.log("Please enter username");
            return;
        }
        this.createLoginRequestAndSendToServer(_loginName);
    }
    private createLoginRequestAndSendToServer = (_requestingUsername: string) => {
        try {
            const loginMessage: FudgeNetwork.NetworkMessageLoginRequest = new FudgeNetwork.NetworkMessageLoginRequest(this.ownClientId, _requestingUsername);
            this.sendMessage(loginMessage);
        } catch (error) {
            console.error("Unexpected error: Sending Login Request", error);
        }
    }
    private loginValidAddUser = (_assignedId: string, _loginSuccess: boolean, _originatorUserName: string): void => {
        if (_loginSuccess) {
            this.setOwnUserName(_originatorUserName);
            console.log("Local Username: " + this.ownUserName);
        } else {
            console.log("Login failed, username taken");
        }
    }



    public checkUsernameToConnectToAndInitiateConnection = (_chosenUserNameToConnectTo: string): void => {
        if (_chosenUserNameToConnectTo.length === 0) {
            console.error("Enter a username 😉");
            return;
        }
        this.remoteClientId = _chosenUserNameToConnectTo;
        this.initiateConnectionByCreatingDataChannelAndPreparingOffer(this.remoteClientId);
    }
    public createRTCPeerConnectionAndAddListeners = () => {
        console.log("Creating RTC Connection");
        try {
            this.ownPeerConnection = new RTCPeerConnection(this.configuration);
            this.ownPeerConnection.addEventListener("icecandidate", this.sendNewIceCandidatesToPeer);
        } catch (error) { console.error("Unexpecte Error: Creating Client Peerconnection", error); }
    }



    private assignIdAndSendConfirmation = (_message: FudgeNetwork.NetworkMessageIdAssigned) => {
        try {
            this.setOwnClientId(_message.assignedId);
            this.sendMessage(new FudgeNetwork.NetworkMessageIdAssigned(this.ownClientId));
        } catch (error) {
            console.error("Unexpected Error: Sending ID Confirmation", error);
        }
    }




    public initiateConnectionByCreatingDataChannelAndPreparingOffer = (_userNameForOffer: string): void => {
        // Initiator is important for direct p2p connections
        this.isInitiator = true;
        try {
            this.ownPeerDataChannel = this.ownPeerConnection.createDataChannel("localDataChannel");
            this.ownPeerDataChannel.addEventListener("open", this.dataChannelStatusChangeHandler);
            this.ownPeerDataChannel.addEventListener("close", this.dataChannelStatusChangeHandler);
            this.ownPeerDataChannel.addEventListener("message", this.dataChannelMessageHandler);
            console.log(this.ownPeerConnection.getSenders);

        } catch (error) {
            console.error("Unexpected Error: Creating Client Datachannel and adding Listeners", error);
        }
        this.ownPeerConnection.createOffer()
            .then(async (offer) => {
                console.log("Beginning of createOffer in InitiateConnection, Expected 'stable', got:  ", this.ownPeerConnection.signalingState);
                return offer;
            })
            .then(async (offer) => {
                await this.ownPeerConnection.setLocalDescription(offer);
                console.log("Setting LocalDesc, Expected 'have-local-offer', got:  ", this.ownPeerConnection.signalingState);
            })
            .then(() => {
                this.createOfferMessageAndSendToRemote(_userNameForOffer);
            })
            .catch((error) => {
                console.error("Unexpected Error: Creating RTCOffer", error);
            });

    }
    public createOfferMessageAndSendToRemote = (_userNameForOffer: string) => {
        try {
            const offerMessage: FudgeNetwork.NetworkMessageRtcOffer = new FudgeNetwork.NetworkMessageRtcOffer(this.ownClientId, _userNameForOffer, this.ownPeerConnection.localDescription);
            this.sendMessage(offerMessage);
            console.log("Sent offer to remote peer, Expected 'have-local-offer', got:  ", this.ownPeerConnection.signalingState);
        } catch (error) {
            console.error("Unexpected Error: Creating Object and Sending RTC Offer", error);
        }
    }
    public receiveOfferAndSetRemoteDescriptionThenCreateAndSendAnswer = (_offerMessage: FudgeNetwork.NetworkMessageRtcOffer): void => {
        if (!this.ownPeerConnection) {
            console.error("Unexpected Error: OwnPeerConnection error");
            return;
        }
        this.ownPeerConnection.addEventListener("datachannel", this.receiveDataChannel);
        this.remoteClientId = _offerMessage.originatorId;

        let offerToSet: RTCSessionDescription | RTCSessionDescriptionInit | null = _offerMessage.offer;
        if (!offerToSet) {
            return;
        }
        this.ownPeerConnection.setRemoteDescription(new RTCSessionDescription(offerToSet))
            .then(async () => {
                console.log("Received Offer and Set Descirpton, Expected 'have-remote-offer', got:  ", this.ownPeerConnection.signalingState);
                await this.createAnswerAndSendToRemote(_offerMessage.originatorId);
            })
            .catch((error) => {
                console.error("Unexpected Error: Setting Remote Description and Creating Answer", error);
            });
        console.log("End of Function Receive offer, Expected 'stable', got:  ", this.ownPeerConnection.signalingState);
    }




    public createAnswerAndSendToRemote = (_remoteIdToAnswerTo: string) => {
        let ultimateAnswer: RTCSessionDescription;
        // Signaling example from here https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/createAnswer
        this.ownPeerConnection.createAnswer()
            .then(async (answer) => {
                console.log("Create Answer before settign local desc: Expected 'have-remote-offer', got:  ", this.ownPeerConnection.signalingState);
                ultimateAnswer = new RTCSessionDescription(answer);
                return await this.ownPeerConnection.setLocalDescription(ultimateAnswer);
            }).then(async () => {
                console.log("CreateAnswerFunction after setting local descp, Expected 'stable', got:  ", this.ownPeerConnection.signalingState);

                const answerMessage: FudgeNetwork.NetworkMessageRtcAnswer =
                    new FudgeNetwork.NetworkMessageRtcAnswer(this.ownClientId, _remoteIdToAnswerTo, "", ultimateAnswer);
                console.log("AnswerObject: ", answerMessage);
                await this.sendMessage(answerMessage);
            })
            .catch((error) => {
                console.error("Unexpected error: Creating RTC Answer failed", error);
            });
    }
    public receiveAnswerAndSetRemoteDescription = (_localhostId: string, _answer: RTCSessionDescriptionInit) => {
        try {
            let descriptionAnswer: RTCSessionDescription = new RTCSessionDescription(_answer);
            this.ownPeerConnection.setRemoteDescription(descriptionAnswer);
        } catch (error) {
            console.error("Unexpected Error: Setting Remote Description from Answer", error);
        }
    }




    // tslint:disable-next-line: no-any
    public sendNewIceCandidatesToPeer = ({ candidate }: any) => {
        try {
            console.log("Sending ICECandidates from: ", this.ownClientId);
            let message: FudgeNetwork.NetworkMessageIceCandidate = new FudgeNetwork.NetworkMessageIceCandidate(this.ownClientId, this.remoteClientId, candidate);
            this.sendMessage(message);
        } catch (error) {
            console.error("Unexpected Error: Creating and Sending ICECandidates to Peer", error);
        }
    }
    public handleReceivedCandidate = async (_receivedIceMessage: FudgeNetwork.NetworkMessageIceCandidate) => {
        if (_receivedIceMessage.candidate) {
            try {
                await this.ownPeerConnection.addIceCandidate(_receivedIceMessage.candidate);
            } catch (error) {
                console.error("Unexpected Error: Adding Ice Candidate", error);
            }
        }
    }




    public receiveDataChannel = (_event: { channel: RTCDataChannel | undefined; }) => {
        this.remoteEventPeerDataChannel = _event.channel;
        if (this.remoteEventPeerDataChannel) {
            this.remoteEventPeerDataChannel.addEventListener("message", this.dataChannelMessageHandler);
            // this.remoteEventPeerDataChannel.addEventListener("open", this.enableKeyboardPressesForSending);
            this.remoteEventPeerDataChannel.addEventListener("close", this.dataChannelStatusChangeHandler);
        }
        else {
            console.error("Unexpected Error: RemoteDatachannel");
        }
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


    public sendMessage = (_message: Object) => {
        let stringifiedMessage: string = this.stringifyObjectForNetworkSending(_message);
        if (this.webSocketConnectionToSignalingServer.readyState == 1) {
            this.webSocketConnectionToSignalingServer.send(stringifiedMessage);
        }
        else {
            console.error("Websocket Connection closed unexpectedly");
        }
    }


    public sendPeerMessageToServer = (_messageToSend: string) => {
        try {
            if (this.remoteEventPeerDataChannel) {
                this.remoteEventPeerDataChannel.send(_messageToSend);
            }
        } catch (error) {
            console.error("Error occured when stringifying PeerMessage");
            console.error(error);
        }
    }


    public sendMessageViaDirectPeerConnection = (_messageToSend: string) => {
        let messageObject: FudgeNetwork.PeerMessageSimpleText = new FudgeNetwork.PeerMessageSimpleText(this.ownClientId, _messageToSend);

        let stringifiedMessage: string = this.stringifyObjectForNetworkSending(messageObject);
        console.log(stringifiedMessage);
        if (this.isInitiator && this.ownPeerDataChannel) {
            this.ownPeerDataChannel.send(stringifiedMessage);
        }
        else if (!this.isInitiator && this.remoteEventPeerDataChannel && this.remoteEventPeerDataChannel.readyState === "open") {
            console.log("Sending Message via received Datachannel");
            this.remoteEventPeerDataChannel.send(stringifiedMessage);
        }
        else {
            console.error("Datachannel: Connection unexpectedly lost");
        }
    }


    public sendDisconnectRequest = () => {
        try {
            let dcRequest: FudgeNetwork.PeerMessageDisconnectClient = new FudgeNetwork.PeerMessageDisconnectClient(this.ownClientId);
            let stringifiedObject: string = this.stringifyObjectForNetworkSending(dcRequest);
            this.sendPeerMessageToServer(stringifiedObject);
        } catch (error) { console.error("Unexpected Error: Disconnect Request", error); }

    }




    public enableKeyboardPressesForSending = (_keyCode: number) => {
        if (_keyCode == 27) {
            this.sendDisconnectRequest();
        }
        else {
            this.sendKeyPress(_keyCode);
        }
    }
    public sendKeyPress = (_keyCode: number) => {
        try {
            if (this.remoteEventPeerDataChannel != undefined) {
                let keyPressMessage: FudgeNetwork.PeerMessageKeysInput = new FudgeNetwork.PeerMessageKeysInput(this.ownClientId, _keyCode);
                let stringifiedObject: string = this.stringifyObjectForNetworkSending(keyPressMessage);
                this.sendPeerMessageToServer(stringifiedObject);
            }
        } catch (error) { console.error("Unexpected Error: Send Key Press", error); }
    }




    // tslint:disable-next-line: no-any
    public parseReceivedMessageAndReturnObject = (_receivedMessage: MessageEvent): any => {
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

    public dataChannelMessageHandler = (_messageEvent: MessageEvent) => {
        if (_messageEvent) {
            // tslint:disable-next-line: no-any
            let parsedObject: any = this.parseReceivedMessageAndReturnObject(_messageEvent);
            FudgeNetwork.UiElementHandler.chatbox.innerHTML += "\n" + parsedObject.messageData.originatorId + ": " + parsedObject.messageData;
        }

    }



    private setOwnClientId(_id: string) {
        this.ownClientId = _id;
    }
    public getOwnClientId(): string {
        return this.ownClientId;
    }


    private setOwnUserName(_name: string): void {
        this.ownUserName = _name;
    }
    public getOwnUserName(): string {
        return this.ownUserName == "" || undefined ? "Kein Username vergeben" : this.ownUserName;
    }


    private dataChannelStatusChangeHandler = (event: Event) => {
        //TODO Reconnection logic
        console.log("Channel Event happened", event);
    }
}
