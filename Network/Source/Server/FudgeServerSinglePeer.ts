import WebSocket from "ws";
import * as FudgeNetwork from "../ModuleCollector";

export class FudgeServerSinglePeer implements FudgeNetwork.SignalingServer {
    public websocketServer!: WebSocket.Server;
    public connectedClientsCollection: FudgeNetwork.ClientDataType[] = new Array();

    public startUpServer = (_serverPort?: number) => {
        console.log(_serverPort);
        if (!_serverPort) {
            this.websocketServer = new WebSocket.Server({ port: 8080 });
        }
        else {
            this.websocketServer = new WebSocket.Server({ port: _serverPort });

        }
        this.addServerEventHandling();
    }

    public closeDownServer = () => {
        this.websocketServer.close();
    }
    public addServerEventHandling = (): void => {
        // tslint:disable-next-line: no-any
        this.websocketServer.on("connection", (_websocketClient: any) => {
            console.log("User connected to P2P SignalingServer");

            try {
                const uniqueIdOnConnection: string = this.createID();
                this.sendTo(_websocketClient, new FudgeNetwork.NetworkMessageIdAssigned(uniqueIdOnConnection));
                const freshlyConnectedClient: FudgeNetwork.ClientDataType = new FudgeNetwork.ClientDataType(_websocketClient, uniqueIdOnConnection);
                this.connectedClientsCollection.push(freshlyConnectedClient);
            } catch (error) {
                console.error("Unhandled Exception SERVER: Sending ID to Client", error);
            }


            _websocketClient.on("message", (_message: string) => {
                this.serverDistributeMessageToAppropriateMethod(_message, _websocketClient);
            });

            _websocketClient.addEventListener("close", () => {
                console.error("Error at connection");
                for (let i: number = 0; i < this.connectedClientsCollection.length; i++) {
                    if (this.connectedClientsCollection[i].clientConnection === _websocketClient) {
                        console.log("FudgeNetwork.Client found, deleting");
                        this.connectedClientsCollection.splice(i, 1);
                        console.log(this.connectedClientsCollection);
                    }
                    else {
                        console.log("Wrong client to delete, moving on");
                    }
                }
            });

        });
    }

    public parseMessageAndReturnObject = (_stringifiedMessage: string): Object => {
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
    public serverDistributeMessageToAppropriateMethod(_message: string, _websocketClient: WebSocket): void {
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
                    this.addUserOnValidLoginRequest(_websocketClient, <FudgeNetwork.NetworkMessageLoginRequest>objectifiedMessage);
                    break;

                case FudgeNetwork.MESSAGE_TYPE.RTC_OFFER:
                    this.sendRtcOfferToRequestedClient(_websocketClient, <FudgeNetwork.NetworkMessageRtcOffer>objectifiedMessage);
                    break;

                case FudgeNetwork.MESSAGE_TYPE.RTC_ANSWER:
                    this.answerRtcOfferOfClient(_websocketClient, <FudgeNetwork.NetworkMessageRtcAnswer>objectifiedMessage);
                    break;

                case FudgeNetwork.MESSAGE_TYPE.ICE_CANDIDATE:
                    this.sendIceCandidatesToRelevantPeer(_websocketClient, <FudgeNetwork.NetworkMessageIceCandidate>objectifiedMessage);
                    break;

                default:
                    console.log("Message type not recognized");
                    break;

            }
        }
    }

    //#region MessageHandler
    public addUserOnValidLoginRequest(_websocketConnection: WebSocket, _messageData: FudgeNetwork.NetworkMessageLoginRequest): void {
        let usernameTaken: boolean = true;
        usernameTaken = this.searchUserByUserNameAndReturnUser(_messageData.loginUserName, this.connectedClientsCollection) != null;
        try {
            if (!usernameTaken) {
                const clientBeingLoggedIn: FudgeNetwork.ClientDataType = this.searchUserByWebsocketConnectionAndReturnUser(_websocketConnection, this.connectedClientsCollection);

                if (clientBeingLoggedIn != null) {
                    clientBeingLoggedIn.userName = _messageData.loginUserName;
                    this.sendTo(_websocketConnection, new FudgeNetwork.NetworkMessageLoginResponse(true, clientBeingLoggedIn.id, clientBeingLoggedIn.userName));
                }
            } else {
                this.sendTo(_websocketConnection, new FudgeNetwork.NetworkMessageLoginResponse(false, "", ""));
                usernameTaken = true;
                console.log("UsernameTaken");
            }
        } catch (error) {
            console.error("Unhandled Exception: Unable to create or send LoginResponse", error);
        }
    }

    public sendRtcOfferToRequestedClient(_websocketClient: WebSocket, _messageData: FudgeNetwork.NetworkMessageRtcOffer): void {
        console.log("Sending offer to: ", _messageData.userNameToConnectTo);
        const requestedClient: FudgeNetwork.ClientDataType = this.searchForPropertyValueInCollection(_messageData.userNameToConnectTo, "userName", this.connectedClientsCollection);

        if (requestedClient != null) {
            const offerMessage: FudgeNetwork.NetworkMessageRtcOffer = new FudgeNetwork.NetworkMessageRtcOffer(_messageData.originatorId, requestedClient.userName, _messageData.offer);
            try {
                this.sendTo(requestedClient.clientConnection, offerMessage);
            } catch (error) {
                console.error("Unhandled Exception: Unable to relay Offer to Client", error);
            }
        } else { console.error("User to connect to doesn't exist under that Name"); }
    }

    public answerRtcOfferOfClient(_websocketClient: WebSocket, _messageData: FudgeNetwork.NetworkMessageRtcAnswer): void {
        console.log("Sending answer to: ", _messageData.targetId);
        const clientToSendAnswerTo: FudgeNetwork.ClientDataType = this.searchUserByUserIdAndReturnUser(_messageData.targetId, this.connectedClientsCollection);

        if (clientToSendAnswerTo != null) {
            // TODO Probable source of error, need to test
            if (clientToSendAnswerTo.clientConnection != null)
                this.sendTo(clientToSendAnswerTo.clientConnection, _messageData);
        }
    }

    public sendIceCandidatesToRelevantPeer(_websocketClient: WebSocket, _messageData: FudgeNetwork.NetworkMessageIceCandidate): void {
        const clientToShareCandidatesWith: FudgeNetwork.ClientDataType = this.searchUserByUserIdAndReturnUser(_messageData.targetId, this.connectedClientsCollection);

        if (clientToShareCandidatesWith != null) {
            const candidateToSend: FudgeNetwork.NetworkMessageIceCandidate = new FudgeNetwork.NetworkMessageIceCandidate(_messageData.originatorId, clientToShareCandidatesWith.id, _messageData.candidate);
            this.sendTo(clientToShareCandidatesWith.clientConnection, candidateToSend);
        }
    }

    //#endregion

    //#region Helperfunctions



    public searchForClientWithId(_idToFind: string): FudgeNetwork.ClientDataType {
        return this.searchForPropertyValueInCollection(_idToFind, "id", this.connectedClientsCollection);
    }

    public createID = (): string => {
        // Math.random should be random enough because of it's seed
        // convert to base 36 and pick the first few digits after comma
        return "_" + Math.random().toString(36).substr(2, 7);
    }
    //#endregion


    public parseMessageToJson(_messageToParse: string): FudgeNetwork.NetworkMessageMessageBase {
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
    public sendTo = (_connection: any, _message: Object) => {
        _connection.send(JSON.stringify(_message));
    }

    // Helper function for searching through a collection, finding objects by key and value, returning
    // Object that has that value
    // tslint:disable-next-line: no-any
    private searchForPropertyValueInCollection = (propertyValue: any, key: string, collectionToSearch: any[]) => {
        for (const propertyObject in collectionToSearch) {
            if (this.connectedClientsCollection.hasOwnProperty(propertyObject)) {
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
}

// // TODO call this only when starting server via node
// //   this.startUpServer();
// function initServerFromCommandLine(): void {
//     // tslint:disable-next-line: no-any
//     process.argv.forEach(function (val: any, index: any, array: any): void {
//         if (val === "NodeServer") {
//             startUpServer();
//             return;
//         }
//     });
// }

// initServerFromCommandLine();