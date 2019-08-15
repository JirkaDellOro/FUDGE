import WebSocket from "ws";
import * as FudgeNetwork from "../ModuleCollector";

export class PeerToPeerSignalingServer {
    public static websocketServer: WebSocket.Server;
    public static connectedClientsCollection: FudgeNetwork.Client[] = new Array();

    public static startUpServer = (_serverPort?: number) => {
        console.log(_serverPort);
        if (!_serverPort) {
            PeerToPeerSignalingServer.websocketServer = new WebSocket.Server({ port: 8080 });
        }
        else {
            PeerToPeerSignalingServer.websocketServer = new WebSocket.Server({ port: _serverPort });

        }
        PeerToPeerSignalingServer.serverEventHandler();
    }

    public static closeDownServer = () => {
        PeerToPeerSignalingServer.websocketServer.close();
    }
    public static serverEventHandler = (): void => {
        // tslint:disable-next-line: no-any
        PeerToPeerSignalingServer.websocketServer.on("connection", (_websocketClient: any) => {
            console.log("User connected to P2P SignalingServer");

            try {
                const uniqueIdOnConnection: string = PeerToPeerSignalingServer.createID();
                PeerToPeerSignalingServer.sendTo(_websocketClient, new FudgeNetwork.NetworkMessageIdAssigned(uniqueIdOnConnection));
                const freshlyConnectedClient: FudgeNetwork.Client = new FudgeNetwork.Client(_websocketClient, uniqueIdOnConnection);
                PeerToPeerSignalingServer.connectedClientsCollection.push(freshlyConnectedClient);
            } catch (error) {
                console.error("Unhandled Exception SERVER: Sending ID to Client", error);
            }


            _websocketClient.on("message", (_message: string) => {
                PeerToPeerSignalingServer.serverDistributeMessageToAppropriateMethod(_message, _websocketClient);
            });

            _websocketClient.addEventListener("close", () => {
                console.error("Error at connection");
                for (let i: number = 0; i < PeerToPeerSignalingServer.connectedClientsCollection.length; i++) {
                    if (PeerToPeerSignalingServer.connectedClientsCollection[i].clientConnection === _websocketClient) {
                        console.log("FudgeNetwork.Client found, deleting");
                        PeerToPeerSignalingServer.connectedClientsCollection.splice(i, 1);
                        console.log(PeerToPeerSignalingServer.connectedClientsCollection);
                    }
                    else {
                        console.log("Wrong client to delete, moving on");
                    }
                }
            });

        });
    }

    public static parseMessageAndReturnObject = (_stringifiedMessage: string): Object => {
        let parsedMessage: FudgeNetwork.NetworkMessageMessageBase = { originatorId: " ", messageType: FudgeNetwork.MESSAGE_TYPE.UNDEFINED };
        try {
            parsedMessage = JSON.parse(_stringifiedMessage);
            return parsedMessage;

        } catch (error) {
            console.error("Invalid JSON", error);
        }
        return parsedMessage;
    }

    // TODO Check if event.type can be used for identification instead => It cannot
    public static serverDistributeMessageToAppropriateMethod(_message: string, _websocketClient: WebSocket): void {
        let objectifiedMessage: FudgeNetwork.NetworkMessageMessageBase = <FudgeNetwork.NetworkMessageMessageBase>this.parseMessageAndReturnObject(_message);
        if (!objectifiedMessage.messageType) {
            console.error("Unhandled Exception: Invalid Message Object received. Does it implement MessageBase?");
            return;
        }
        if (objectifiedMessage != null) {
            switch (objectifiedMessage.messageType) {
                case FudgeNetwork.MESSAGE_TYPE.ID_ASSIGNED:
                    console.log("Id confirmation received for client: " + objectifiedMessage.originatorId);
                    break;

                case FudgeNetwork.MESSAGE_TYPE.LOGIN_REQUEST:
                    PeerToPeerSignalingServer.addUserOnValidLoginRequest(_websocketClient, <FudgeNetwork.NetworkMessageLoginRequest>objectifiedMessage);
                    break;

                case FudgeNetwork.MESSAGE_TYPE.RTC_OFFER:
                    PeerToPeerSignalingServer.sendRtcOfferToRequestedClient(_websocketClient, <FudgeNetwork.NetworkMessageRtcOffer>objectifiedMessage);
                    break;

                case FudgeNetwork.MESSAGE_TYPE.RTC_ANSWER:
                    PeerToPeerSignalingServer.answerRtcOfferOfClient(_websocketClient, <FudgeNetwork.NetworkMessageRtcAnswer>objectifiedMessage);
                    break;

                case FudgeNetwork.MESSAGE_TYPE.ICE_CANDIDATE:
                    PeerToPeerSignalingServer.sendIceCandidatesToRelevantPeers(_websocketClient, <FudgeNetwork.NetworkMessageIceCandidate>objectifiedMessage);
                    break;

                default:
                    console.log("Message type not recognized");
                    break;

            }
        }
    }

    //#region MessageHandler
    public static addUserOnValidLoginRequest(_websocketConnection: WebSocket, _messageData: FudgeNetwork.NetworkMessageLoginRequest): void {
        let usernameTaken: boolean = true;
        usernameTaken = PeerToPeerSignalingServer.searchUserByUserNameAndReturnUser(_messageData.loginUserName, PeerToPeerSignalingServer.connectedClientsCollection) != null;
        try {
            if (!usernameTaken) {
                const clientBeingLoggedIn: FudgeNetwork.Client = PeerToPeerSignalingServer.searchUserByWebsocketConnectionAndReturnUser(_websocketConnection, PeerToPeerSignalingServer.connectedClientsCollection);

                if (clientBeingLoggedIn != null) {
                    clientBeingLoggedIn.userName = _messageData.loginUserName;
                    PeerToPeerSignalingServer.sendTo(_websocketConnection, new FudgeNetwork.NetworkMessageLoginResponse(true, clientBeingLoggedIn.id, clientBeingLoggedIn.userName));
                }
            } else {
                PeerToPeerSignalingServer.sendTo(_websocketConnection, new FudgeNetwork.NetworkMessageLoginResponse(false, "", ""));
                usernameTaken = true;
                console.log("UsernameTaken");
            }
        } catch (error) {
            console.error("Unhandled Exception: Unable to create or send LoginResponse", error);
        }
    }

    public static sendRtcOfferToRequestedClient(_websocketClient: WebSocket, _messageData: FudgeNetwork.NetworkMessageRtcOffer): void {
        console.log("Sending offer to: ", _messageData.userNameToConnectTo);
        const requestedClient: FudgeNetwork.Client = PeerToPeerSignalingServer.searchForPropertyValueInCollection(_messageData.userNameToConnectTo, "userName", PeerToPeerSignalingServer.connectedClientsCollection);

        if (requestedClient != null) {
            const offerMessage: FudgeNetwork.NetworkMessageRtcOffer = new FudgeNetwork.NetworkMessageRtcOffer(_messageData.originatorId, requestedClient.userName, _messageData.offer);
            try {
                PeerToPeerSignalingServer.sendTo(requestedClient.clientConnection, offerMessage);
            } catch (error) {
                console.error("Unhandled Exception: Unable to relay Offer to Client", error);
            }
        } else { console.error("User to connect to doesn't exist under that Name"); }
    }

    public static answerRtcOfferOfClient(_websocketClient: WebSocket, _messageData: FudgeNetwork.NetworkMessageRtcAnswer): void {
        console.log("Sending answer to: ", _messageData.targetId);
        const clientToSendAnswerTo: FudgeNetwork.Client = PeerToPeerSignalingServer.searchUserByUserIdAndReturnUser(_messageData.targetId, PeerToPeerSignalingServer.connectedClientsCollection);

        if (clientToSendAnswerTo != null) {
            // TODO Probable source of error, need to test
            if (clientToSendAnswerTo.clientConnection != null)
                PeerToPeerSignalingServer.sendTo(clientToSendAnswerTo.clientConnection, _messageData);
        }
    }

    public static sendIceCandidatesToRelevantPeers(_websocketClient: WebSocket, _messageData: FudgeNetwork.NetworkMessageIceCandidate): void {
        const clientToShareCandidatesWith: FudgeNetwork.Client = PeerToPeerSignalingServer.searchUserByUserIdAndReturnUser(_messageData.targetId, PeerToPeerSignalingServer.connectedClientsCollection);

        if (clientToShareCandidatesWith != null) {
            const candidateToSend: FudgeNetwork.NetworkMessageIceCandidate = new FudgeNetwork.NetworkMessageIceCandidate(_messageData.originatorId, clientToShareCandidatesWith.id, _messageData.candidate);
            PeerToPeerSignalingServer.sendTo(clientToShareCandidatesWith.clientConnection, candidateToSend);
        }
    }

    //#endregion

    //#region Helperfunctions



    public static searchForClientWithId(_idToFind: string): FudgeNetwork.Client {
        return this.searchForPropertyValueInCollection(_idToFind, "id", this.connectedClientsCollection);
    }

    public static createID = (): string => {
        // Math.random should be random enough because of it's seed
        // convert to base 36 and pick the first few digits after comma
        return "_" + Math.random().toString(36).substr(2, 7);
    }
    //#endregion


    public static parseMessageToJson(_messageToParse: string): FudgeNetwork.NetworkMessageMessageBase {
        let parsedMessage: FudgeNetwork.NetworkMessageMessageBase = { originatorId: " ", messageType: FudgeNetwork.MESSAGE_TYPE.UNDEFINED };

        try {
            parsedMessage = JSON.parse(_messageToParse);
        } catch (error) {
            console.error("Invalid JSON", error);
        }
        return parsedMessage;
    }

    // TODO Type Websocket not assignable to type WebSocket ?!
    // tslint:disable-next-line: no-any
    public static sendTo = (_connection: any, _message: Object) => {
        _connection.send(JSON.stringify(_message));
    }

    // Helper function for searching through a collection, finding objects by key and value, returning
    // Object that has that value
    // tslint:disable-next-line: no-any
    private static searchForPropertyValueInCollection = (propertyValue: any, key: string, collectionToSearch: any[]) => {
        for (const propertyObject in collectionToSearch) {
            if (PeerToPeerSignalingServer.connectedClientsCollection.hasOwnProperty(propertyObject)) {
                // tslint:disable-next-line: typedef
                const objectToSearchThrough = collectionToSearch[propertyObject];
                if (objectToSearchThrough[key] === propertyValue) {
                    return objectToSearchThrough;
                }
            }
        }
        return null;
    }

    private static searchUserByUserNameAndReturnUser = (_userNameToSearchFor: string, _collectionToSearch: FudgeNetwork.Client[]): FudgeNetwork.Client => {
        return PeerToPeerSignalingServer.searchForPropertyValueInCollection(_userNameToSearchFor, "userName", _collectionToSearch);
    }
    private static searchUserByUserIdAndReturnUser = (_userIdToSearchFor: string, _collectionToSearch: FudgeNetwork.Client[]): FudgeNetwork.Client => {
        return PeerToPeerSignalingServer.searchForPropertyValueInCollection(_userIdToSearchFor, "id", _collectionToSearch);
    }

    private static searchUserByWebsocketConnectionAndReturnUser = (_websocketConnectionToSearchFor: WebSocket, _collectionToSearch: FudgeNetwork.Client[]) => {
        return PeerToPeerSignalingServer.searchForPropertyValueInCollection(_websocketConnectionToSearchFor, "clientConnection", _collectionToSearch);
    }
}

// TODO call this only when starting server via node
//   PeerToPeerSignalingServer.startUpServer();
function initServerFromCommandLine(): void {
    // tslint:disable-next-line: no-any
    process.argv.forEach(function (val: any, index: any, array: any): void {
        if (val === "NodeServer") {
            PeerToPeerSignalingServer.startUpServer();
            return;
        }
    });
}

initServerFromCommandLine();