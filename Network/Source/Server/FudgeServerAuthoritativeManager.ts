import * as FudgeNetwork from "../ModuleCollector";
export class FudgeServerAuthoritativeManager {

    // tslint:disable-next-line: no-any
    public signalingServer: any;
    public authServerPeerConnectedClientCollection: FudgeNetwork.ClientDataType[] = new Array();
    public peerConnectionBufferCollection: RTCDataChannel[] = new Array();
    private divAndPlayerMap: [string, HTMLElement][] = new Array();

    private movementSpeed = 3;

    // tslint:disable-next-line: typedef
    public configuration = {
        iceServers: [
            { urls: "stun:stun2.1.google.com:19302" },
            { urls: "stun:stun.example.com" }
        ]
    };

    constructor() {
        console.log("AuthoritativeServerStartet");
    }

    public collectClientCreatePeerConnectionAndCreateOffer = (_freshlyConnectedClient: FudgeNetwork.ClientDataType) => {
        let newPeerConnection: RTCPeerConnection = new RTCPeerConnection(this.configuration);
        newPeerConnection.addEventListener("icecandidate", this.sendNewIceCandidatesToPeer);
        _freshlyConnectedClient.rtcPeerConnection = newPeerConnection;
        this.authServerPeerConnectedClientCollection.push(_freshlyConnectedClient);
        this.initiateConnectionByCreatingDataChannelAndCreatingOffer(_freshlyConnectedClient);
        this.addMovingDivForClient(_freshlyConnectedClient.id);
    }

    public createID = (): string => {
        // Math.random should be random enough because of it's seed
        // convert to base 36 and pick the first few digits after comma
        return "_" + Math.random().toString(36).substr(2, 7);
    }

    public addIceCandidateToServerConnection = async (_receivedIceMessage: FudgeNetwork.NetworkMessageIceCandidate) => {
        if (_receivedIceMessage.candidate) {
            let client: FudgeNetwork.ClientDataType = this.searchUserByUserIdAndReturnUser(_receivedIceMessage.originatorId, this.authServerPeerConnectedClientCollection);
            console.log("server received candidates from: ", client);
            await client.rtcPeerConnection.addIceCandidate(_receivedIceMessage.candidate);
        }
    }

    public parseMessageToJson = (_messageToParse: string): FudgeNetwork.NetworkMessageMessageBase => {
        let parsedMessage: FudgeNetwork.NetworkMessageMessageBase = { originatorId: " ", messageType: FudgeNetwork.MESSAGE_TYPE.UNDEFINED };
        try {
            parsedMessage = JSON.parse(_messageToParse);
        } catch (error) {
            console.error("Invalid JSON", error);
        }
        return parsedMessage;
    }

    // tslint:disable-next-line: no-any
    public receiveAnswerAndSetRemoteDescription = (_websocketClient: any, _answer: FudgeNetwork.NetworkMessageRtcAnswer) => {
        console.log("Received answer");
        let clientToConnect: FudgeNetwork.ClientDataType = this.searchUserByWebsocketConnectionAndReturnUser(_websocketClient, this.authServerPeerConnectedClientCollection);
        console.log(clientToConnect);
        let descriptionAnswer: RTCSessionDescription = new RTCSessionDescription(_answer.answer);
        clientToConnect.rtcPeerConnection.setRemoteDescription(descriptionAnswer);
        console.log("Remote Description set");
    }

    public broadcastMessageToAllConnectedClients = (_messageToBroadcast: string) => {
        this.authServerPeerConnectedClientCollection.forEach(client => {
            if (client.rtcDataChannel.readyState == "open") {
                client.rtcDataChannel.send(_messageToBroadcast);
            }
            else {
                console.error("Connection closed abnormally for: ", client);
            }
        });

    }

    // TODO Use or delete
    // tslint:disable-next-line: no-any
    private sendNewIceCandidatesToPeer = ({ candidate }: any) => {
        console.log("Server wants to send ice candidates to peer.", candidate);
        // let message: NetworkMessages.IceCandidate = new NetworkMessages.IceCandidate("SERVER", this.remoteClientId, candidate);
        // this.sendMessage(message);

    }

    private handleServerCommands = (_commandMessage: FudgeNetwork.PeerMessageTemplate) => {
        switch (_commandMessage.commandType) {
            case FudgeNetwork.SERVER_COMMAND_TYPE.DISCONNECT_CLIENT:
                this.disconnectClientByOwnCommand(_commandMessage);
                break;
            case FudgeNetwork.SERVER_COMMAND_TYPE.KEYS_INPUT:
                this.handleKeyInputFromClient(<FudgeNetwork.PeerMessageKeysInput>_commandMessage);
                break;

            default:
                console.log("No idea what message this is", _commandMessage);
                break;
        }
    }




    private initiateConnectionByCreatingDataChannelAndCreatingOffer = (_clientToConnect: FudgeNetwork.ClientDataType): void => {
        console.log("Initiating connection to : " + _clientToConnect);
        let newDataChannel: RTCDataChannel = _clientToConnect.rtcPeerConnection.createDataChannel(_clientToConnect.id);
        _clientToConnect.rtcDataChannel = newDataChannel;
        newDataChannel.addEventListener("open", this.dataChannelStatusChangeHandler);
        // newDataChannel.addEventListener("close", this.dataChannelStatusChangeHandler);
        newDataChannel.addEventListener("message", this.dataChannelMessageHandler);
        _clientToConnect.rtcPeerConnection.createOffer()
            .then(async (offer) => {
                console.log("Beginning of createOffer in InitiateConnection, Expected 'stable', got:  ", _clientToConnect.rtcPeerConnection.signalingState);
                return offer;
            })
            .then(async (offer) => {
                await _clientToConnect.rtcPeerConnection.setLocalDescription(offer);
                console.log("Setting LocalDesc, Expected 'have-local-offer', got:  ", _clientToConnect.rtcPeerConnection.signalingState);
            })
            .then(() => {
                this.createOfferMessageAndSendToRemote(_clientToConnect);
            })
            .catch(() => {
                console.error("Offer creation error");
            });
    }

    private createOfferMessageAndSendToRemote = (_clientToConnect: FudgeNetwork.ClientDataType) => {
        console.log("Sending offer now");
        const offerMessage: FudgeNetwork.NetworkMessageRtcOffer = new FudgeNetwork.NetworkMessageRtcOffer("SERVER", _clientToConnect.id, _clientToConnect.rtcPeerConnection.localDescription);
        this.signalingServer.sendToId(_clientToConnect.id, offerMessage);
    }



    private disconnectClientByOwnCommand = (_commandMessage: FudgeNetwork.PeerMessageDisconnectClient) => {
        let clientToDisconnect: FudgeNetwork.ClientDataType = this.searchUserByUserIdAndReturnUser(_commandMessage.originatorId, this.authServerPeerConnectedClientCollection);
        clientToDisconnect.rtcDataChannel.close();
    }

    private handleKeyInputFromClient = (_commandMessage: FudgeNetwork.PeerMessageKeysInput) => {
        console.log(_commandMessage);
        let movingBox: HTMLElement | null;


        this.divAndPlayerMap.forEach(playerDiv => {
            if (playerDiv[0] == _commandMessage.originatorId) {
                movingBox = playerDiv[1];
                switch (+_commandMessage.pressedKey) {
                    case 37:
                        if (movingBox.style.left != null) {
                            let previousLeft = parseInt(movingBox.style.left);
                            movingBox.style.left = previousLeft - this.movementSpeed + "px";
                        }
                        break;
                    case 38:

                        if (movingBox.style.top != null) {
                            let previousTop = parseInt(movingBox.style.top);
                            movingBox.style.top = previousTop - this.movementSpeed + "px";
                        }
                        break;

                    case 39:
                        if (movingBox.style.left != null) {
                            let previousLeft = parseInt(movingBox.style.left);
                            movingBox.style.left = previousLeft + this.movementSpeed + "px";
                        }
                        break;

                    case 40:
                        if (movingBox.style.top != null) {
                            let previousTop = parseInt(movingBox.style.top);
                            movingBox.style.top = previousTop + this.movementSpeed + "px";
                        }
                        break;

                }
                movingBox.textContent = _commandMessage.pressedKey + "";
            }
            else {
                console.error("Player has no div");
                movingBox = null;
            }
        });
    }



    // tslint:disable-next-line: no-any
    private dataChannelStatusChangeHandler = (event: any) => {
        console.log("Server Datachannel opened");
    }

    private addMovingDivForClient(_playerId: string) {
        let newPlayer: HTMLElement = FudgeNetwork.UiElementHandler.addMovingDivForAuth();
        this.divAndPlayerMap.push([_playerId, newPlayer])
    }

    private dataChannelMessageHandler = (_message: MessageEvent) => {
        console.log("Message received", _message);
        // tslint:disable-next-line: no-any
        let parsedMessage: FudgeNetwork.PeerMessageTemplate = JSON.parse(_message.data);

        switch (parsedMessage.messageType) {
            case FudgeNetwork.MESSAGE_TYPE.PEER_TO_SERVER_COMMAND:
                this.handleServerCommands(parsedMessage);
        }
    }


    // Helper function for searching through a collection, finding objects by key and value, returning
    // Object that has that value
    // tslint:disable-next-line: no-any
    private searchForPropertyValueInCollection = (propertyValue: any, key: string, collectionToSearch: any[]) => {
        for (const propertyObject in collectionToSearch) {
            if (collectionToSearch.hasOwnProperty(propertyObject)) {
                // tslint:disable-next-line: typedef
                const objectToSearchThrough = collectionToSearch[propertyObject];
                if (objectToSearchThrough[key] === propertyValue) {
                    return objectToSearchThrough;
                }
            }
        }
        return null;
    }

    private searchUserByUserNameAndReturnUser = (_userNameToSearchFor: string, _collectionToSearch: FudgeNetwork.ClientDataType[]): FudgeNetwork.ClientDataType => {
        return this.searchForPropertyValueInCollection(_userNameToSearchFor, "userName", _collectionToSearch);
    }
    private searchUserByUserIdAndReturnUser = (_userIdToSearchFor: string, _collectionToSearch: FudgeNetwork.ClientDataType[]): FudgeNetwork.ClientDataType => {
        return this.searchForPropertyValueInCollection(_userIdToSearchFor, "id", _collectionToSearch);
    }

    private searchUserByWebsocketConnectionAndReturnUser = (_websocketConnectionToSearchFor: WebSocket, _collectionToSearch: FudgeNetwork.ClientDataType[]) => {
        return this.searchForPropertyValueInCollection(_websocketConnectionToSearchFor, "clientConnection", _collectionToSearch);
    }

    // public static searchForClientWithId(_idToFind: string): FudgeNetwork.Client {
    //     return this.searchForPropertyValueInCollection(_idToFind, "id", this.connectedClientsCollection);
    // }


}
