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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FudgeServerWebSocket = void 0;
const ws_1 = __importDefault(require("ws"));
const FudgeNetwork = __importStar(require("../ModuleCollector"));
const DataHandling_1 = require("../DataHandling");
class FudgeServerWebSocket {
    constructor() {
        this.connectedClientsCollection = new Array();
        this.startUpServer = (_serverPort) => {
            console.log(_serverPort);
            if (!_serverPort) {
                this.websocketServer = new ws_1.default.Server({ port: 8080 });
            }
            else {
                this.websocketServer = new ws_1.default.Server({ port: _serverPort });
            }
            this.addServerEventHandling();
        };
        this.closeDownServer = () => {
            this.websocketServer.close();
        };
        this.addServerEventHandling = () => {
            // tslint:disable-next-line: no-any
            this.websocketServer.on("connection", (_websocketClient) => {
                console.log("User connected to P2P SignalingServer");
                try {
                    const uniqueIdOnConnection = this.createID();
                    this.sendTo(_websocketClient, new FudgeNetwork.NetworkMessageIdAssigned(uniqueIdOnConnection));
                    const freshlyConnectedClient = new FudgeNetwork.ClientDataType(_websocketClient, uniqueIdOnConnection);
                    this.connectedClientsCollection.push(freshlyConnectedClient);
                }
                catch (error) {
                    console.error("Unhandled Exception SERVER: Sending ID to ClientDataType", error);
                }
                _websocketClient.on("message", (_message) => {
                    this.serverDistributeMessageToAppropriateMethod(_message, _websocketClient);
                });
                _websocketClient.addEventListener("close", () => {
                    console.error("Error at connection");
                    for (let i = 0; i < this.connectedClientsCollection.length; i++) {
                        if (this.connectedClientsCollection[i].clientConnection === _websocketClient) {
                            console.log("FudgeNetwork.ClientDataType found, deleting");
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
        this.parseMessageAndReturnObject = (_stringifiedMessage) => {
            let parsedMessage = { originatorId: " ", messageType: FudgeNetwork.MESSAGE_TYPE.UNDEFINED };
            try {
                parsedMessage = JSON.parse(_stringifiedMessage);
                return parsedMessage;
            }
            catch (error) {
                console.error("Invalid JSON", error);
            }
            return parsedMessage;
        };
        this.createID = () => {
            // Math.random should be random enough because of it's seed
            // convert to base 36 and pick the first few digits after comma
            return "_" + Math.random().toString(36).substr(2, 7);
        };
        this.stringifyObjectToString = (_objectToStringify) => {
            return JSON.stringify(_objectToStringify);
        };
        // TODO Type Websocket not assignable to type WebSocket ?!
        // tslint:disable-next-line: no-any
        this.sendTo = (_connection, _message) => {
            let stringifiedMessage = "";
            if (typeof (_message) == "object") {
                stringifiedMessage = JSON.stringify(_message);
            }
            else if (typeof (_message) == "string") {
                stringifiedMessage = _message;
            }
            _connection.send(stringifiedMessage);
        };
        // Helper function for searching through a collection, finding objects by key and value, returning
        // Object that has that value
        // tslint:disable-next-line: no-any
        this.searchForPropertyValueInCollection = (propertyValue, key, collectionToSearch) => {
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
        this.searchUserByUserNameAndReturnUser = (_userNameToSearchFor, _collectionToSearch) => {
            return this.searchForPropertyValueInCollection(_userNameToSearchFor, "userName", _collectionToSearch);
        };
        this.searchUserByUserIdAndReturnUser = (_userIdToSearchFor, _collectionToSearch) => {
            return this.searchForPropertyValueInCollection(_userIdToSearchFor, "id", _collectionToSearch);
        };
        this.searchUserByWebsocketConnectionAndReturnUser = (_websocketConnectionToSearchFor, _collectionToSearch) => {
            return this.searchForPropertyValueInCollection(_websocketConnectionToSearchFor, "clientConnection", _collectionToSearch);
        };
    }
    // TODO Check if event.type can be used for identification instead => It cannot
    serverDistributeMessageToAppropriateMethod(_message, _websocketClient) {
        let objectifiedMessage = this.parseMessageAndReturnObject(_message);
        if (!objectifiedMessage.messageType) {
            console.error("Unhandled Exception: Invalid Message Object received. Does it implement MessageBase?");
            return;
        }
        console.log(objectifiedMessage, _message);
        if (objectifiedMessage != null) {
            switch (objectifiedMessage.messageType) {
                case FudgeNetwork.MESSAGE_TYPE.ID_ASSIGNED:
                    console.log("Id confirmation received for client: " + objectifiedMessage.originatorId);
                    break;
                case FudgeNetwork.MESSAGE_TYPE.LOGIN_REQUEST:
                    this.addUserOnValidLoginRequest(_websocketClient, objectifiedMessage);
                    break;
                case FudgeNetwork.MESSAGE_TYPE.CLIENT_TO_SERVER_MESSAGE:
                    this.displayMessageOnServer(objectifiedMessage);
                    this.broadcastMessageToAllConnectedClients(objectifiedMessage);
                    break;
                default:
                    console.log("Message type not recognized");
                    break;
            }
        }
    }
    displayMessageOnServer(_objectifiedMessage) {
        if (DataHandling_1.UiElementHandler.webSocketServerChatBox != null || undefined) {
            let username = this.searchForClientWithId(_objectifiedMessage.originatorId).userName;
            DataHandling_1.UiElementHandler.webSocketServerChatBox.innerHTML += "\n" + _objectifiedMessage.originatorUserName + ": " + _objectifiedMessage.messageData;
        }
        else {
            console.log("To display the message, add appropriate UiElemenHandler object");
        }
    }
    //#region MessageHandler
    addUserOnValidLoginRequest(_websocketConnection, _messageData) {
        let usernameTaken = true;
        usernameTaken = this.searchUserByUserNameAndReturnUser(_messageData.loginUserName, this.connectedClientsCollection) != null;
        try {
            if (!usernameTaken) {
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
        catch (error) {
            console.error("Unhandled Exception: Unable to create or send LoginResponse", error);
        }
    }
    broadcastMessageToAllConnectedClients(_messageToBroadcast) {
        if (DataHandling_1.UiElementHandler.webSocketServerChatBox != null || undefined) {
            DataHandling_1.UiElementHandler.webSocketServerChatBox.innerHTML += "\n" + "SERVER: " + _messageToBroadcast.messageData;
        }
        else {
            console.log("To display the message, add appropriate UiElemenHandler object");
        }
        let clientArray = Array.from(this.websocketServer.clients);
        clientArray.forEach(_client => {
            this.sendTo(_client, _messageToBroadcast);
        });
    }
    searchForClientWithId(_idToFind) {
        return this.searchForPropertyValueInCollection(_idToFind, "id", this.connectedClientsCollection);
    }
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
}
exports.FudgeServerWebSocket = FudgeServerWebSocket;
