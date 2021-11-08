"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FudgeServer = void 0;
const ws_1 = __importDefault(require("ws"));
const Messages_js_1 = require("../../Build/Messages.js");
console.log("Messages", Messages_js_1.Messages);
var CONNECTION;
(function (CONNECTION) {
    CONNECTION[CONNECTION["TCP"] = 0] = "TCP";
    CONNECTION[CONNECTION["RTC"] = 1] = "RTC";
})(CONNECTION || (CONNECTION = {}));
class FudgeServer {
    wsServer;
    clients = {};
    startUp = (_port = 8080) => {
        console.log(_port);
        this.wsServer = new ws_1.default.Server({ port: _port });
        this.addEventListeners();
        setInterval(this.heartbeat, 1000);
    };
    closeDown = () => {
        this.wsServer.close();
    };
    addEventListeners = () => {
        this.wsServer.on("connection", (_wsConnection) => {
            console.log("User connected to FudgeServer");
            try {
                const id = this.createID();
                _wsConnection.send(new Messages_js_1.Messages.IdAssigned(id).serialize());
                const client = { wsServer: _wsConnection, id: id, peers: {} };
                this.clients[id] = client;
            }
            catch (error) {
                console.error("Unhandled Exception SERVER: Sending ID to ClientDataType", error);
            }
            _wsConnection.on("message", (_message) => {
                this.handleMessage(_message, _wsConnection);
            });
            _wsConnection.addEventListener("close", () => {
                console.error("Error at connection");
                for (let id in this.clients) {
                    if (this.clients[id].wsServer === _wsConnection) {
                        console.log("Client connection found, deleting");
                        delete this.clients[id];
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
    async handleMessage(_message, _wsConnection) {
        let message = Messages_js_1.Messages.MessageBase.deserialize(_message);
        if (!message || !message.messageType) {
            console.error("Unhandled Exception: Invalid Message Object received. Does it implement MessageBase?");
            return;
        }
        console.log("Message received", message);
        switch (message.messageType) {
            case Messages_js_1.Messages.MESSAGE_TYPE.ID_ASSIGNED:
                console.log("Id confirmation received for client: " + message.idSource);
                break;
            case Messages_js_1.Messages.MESSAGE_TYPE.LOGIN_REQUEST:
                this.addUserOnValidLoginRequest(_wsConnection, message);
                break;
            case Messages_js_1.Messages.MESSAGE_TYPE.CLIENT_TO_SERVER:
                this.receive(message);
                break;
            case Messages_js_1.Messages.MESSAGE_TYPE.RTC_OFFER:
                this.sendRtcOfferToRequestedClient(_wsConnection, message);
                break;
            case Messages_js_1.Messages.MESSAGE_TYPE.RTC_ANSWER:
                this.answerRtcOfferOfClient(_wsConnection, message);
                break;
            case Messages_js_1.Messages.MESSAGE_TYPE.ICE_CANDIDATE:
                this.sendIceCandidatesToRelevantPeer(_wsConnection, message);
                break;
            default:
                console.log("WebSocket: Message type not recognized");
                break;
        }
    }
    async receive(_message) {
        switch (_message.messageData) {
            case Messages_js_1.Messages.SERVER_COMMAND.CREATE_MESH: {
                let ids = Reflect.ownKeys(this.clients);
                while (ids.length > 1) {
                    let id = ids.pop();
                    let message = new Messages_js_1.Messages.ToClient(JSON.stringify({ [Messages_js_1.Messages.SERVER_COMMAND.CONNECT_PEERS]: ids }));
                    await new Promise((resolve) => { setTimeout(resolve, 200); });
                    this.clients[id].wsServer?.send(message.serialize());
                }
                break;
            }
            case Messages_js_1.Messages.SERVER_COMMAND.CONNECT_HOST: {
                let message = new Messages_js_1.Messages.ToClient(JSON.stringify({ [Messages_js_1.Messages.SERVER_COMMAND.CONNECT_PEERS]: Reflect.ownKeys(this.clients) }));
                this.clients[_message.idSource].wsServer?.send(message.serialize());
                break;
            }
            default:
                this.broadcastMessageToAllConnectedClients(_message);
        }
    }
    addUserOnValidLoginRequest(_wsConnection, _message) {
        for (let id in this.clients) {
            if (this.clients[id].name == _message.loginUserName) {
                _wsConnection.send(new Messages_js_1.Messages.LoginResponse(false, "", "").serialize());
                console.log("UsernameTaken", _message.loginUserName);
                return;
            }
        }
        try {
            for (let id in this.clients) {
                let client = this.clients[id];
                if (client.wsServer == _wsConnection) {
                    client.name = _message.loginUserName;
                    _wsConnection.send(new Messages_js_1.Messages.LoginResponse(true, client.id, client.name).serialize());
                    return;
                }
            }
        }
        catch (error) {
            console.error("Unhandled Exception: Unable to create or send LoginResponse", error);
        }
    }
    broadcastMessageToAllConnectedClients(_message) {
        console.info("Broadcast", _message);
        // TODO: appearently, websocketServer keeps its own list of clients. Examine if it makes sense to double this information in this.clients
        let clientArray = Array.from(this.wsServer.clients);
        let message = _message.serialize();
        clientArray.forEach(_client => {
            _client.send(message);
        });
    }
    sendRtcOfferToRequestedClient(_wsConnection, _message) {
        console.log("Sending offer to: ", _message.idRemote);
        const client = this.clients[_message.idRemote];
        if (client) {
            const offerMessage = new Messages_js_1.Messages.RtcOffer(_message.idSource, client.id, _message.offer);
            try {
                client.wsServer?.send(offerMessage.serialize());
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
        console.log("Sending answer to: ", _message.idTarget);
        const client = this.clients[_message.idTarget];
        if (client) {
            // TODO Probable source of error, need to test
            if (client.wsServer != null)
                client.wsServer.send(_message.serialize());
        }
    }
    sendIceCandidatesToRelevantPeer(_wsConnection, _message) {
        const client = this.clients[_message.idTarget];
        console.warn("Send Candidate", client, _message.candidate);
        if (client) {
            const candidateToSend = new Messages_js_1.Messages.IceCandidate(_message.idSource, client.id, _message.candidate);
            client.wsServer?.send(candidateToSend.serialize());
        }
    }
    createID = () => {
        // Math.random should be random enough because of its seed
        // convert to base 36 and pick the first few digits after comma
        return "_" + Math.random().toString(36).substr(2, 7);
    };
    heartbeat = () => {
        console.log("Server Heartbeat");
        let clients = {};
        for (let id in this.clients)
            clients[id] = { name: this.clients[id].name, peers: this.clients[id].peers };
        let message = new Messages_js_1.Messages.ServerHeartbeat(JSON.stringify(clients));
        this.broadcastMessageToAllConnectedClients(message);
    };
}
exports.FudgeServer = FudgeServer;
