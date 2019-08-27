import * as FudgeNetwork from "../ModuleCollector";

export class ClientManagerFullMeshStructure implements FudgeNetwork.ClientManagerMeshTemplate {
    remoteMeshClients: FudgeNetwork.ClientDataType[];
    currentlyNegotiatingClient: FudgeNetwork.ClientDataType;

    private serverSentMeshClients!: FudgeNetwork.ClientDataType[];
    establishedDataChannelsWithRemoteIds!: [RTCDataChannel];


    public signalingServerConnectionUrl: string = "ws://localhost:8080";
    public localUserName: string;
    public localClientID: string;
    public webSocketConnectionToSignalingServer!: WebSocket;
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
        this.localUserName = "";
        this.localClientID = "undefined";
        this.isInitiator = false;
        this.remoteMeshClients = new Array();
        this.currentlyNegotiatingClient = new FudgeNetwork.ClientDataType();
    }

    // public startUpSignalingServerFile = (_serverFileUri: string): void => {
    //     // TODO You can start the signaling server inside  the componente, so it can be toggled/clicked to make it happen
    //     let server_test = require("./Server/ServerMain");
    // }
    public connectToSignalingServer = () => {
        try {
            this.webSocketConnectionToSignalingServer = new WebSocket(this.signalingServerConnectionUrl);
            this.addWebSocketEventListeners();
        } catch (error) {
            console.log("Websocket Generation gescheitert");
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
        let objectifiedMessage: FudgeNetwork.NetworkMessageMessageBase = this.parseReceivedMessageAndReturnObject(_receivedMessage);

        switch (objectifiedMessage.messageType) {
            case FudgeNetwork.MESSAGE_TYPE.ID_ASSIGNED:
                console.log("ID received, assigning to self");
                this.assignIdAndSendConfirmation(<FudgeNetwork.NetworkMessageIdAssigned>objectifiedMessage);
                break;

            case FudgeNetwork.MESSAGE_TYPE.LOGIN_RESPONSE:
                this.loginValidAddUser(<FudgeNetwork.NetworkMessageLoginResponse>objectifiedMessage);
                break;

            case FudgeNetwork.MESSAGE_TYPE.SERVER_SEND_MESH_CANDIDATES_TO_CLIENT:
                console.log("Received Client Mesh Array: ", _receivedMessage);
                this.beginnMeshConnection(<FudgeNetwork.NetworkMessageServerSendMeshClientArray>objectifiedMessage)
                break;

            case FudgeNetwork.MESSAGE_TYPE.RTC_OFFER:
                // console.log("Received offer, current signaling state: ", this.connection.signalingState);
                this.receiveNegotiationOfferAndSetRemoteDescription(<FudgeNetwork.NetworkMessageRtcOffer>objectifiedMessage);
                break;

            case FudgeNetwork.MESSAGE_TYPE.RTC_ANSWER:
                // console.log("Received answer, current signaling state: ", this.connection.signalingState);
                this.receiveAnswerAndSetRemoteDescription(<FudgeNetwork.NetworkMessageRtcAnswer>objectifiedMessage);
                break;

            case FudgeNetwork.MESSAGE_TYPE.ICE_CANDIDATE:
                // console.log("Received candidate, current signaling state: ", this.connection.signalingState);
                this.addReceivedCandidateToPeerConnection(<FudgeNetwork.NetworkMessageIceCandidate>objectifiedMessage);
                break;
        }
    }

    public beginnMeshConnection(_meshClientMessage?: FudgeNetwork.NetworkMessageServerSendMeshClientArray) {
        if (_meshClientMessage) {
            this.serverSentMeshClients = _meshClientMessage.candidateArray;
        }
        let clientIdToConnectTo: string = this.serverSentMeshClients[0].id;

        this.beginPeerConnectionNegotiation(clientIdToConnectTo);

        if (this.serverSentMeshClients.length > 0) {
            this.serverSentMeshClients.splice(1, 0);
            this.beginnMeshConnection();
        } else {
            this.sendFinishingSignal();
        }
    }

    public sendReadySignalToServer() {
        let readyToConnectMessage = new FudgeNetwork.NetworkMessageClientReady(this.localClientID);
        this.sendMessageToSignalingServer(readyToConnectMessage);
    }

    public sendFinishingSignal() {
        let connectedToMeshMessage = new FudgeNetwork.NetworkMessageClientIsMeshConnected(this.localClientID);
        this.sendMessageToSignalingServer(connectedToMeshMessage);
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
            const loginMessage: FudgeNetwork.NetworkMessageLoginRequest = new FudgeNetwork.NetworkMessageLoginRequest(this.localClientID, _requestingUsername);
            this.sendMessageToSignalingServer(loginMessage);
        } catch (error) {
            console.error("Unexpected error: Sending Login Request", error);
        }
    }
    private loginValidAddUser = (_loginResponse: FudgeNetwork.NetworkMessageLoginResponse): void => {
        let loginSuccess: boolean = _loginResponse.loginSuccess;
        let originatorUserName: string = _loginResponse.originatorUsername;
        if (loginSuccess) {
            this.setOwnUserName(originatorUserName);
            console.log("Local Username: " + this.localUserName);
        } else {
            console.log("Login failed, username taken");
        }
    }

    private assignIdAndSendConfirmation = (_message: FudgeNetwork.NetworkMessageIdAssigned) => {
        try {
            this.setOwnClientId(_message.assignedId);
            this.sendMessageToSignalingServer(new FudgeNetwork.NetworkMessageIdAssigned(this.localClientID));
        } catch (error) {
            console.error("Unexpected Error: Sending ID Confirmation", error);
        }
    }

    createMeshClientAndAddPeerConnection(): FudgeNetwork.ClientDataType {
        let newMeshClient = new FudgeNetwork.ClientDataType();
        let newClientPeerConnection: RTCPeerConnection = new RTCPeerConnection(this.configuration);
        newClientPeerConnection.addEventListener("icecandidate", this.sendIceCandidatesToPeer);
        newMeshClient.rtcPeerConnection = newClientPeerConnection;
        return newMeshClient;
    }

    addNewMeshClientToMeshClientCollection(_meshClient: FudgeNetwork.ClientDataType) {
        this.remoteMeshClients.push(_meshClient);
    }

    public beginPeerConnectionNegotiation = (_userIdToOffer: string): void => {
        // Initiator is important for direct p2p connections
        let currentlyNegotiatingPeer = this.createMeshClientAndAddPeerConnection();
        currentlyNegotiatingPeer.id = _userIdToOffer;
        if (currentlyNegotiatingPeer != null) {
            try {
                currentlyNegotiatingPeer.rtcDataChannel = currentlyNegotiatingPeer.rtcPeerConnection.createDataChannel(currentlyNegotiatingPeer.id);
                currentlyNegotiatingPeer.rtcDataChannel.addEventListener("open", this.dataChannelStatusChangeHandler);
                currentlyNegotiatingPeer.rtcDataChannel.addEventListener("close", this.dataChannelStatusChangeHandler);
                currentlyNegotiatingPeer.rtcDataChannel.addEventListener("message", this.dataChannelMessageHandler);

            } catch (error) {
                console.error("Unexpected Error: Creating Client Datachannel and adding Listeners", error);
            }
            currentlyNegotiatingPeer.rtcPeerConnection.createOffer()
                .then(async (offer) => {
                    console.log("Beginning of createOffer in InitiateConnection, Expected 'stable', got:  ", currentlyNegotiatingPeer.rtcPeerConnection.signalingState);
                    return offer;
                })
                .then(async (offer) => {
                    await currentlyNegotiatingPeer.rtcPeerConnection.setLocalDescription(offer);
                    console.log("Setting LocalDesc, Expected 'have-local-offer', got:  ", currentlyNegotiatingPeer.rtcPeerConnection.signalingState);
                })
                .then(() => {
                    this.addNewMeshClientToMeshClientCollection(currentlyNegotiatingPeer);
                    this.createNegotiationOfferAndSendToPeer(currentlyNegotiatingPeer);
                })
                .catch((error) => {
                    console.error("Unexpected Error: Creating RTCOffer", error);
                });
        }
    }
    public createNegotiationOfferAndSendToPeer = (_currentlyNegotiatingPeer: FudgeNetwork.ClientDataType) => {
        try {
            const offerMessage: FudgeNetwork.NetworkMessageRtcOffer = new FudgeNetwork.NetworkMessageRtcOffer(this.localClientID, _currentlyNegotiatingPeer.id, _currentlyNegotiatingPeer.rtcPeerConnection.localDescription);
            this.sendMessageToSignalingServer(offerMessage);
            console.log("Sent offer to remote peer, Expected 'have-local-offer', got:  ", _currentlyNegotiatingPeer.rtcPeerConnection.signalingState);
        } catch (error) {
            console.error("Unexpected Error: Creating Object and Sending RTC Offer", error);
        }
    }
    public receiveNegotiationOfferAndSetRemoteDescription = (_offerMessage: FudgeNetwork.NetworkMessageRtcOffer): void => {
        // DAS IST VON DER ANDEREN SEITE
        let newlyReceivedClient = new FudgeNetwork.ClientDataType(undefined, _offerMessage.originatorId, new RTCPeerConnection(this.configuration));
        this.remoteMeshClients.push(newlyReceivedClient);

        newlyReceivedClient.rtcPeerConnection.addEventListener("datachannel", this.receiveDataChannelAndEstablishConnection);

        let offerToSet: RTCSessionDescription | RTCSessionDescriptionInit | null = _offerMessage.offer;
        if (!offerToSet) {
            return;
        }
        newlyReceivedClient.rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(offerToSet))
            .then(async () => {
                console.log("Received Offer and Set Descirpton, Expected 'have-remote-offer', got:  ", newlyReceivedClient.rtcPeerConnection.signalingState);
                await this.answerNegotiationOffer(newlyReceivedClient);
            })
            .catch((error) => {
                console.error("Unexpected Error: Setting Remote Description and Creating Answer", error);
            });
        console.log("End of Function Receive offer, Expected 'stable', got:  ", newlyReceivedClient.rtcPeerConnection.signalingState);
    }

    public answerNegotiationOffer = (_remoteMeshClient: FudgeNetwork.ClientDataType) => {
        let ultimateAnswer: RTCSessionDescription;
        // Signaling example from here https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/createAnswer
        _remoteMeshClient.rtcPeerConnection.createAnswer()
            .then(async (answer) => {
                console.log("Create Answer before settign local desc: Expected 'have-remote-offer', got:  ", _remoteMeshClient.rtcPeerConnection.signalingState);
                ultimateAnswer = new RTCSessionDescription(answer);
                return await _remoteMeshClient.rtcPeerConnection.setLocalDescription(ultimateAnswer);
            }).then(async () => {
                console.log("CreateAnswerFunction after setting local descp, Expected 'stable', got:  ", _remoteMeshClient.rtcPeerConnection.signalingState);

                const answerMessage: FudgeNetwork.NetworkMessageRtcAnswer =
                    new FudgeNetwork.NetworkMessageRtcAnswer(this.localClientID, _remoteMeshClient.id, "", ultimateAnswer);
                console.log("AnswerObject: ", answerMessage);
                await this.sendMessageToSignalingServer(answerMessage);
            })
            .catch((error) => {
                console.error("Unexpected error: Creating RTC Answer failed", error);
            });
    }
    public receiveAnswerAndSetRemoteDescription = (_rtcAnswer: FudgeNetwork.NetworkMessageRtcAnswer) => {
        try {
            let descriptionAnswer: RTCSessionDescription = new RTCSessionDescription(_rtcAnswer.answer);
            let remoteClientId: string = _rtcAnswer.originatorId;

            this.currentlyNegotiatingClient.rtcPeerConnection.setRemoteDescription(descriptionAnswer);

        } catch (error) {
            console.error("Unexpected Error: Setting Remote Description from Answer", error);
        }
    }




    // tslint:disable-next-line: no-any
    public sendIceCandidatesToPeer = ({ candidate }: any) => {
        try {
            let message: FudgeNetwork.NetworkMessageIceCandidate = new FudgeNetwork.NetworkMessageIceCandidate(this.localClientID, this.currentlyNegotiatingClient.id, candidate);
            this.sendMessageToSignalingServer(message);
        } catch (error) {
            console.error("Unexpected Error: Creating and Sending ICECandidates to Peer", error);
        }
    }
    public addReceivedCandidateToPeerConnection = async (_receivedIceMessage: FudgeNetwork.NetworkMessageIceCandidate) => {
        let relevantClient = this.searchNegotiatingClientById(_receivedIceMessage.originatorId, this.remoteMeshClients)

        try {
            if (relevantClient) {
                await relevantClient.rtcPeerConnection.addIceCandidate(_receivedIceMessage.candidate);
            }
        } catch (error) {
            console.error("Unexpected Error: Adding Ice Candidate", error);
        }

    }




    public receiveDataChannelAndEstablishConnection = (_event: { channel: RTCDataChannel | undefined; }) => {
        if (_event.channel) {
            this.currentlyNegotiatingClient.rtcDataChannel = _event.channel;

            this.currentlyNegotiatingClient.rtcDataChannel.addEventListener("message", this.dataChannelMessageHandler);
            this.currentlyNegotiatingClient.rtcDataChannel.addEventListener("open", () => {
                console.log("Connection esabtlished");
            });
            this.currentlyNegotiatingClient.rtcDataChannel.addEventListener("close", this.dataChannelStatusChangeHandler);
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


    public sendMessageToSignalingServer = (_message: Object) => {
        let stringifiedMessage: string = this.stringifyObjectForNetworkSending(_message);
        if (this.webSocketConnectionToSignalingServer.readyState == 1) {
            this.webSocketConnectionToSignalingServer.send(stringifiedMessage);
        }
        else {
            console.error("Websocket Connection closed unexpectedly");
        }
    }


    public enableKeyboardPressesForSending = (_keyCode: number) => {
        //EScape knopf
        if (_keyCode == 27) {

        }
        else {
            this.sendKeyPress(_keyCode);
        }
    }
    public sendKeyPress = (_keyCode: number) => {
        // try {
        //     if (this.remoteEventPeerDataChannel != undefined) {
        //         let keyPressMessage: FudgeNetwork.PeerMessageKeysInput = new FudgeNetwork.PeerMessageKeysInput(this.localClientID, _keyCode);
        //         let stringifiedObject: string = this.stringifyObjectForNetworkSending(keyPressMessage);
        //         this.sendMessageToServerViaDataChannel(stringifiedObject);
        //     }
        // } catch (error) { console.error("Unexpected Error: Send Key Press", error); }
    }



    private searchNegotiatingClientById(_idToSearch: string, arrayToSearch: FudgeNetwork.ClientDataType[]): FudgeNetwork.ClientDataType | null {
        arrayToSearch.forEach(meshClient => {
            if (meshClient.id === _idToSearch) {
                return meshClient;
            }
        });
        return null;
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
            FudgeNetwork.UiElementHandler.chatbox.scrollTop = FudgeNetwork.UiElementHandler.chatbox.scrollHeight;
        }
    }



    private setOwnClientId(_id: string) {
        this.localClientID = _id;
    }
    public getLocalClientId(): string {
        return this.localClientID;
    }


    private setOwnUserName(_name: string): void {
        this.localUserName = _name;
    }
    public getLocalUserName(): string {
        return this.localUserName == "" || undefined ? "Kein Username vergeben" : this.localUserName;
    }


    private dataChannelStatusChangeHandler = (event: Event) => {
        //TODO Reconnection logic
        console.log("Channel Event happened", event);
    }
}
