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
    wsServer;
    clients = [];
    startUp = (_port = 8080) => {
        console.log(_port);
        this.wsServer = new ws_1.default.Server({ port: _port });
        this.addEventListeners();
    };
    closeDown = () => {
        this.wsServer.close();
    };
    addEventListeners = () => {
        this.wsServer.on("connection", (_wsConnection) => {
            console.log("User connected to FudgeServer");
            try {
                const id = this.createID();
                _wsConnection.send(new Message.IdAssigned(id).serialize());
                const client = { connection: _wsConnection, id: id, peers: {} };
                this.clients.push(client);
            }
            catch (error) {
                console.error("Unhandled Exception SERVER: Sending ID to ClientDataType", error);
            }
            _wsConnection.on("message", (_message) => {
                this.handleMessage(_message, _wsConnection);
            });
            _wsConnection.addEventListener("close", () => {
                console.error("Error at connection");
                for (let i = 0; i < this.clients.length; i++) {
                    if (this.clients[i].connection === _wsConnection) {
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
    // TODO Check if event.type can be used for identification instead => It cannot
    handleMessage(_message, _wsConnection) {
        let message = Message.MessageBase.deserialize(_message);
        if (!message || !message.messageType) {
            console.error("Unhandled Exception: Invalid Message Object received. Does it implement MessageBase?");
            return;
        }
        console.log("Message received", message);
        switch (message.messageType) {
            case Message.MESSAGE_TYPE.ID_ASSIGNED:
                console.log("Id confirmation received for client: " + message.originatorId);
                break;
            case Message.MESSAGE_TYPE.LOGIN_REQUEST:
                this.addUserOnValidLoginRequest(_wsConnection, message);
                break;
            case Message.MESSAGE_TYPE.CLIENT_TO_SERVER_MESSAGE:
                this.broadcastMessageToAllConnectedClients(message);
                break;
            case Message.MESSAGE_TYPE.RTC_OFFER:
                this.sendRtcOfferToRequestedClient(_wsConnection, message);
                break;
            case Message.MESSAGE_TYPE.RTC_ANSWER:
                this.answerRtcOfferOfClient(_wsConnection, message);
                break;
            case Message.MESSAGE_TYPE.ICE_CANDIDATE:
                this.sendIceCandidatesToRelevantPeer(_wsConnection, message);
                break;
            default:
                console.log("WebSocket: Message type not recognized");
                break;
        }
    }
    addUserOnValidLoginRequest(_wsConnection, _message) {
        let usernameTaken = this.clients.find(_client => _client.name == _message.loginUserName);
        try {
            if (!usernameTaken) {
                const clientBeingLoggedIn = this.clients.find(_client => _client.connection == _wsConnection);
                if (clientBeingLoggedIn) {
                    clientBeingLoggedIn.name = _message.loginUserName;
                    _wsConnection.send(new Message.LoginResponse(true, clientBeingLoggedIn.id, clientBeingLoggedIn.name).serialize());
                }
            }
            else {
                _wsConnection.send(new Message.LoginResponse(false, "", "").serialize());
                console.log("UsernameTaken");
            }
        }
        catch (error) {
            console.error("Unhandled Exception: Unable to create or send LoginResponse", error);
        }
    }
    broadcastMessageToAllConnectedClients(_message) {
        console.log("Broadcast", _message);
        // TODO: appearently, websocketServer keeps its own list of clients. Examine if it makes sense to double this information in this.clients
        let clientArray = Array.from(this.wsServer.clients);
        clientArray.forEach(_client => {
            _client.send(_message.serialize());
        });
    }
    sendRtcOfferToRequestedClient(_wsConnection, _message) {
        console.log("Sending offer to: ", _message.userNameToConnectTo);
        const client = this.clients.find(_client => _client.name == _message.userNameToConnectTo);
        if (client) {
            const offerMessage = new Message.RtcOffer(_message.originatorId, client.name, _message.offer);
            try {
                client.connection.send(offerMessage.serialize());
            }
            catch (error) {
                console.error("Unhandled Exception: Unable to relay Offer to Client", error);
            }
        }
        else {
            console.error("User to connect to doesn't exist under that Name");
        }
    }
    answerRtcOfferOfClient(_wsConnection, _message) {
        console.log("Sending answer to: ", _message.targetId);
        const client = this.clients.find(_client => _client.id == _message.targetId);
        if (client) {
            // TODO Probable source of error, need to test
            if (client.connection != null)
                client.connection.send(_message.serialize());
        }
    }
    sendIceCandidatesToRelevantPeer(_wsConnection, _message) {
        const client = this.clients.find(_client => _client.id == _message.targetId);
        if (client) {
            const candidateToSend = new Message.IceCandidate(_message.originatorId, client.id, _message.candidate);
            client.connection.send(candidateToSend.serialize());
        }
    }
    createID = () => {
        // Math.random should be random enough because of its seed
        // convert to base 36 and pick the first few digits after comma
        return "_" + Math.random().toString(36).substr(2, 7);
    };
}
exports.FudgeServer = FudgeServer;
