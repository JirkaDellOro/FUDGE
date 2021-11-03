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
exports.FudgeServer = void 0;
const ws_1 = __importDefault(require("ws"));
const Message = __importStar(require("./Messages.js"));
var CONNECTION;
(function (CONNECTION) {
    CONNECTION[CONNECTION["TCP"] = 0] = "TCP";
    CONNECTION[CONNECTION["RTC"] = 1] = "RTC";
})(CONNECTION || (CONNECTION = {}));
class FudgeServer {
    websocketServer;
    clients = [];
    startUpServer = (_serverPort = 8080) => {
        console.log(_serverPort);
        this.websocketServer = new ws_1.default.Server({ port: _serverPort });
        this.addServerEventHandling();
    };
    closeDownServer = () => {
        this.websocketServer.close();
    };
    addServerEventHandling = () => {
        // tslint:disable-next-line: no-any
        this.websocketServer.on("connection", (_websocketClient) => {
            console.log("User connected to FudgeServer");
            try {
                const uniqueIdOnConnection = this.createID();
                // this.sendTo(_websocketClient, new Message.IdAssigned(uniqueIdOnConnection));
                _websocketClient.send(new Message.IdAssigned(uniqueIdOnConnection).serialize());
                const freshlyConnectedClient = { connection: _websocketClient, id: uniqueIdOnConnection, peers: {} };
                this.clients.push(freshlyConnectedClient);
            }
            catch (error) {
                console.error("Unhandled Exception SERVER: Sending ID to ClientDataType", error);
            }
            _websocketClient.on("message", (_message) => {
                this.serverDistributeMessageToAppropriateMethod(_message, _websocketClient);
            });
            _websocketClient.addEventListener("close", () => {
                console.error("Error at connection");
                for (let i = 0; i < this.clients.length; i++) {
                    if (this.clients[i].connection === _websocketClient) {
                        console.log("Client connection found, deleting");
                        this.clients.splice(i, 1);
                        console.log(this.clients);
                    }
                    else {
                        console.log("Wrong client to delete, moving on");
                    }
                }
            });
        });
    };
    // public parseMessageAndReturnObject = (_stringifiedMessage: string): Object => {
    //   let parsedMessage: Message.MessageBase = { originatorId: " ", messageType: Message.MESSAGE_TYPE.UNDEFINED };
    //   try {
    //     parsedMessage = JSON.parse(_stringifiedMessage);
    //     return parsedMessage;
    //   } catch (error) {
    //     console.error("Invalid JSON", error);
    //   }
    //   return parsedMessage;
    // }
    // TODO Check if event.type can be used for identification instead => It cannot
    serverDistributeMessageToAppropriateMethod(_message, _websocketClient) {
        // let objectifiedMessage: Message.MessageBase = <Message.MessageBase>this.parseMessageAndReturnObject(_message);
        let objectifiedMessage = Message.MessageBase.deserialize(_message);
        if (!objectifiedMessage.messageType) {
            console.error("Unhandled Exception: Invalid Message Object received. Does it implement MessageBase?");
            return;
        }
        console.log(objectifiedMessage, _message);
        if (objectifiedMessage != null) {
            switch (objectifiedMessage.messageType) {
                case Message.MESSAGE_TYPE.ID_ASSIGNED:
                    console.log("Id confirmation received for client: " + objectifiedMessage.originatorId);
                    break;
                case Message.MESSAGE_TYPE.LOGIN_REQUEST:
                    this.addUserOnValidLoginRequest(_websocketClient, objectifiedMessage);
                    break;
                case Message.MESSAGE_TYPE.CLIENT_TO_SERVER_MESSAGE:
                    this.broadcastMessageToAllConnectedClients(objectifiedMessage);
                    break;
                default:
                    console.log("WebSocket: Message type not recognized");
                    break;
            }
        }
    }
    //#region MessageHandler
    addUserOnValidLoginRequest(_websocketConnection, _messageData) {
        let usernameTaken = true;
        usernameTaken = this.searchUserByUserNameAndReturnUser(_messageData.loginUserName, this.clients) != null;
        try {
            if (!usernameTaken) {
                const clientBeingLoggedIn = this.searchUserByWebsocketConnectionAndReturnUser(_websocketConnection, this.clients);
                if (clientBeingLoggedIn != null) {
                    clientBeingLoggedIn.name = _messageData.loginUserName;
                    this.sendTo(_websocketConnection, new Message.LoginResponse(true, clientBeingLoggedIn.id, clientBeingLoggedIn.name));
                }
            }
            else {
                this.sendTo(_websocketConnection, new Message.LoginResponse(false, "", ""));
                usernameTaken = true;
                console.log("UsernameTaken");
            }
        }
        catch (error) {
            console.error("Unhandled Exception: Unable to create or send LoginResponse", error);
        }
    }
    broadcastMessageToAllConnectedClients(_messageToBroadcast) {
        let clientArray = Array.from(this.websocketServer.clients);
        clientArray.forEach(_client => {
            this.sendTo(_client, _messageToBroadcast);
        });
    }
    searchForClientWithId(_idToFind) {
        return this.searchForPropertyValueInCollection(_idToFind, "id", this.clients);
    }
    createID = () => {
        // Math.random should be random enough because of it's seed
        // convert to base 36 and pick the first few digits after comma
        return "_" + Math.random().toString(36).substr(2, 7);
    };
    //#endregion
    parseMessageToJson(_messageToParse) {
        let parsedMessage = new Message.MessageBase(Message.MESSAGE_TYPE.UNDEFINED, "");
        try {
            parsedMessage = JSON.parse(_messageToParse);
        }
        catch (error) {
            console.error("Invalid JSON", error);
        }
        return parsedMessage;
    }
    stringifyObjectToString = (_objectToStringify) => {
        return JSON.stringify(_objectToStringify);
    };
    sendTo = (_connection, _message) => {
        _connection.send(JSON.stringify(_message));
    };
    // Helper function for searching through a collection, finding objects by key and value, returning
    // Object that has that value
    // tslint:disable-next-line: no-any
    searchForPropertyValueInCollection = (propertyValue, key, collectionToSearch) => {
        for (const propertyObject in collectionToSearch) {
            if (this.clients.hasOwnProperty(propertyObject)) {
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
}
exports.FudgeServer = FudgeServer;
