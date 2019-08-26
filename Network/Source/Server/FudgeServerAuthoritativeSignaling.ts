import WebSocket from "ws";
import * as FudgeNetwork from "../ModuleCollector";
export class FudgeServerAuthoritativeSignaling implements FudgeNetwork.SignalingServer {

    public websocketServer!: WebSocket.Server;
    public connectedClientsCollection: FudgeNetwork.ClientDataType[] = new Array();
    private authoritativeServerManager!: FudgeNetwork.FudgeServerAuthoritativeManager;

    public startUpServer = (_serverPort?: number) => {
        console.log(_serverPort);
        if (!_serverPort) {
            this.websocketServer = new WebSocket.Server({ port: 8080 });
        }
        else {
            this.websocketServer = new WebSocket.Server({ port: _serverPort });

        }
        this.setAuthoritativeServerEntity(new FudgeNetwork.FudgeServerAuthoritativeManager());
        this.authoritativeServerManager.signalingServer = this;
        this.addServerEventHandling();
    }

    private setAuthoritativeServerEntity(_entity: FudgeNetwork.FudgeServerAuthoritativeManager) {
        if (this.authoritativeServerManager) {
            console.error("Server Entity already exists, did you try to assign it twice?");
        }
        else {
            this.authoritativeServerManager = _entity;
        }
    }
    public getAuthoritativeServerEntity(): FudgeNetwork.FudgeServerAuthoritativeManager {
        return this.authoritativeServerManager;
    }

    public closeDownServer = () => {
        this.websocketServer.close();
    }

    public addServerEventHandling = (): void => {
        // tslint:disable-next-line: no-any
        this.websocketServer.on("connection", (_websocketClient: any) => {
            console.log("User connected to autho-SignalingServer");

            const uniqueIdOnConnection: string = this.createID();
            const freshlyConnectedClient: FudgeNetwork.ClientDataType = new FudgeNetwork.ClientDataType(_websocketClient, uniqueIdOnConnection);
            this.sendTo(_websocketClient, new FudgeNetwork.NetworkMessageIdAssigned(uniqueIdOnConnection));
            this.connectedClientsCollection.push(freshlyConnectedClient);

            this.authoritativeServerManager.collectClientCreatePeerConnectionAndCreateOffer(freshlyConnectedClient);


            _websocketClient.on("message", (_message: string) => {
                this.serverDistributeMessageToAppropriateMethod(_message, _websocketClient);
            });

            _websocketClient.addEventListener("close", (error: Event) => {
                console.error("Error at connection", error);
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

    // TODO Check if event.type can be used for identification instead => It cannot
    public serverDistributeMessageToAppropriateMethod(_message: string, _websocketClient: WebSocket): void {
        let parsedMessage: FudgeNetwork.NetworkMessageMessageBase = { originatorId: " ", messageType: FudgeNetwork.MESSAGE_TYPE.UNDEFINED };
        try {
            parsedMessage = JSON.parse(_message);

        } catch (error) {
            console.error("Invalid JSON", error);
        }

        // tslint:disable-next-line: no-any
        const messageData: any = parsedMessage;

        if (parsedMessage != null) {
            switch (parsedMessage.messageType) {
                case FudgeNetwork.MESSAGE_TYPE.ID_ASSIGNED:
                    console.log("Id confirmation received for client: " + parsedMessage.originatorId);
                    break;

                case FudgeNetwork.MESSAGE_TYPE.RTC_ANSWER:
                    this.answerRtcOfferOfClient(_websocketClient, messageData);
                    break;

                case FudgeNetwork.MESSAGE_TYPE.ICE_CANDIDATE:
                    this.sendIceCandidatesToRelevantPeer(_websocketClient, messageData);
                    break;

                default:
                    console.log("Message type not recognized");
                    break;

            }
        }
    }

    //#region MessageHandler
    public addUserOnValidLoginRequest(_websocketConnection: WebSocket, _messageData: FudgeNetwork.NetworkMessageLoginRequest): void {
        console.log("User logged: ", _messageData.loginUserName);
        let usernameTaken: boolean = true;
        usernameTaken = this.searchUserByUserNameAndReturnUser(_messageData.loginUserName, this.connectedClientsCollection) != null;

        if (!usernameTaken) {
            console.log("Username available, logging in");
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
    }

    public sendRtcOfferToRequestedClient(_websocketClient: WebSocket, _messageData: FudgeNetwork.NetworkMessageRtcOffer): void {
        console.log("Sending offer to: ", _messageData.userNameToConnectTo);
        const requestedClient: FudgeNetwork.ClientDataType = this.searchForPropertyValueInCollection(_messageData.userNameToConnectTo, "userName", this.connectedClientsCollection);

        if (requestedClient != null) {
            const offerMessage: FudgeNetwork.NetworkMessageRtcOffer = new FudgeNetwork.NetworkMessageRtcOffer(_messageData.originatorId, requestedClient.userName, _messageData.offer);
            this.sendTo(requestedClient.clientConnection, offerMessage);
        } else { console.error("User to connect to doesn't exist under that Name"); }
    }

    public answerRtcOfferOfClient(_websocketClient: WebSocket, _messageData: FudgeNetwork.NetworkMessageRtcAnswer): void {
        console.log("Sending answer to AS-Entity");
        this.authoritativeServerManager.receiveAnswerAndSetRemoteDescription(_websocketClient, _messageData);

    }

    public sendIceCandidatesToRelevantPeer(_webSocketClient: WebSocket, _messageData: FudgeNetwork.NetworkMessageIceCandidate): void {
        // _webSocketClient is only needed for two things 
        // 1) satisfy the interface 
        // 2) if you intend to split up signaling server and authoritative server
        this.authoritativeServerManager.addIceCandidateToServerConnection(_messageData);
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
        let stringifiedObject: string = this.stringifyObjectAndReturnJson(_message);
        _connection.send(stringifiedObject);
    }

    public sendToId = (_clientId: string, _message: Object) => {
        let client: FudgeNetwork.ClientDataType = this.searchForClientWithId(_clientId);
        let stringifiedObject: string = this.stringifyObjectAndReturnJson(_message);

        if (client.clientConnection) {
            client.clientConnection.send(stringifiedObject);
        }

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

    private stringifyObjectAndReturnJson = (_objectToStringify: Object): string => {
        let stringifiedObject: string = "";
        try {
            stringifiedObject = JSON.stringify(_objectToStringify);
        } catch (error) {
            console.error("Unhandled Exception: Unable to stringify Object", error);
        }
        return stringifiedObject;
    }
}