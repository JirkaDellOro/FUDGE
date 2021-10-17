import WebSocket from "ws";
import * as FudgeNetwork from "../ModuleCollector.js";
export class FudgeServerAuthoritativeSignaling {
    websocketServer;
    connectedClientsCollection = new Array();
    authoritativeServerManager;
    startUpServer = (_serverPort) => {
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
    };
    getAuthoritativeServerEntity() {
        return this.authoritativeServerManager;
    }
    closeDownServer = () => {
        this.websocketServer.close();
    };
    addServerEventHandling = () => {
        // tslint:disable-next-line: no-any
        this.websocketServer.on("connection", (_websocketClient) => {
            console.log("User connected to autho-SignalingServer");
            const uniqueIdOnConnection = this.createID();
            const freshlyConnectedClient = new FudgeNetwork.ClientDataType(_websocketClient, uniqueIdOnConnection);
            this.sendTo(_websocketClient, new FudgeNetwork.NetworkMessageIdAssigned(uniqueIdOnConnection));
            this.connectedClientsCollection.push(freshlyConnectedClient);
            this.authoritativeServerManager.collectClientCreatePeerConnectionAndCreateOffer(freshlyConnectedClient);
            _websocketClient.on("message", (_message) => {
                this.serverDistributeMessageToAppropriateMethod(_message, _websocketClient);
            });
            _websocketClient.addEventListener("close", (error) => {
                console.error("Error at connection", error);
                for (let i = 0; i < this.connectedClientsCollection.length; i++) {
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
    };
    // TODO Check if event.type can be used for identification instead => It cannot
    serverDistributeMessageToAppropriateMethod(_message, _websocketClient) {
        let parsedMessage = { originatorId: " ", messageType: FudgeNetwork.MESSAGE_TYPE.UNDEFINED };
        try {
            parsedMessage = JSON.parse(_message);
        }
        catch (error) {
            console.error("Invalid JSON", error);
        }
        // tslint:disable-next-line: no-any
        const messageData = parsedMessage;
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
    addUserOnValidLoginRequest(_websocketConnection, _messageData) {
        console.log("User logged: ", _messageData.loginUserName);
        let usernameTaken = true;
        usernameTaken = this.searchUserByUserNameAndReturnUser(_messageData.loginUserName, this.connectedClientsCollection) != null;
        if (!usernameTaken) {
            console.log("Username available, logging in");
            const clientBeingLoggedIn = this.searchUserByWebsocketConnectionAndReturnUser(_websocketConnection, this.connectedClientsCollection);
            if (clientBeingLoggedIn != null) {
                clientBeingLoggedIn.userName = _messageData.loginUserName;
                this.sendTo(_websocketConnection, new FudgeNetwork.NetworkMessageLoginResponse(true, clientBeingLoggedIn.id, clientBeingLoggedIn.userName));
            }
        }
        else {
            this.sendTo(_websocketConnection, new FudgeNetwork.NetworkMessageLoginResponse(false, "", ""));
            usernameTaken = true;
            console.log("UsernameTaken");
        }
    }
    sendRtcOfferToRequestedClient(_websocketClient, _messageData) {
        console.log("Sending offer to: ", _messageData.userNameToConnectTo);
        const requestedClient = this.searchForPropertyValueInCollection(_messageData.userNameToConnectTo, "userName", this.connectedClientsCollection);
        if (requestedClient != null) {
            const offerMessage = new FudgeNetwork.NetworkMessageRtcOffer(_messageData.originatorId, requestedClient.userName, _messageData.offer);
            this.sendTo(requestedClient.clientConnection, offerMessage);
        }
        else {
            console.error("User to connect to doesn't exist under that Name");
        }
    }
    answerRtcOfferOfClient(_websocketClient, _messageData) {
        console.log("Sending answer to AS-Entity");
        this.authoritativeServerManager.receiveAnswerAndSetRemoteDescription(_websocketClient, _messageData);
    }
    sendIceCandidatesToRelevantPeer(_webSocketClient, _messageData) {
        // _webSocketClient is only needed for two things 
        // 1) satisfy the interface 
        // 2) if you intend to split up signaling server and authoritative server
        this.authoritativeServerManager.addIceCandidateToServerConnection(_messageData);
    }
    //#endregion
    //#region Helperfunctions
    searchForClientWithId(_idToFind) {
        return this.searchForPropertyValueInCollection(_idToFind, "id", this.connectedClientsCollection);
    }
    createID = () => {
        // Math.random should be random enough because of it's seed
        // convert to base 36 and pick the first few digits after comma
        return "_" + Math.random().toString(36).substr(2, 7);
    };
    //#endregion
    parseMessageToJson(_messageToParse) {
        let parsedMessage = { originatorId: " ", messageType: FudgeNetwork.MESSAGE_TYPE.UNDEFINED };
        try {
            parsedMessage = JSON.parse(_messageToParse);
        }
        catch (error) {
            console.error("Invalid JSON", error);
        }
        return parsedMessage;
    }
    // TODO Type Websocket not assignable to type WebSocket ?!
    // tslint:disable-next-line: no-any
    sendTo = (_connection, _message) => {
        let stringifiedObject = this.stringifyObjectAndReturnJson(_message);
        _connection.send(stringifiedObject);
    };
    sendToId = (_clientId, _message) => {
        let client = this.searchForClientWithId(_clientId);
        let stringifiedObject = this.stringifyObjectAndReturnJson(_message);
        if (client.clientConnection) {
            client.clientConnection.send(stringifiedObject);
        }
    };
    setAuthoritativeServerEntity(_entity) {
        if (this.authoritativeServerManager) {
            console.error("Server Entity already exists, did you try to assign it twice?");
        }
        else {
            this.authoritativeServerManager = _entity;
        }
    }
    // Helper function for searching through a collection, finding objects by key and value, returning
    // Object that has that value
    // tslint:disable-next-line: no-any
    searchForPropertyValueInCollection = (propertyValue, key, collectionToSearch) => {
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
    };
    searchUserByUserNameAndReturnUser = (_userNameToSearchFor, _collectionToSearch) => {
        return this.searchForPropertyValueInCollection(_userNameToSearchFor, "userName", _collectionToSearch);
    };
    searchUserByUserIdAndReturnUser = (_userIdToSearchFor, _collectionToSearch) => {
        return this.searchForPropertyValueInCollection(_userIdToSearchFor, "id", _collectionToSearch);
    };
    searchUserByWebsocketConnectionAndReturnUser = (_websocketConnectionToSearchFor, _collectionToSearch) => {
        return this.searchForPropertyValueInCollection(_websocketConnectionToSearchFor, "clientConnection", _collectionToSearch);
    };
    stringifyObjectAndReturnJson = (_objectToStringify) => {
        let stringifiedObject = "";
        try {
            stringifiedObject = JSON.stringify(_objectToStringify);
        }
        catch (error) {
            console.error("Unhandled Exception: Unable to stringify Object", error);
        }
        return stringifiedObject;
    };
}
