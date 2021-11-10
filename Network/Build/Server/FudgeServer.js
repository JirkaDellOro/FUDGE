"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FudgeServer = void 0;
const ws_1 = __importDefault(require("ws"));
const Messages_js_1 = require("../../Build/Messages.js");
console.log("Messages", Messages_js_1.Messages);
class FudgeServer {
    socket;
    clients = {};
    startUp = (_port = 8080) => {
        console.log(_port);
        this.socket = new ws_1.default.Server({ port: _port });
        this.addEventListeners();
        setInterval(this.heartbeat, 1000);
    };
    closeDown = () => {
        this.socket.close();
    };
    dispatch(_message) {
        _message.timeServer = Date.now();
        let message = JSON.stringify(_message);
        if (_message.idTarget)
            this.clients[_message.idTarget].socket?.send(message);
    }
    broadcast(_message) {
        _message.timeServer = Date.now();
        let message = JSON.stringify(_message);
        for (let id in this.clients)
            // TODO: examine, if idTarget should be tweaked...
            this.clients[id].socket?.send(message);
    }
    addEventListeners = () => {
        this.socket.on("connection", (_socket) => {
            console.log("User connected to FudgeServer");
            try {
                const id = this.createID();
                const client = { socket: _socket, id: id, peers: [] };
                this.clients[id] = client;
                let netMessage = { idTarget: id, command: Messages_js_1.Messages.NET_COMMAND.ASSIGN_ID };
                this.dispatch(netMessage);
            }
            catch (error) {
                console.error("Unhandled Exception", error);
            }
            _socket.on("message", (_message) => {
                this.handleMessage(_message, _socket);
            });
            _socket.addEventListener("close", () => {
                console.error("Error at connection");
                for (let id in this.clients) {
                    if (this.clients[id].socket === _socket) {
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
    async handleMessage(_message, _wsConnection) {
        let message = JSON.parse(_message);
        console.log("Message received", message);
        switch (message.command) {
            case Messages_js_1.Messages.NET_COMMAND.ASSIGN_ID:
                console.log("Id confirmation received for client: " + message.idSource);
                break;
            case Messages_js_1.Messages.NET_COMMAND.LOGIN_REQUEST:
                this.addUserOnValidLoginRequest(_wsConnection, message);
                break;
        }
        //   case Messages.MESSAGE_TYPE.LOGIN_REQUEST:
        //     this.addUserOnValidLoginRequest(_wsConnection, <Messages.LoginRequest>message);
        //     break;
        //   case Messages.MESSAGE_TYPE.CLIENT_TO_SERVER:
        //     this.receive(<Messages.ToServer>message);
        //     break;
        //   case Messages.MESSAGE_TYPE.RTC_OFFER:
        //     this.sendRtcOfferToRequestedClient(_wsConnection, <Messages.RtcOffer>message);
        //     break;
        //   case Messages.MESSAGE_TYPE.RTC_ANSWER:
        //     this.answerRtcOfferOfClient(_wsConnection, <Messages.RtcAnswer>message);
        //     break;
        //   case Messages.MESSAGE_TYPE.ICE_CANDIDATE:
        //     this.sendIceCandidatesToRelevantPeer(_wsConnection, <Messages.IceCandidate>message);
        //     break;
        //   default:
        //     console.log("WebSocket: Message type not recognized");
        //     break;
        // }
    }
    async receive(_message) {
        switch (_message.messageData) {
            case Messages_js_1.Messages.SERVER_COMMAND.CREATE_MESH: {
                let ids = Reflect.ownKeys(this.clients);
                while (ids.length > 1) {
                    let id = ids.pop();
                    let message = new Messages_js_1.Messages.ToClient(JSON.stringify({ [Messages_js_1.Messages.SERVER_COMMAND.CONNECT_PEERS]: ids }));
                    await new Promise((resolve) => { setTimeout(resolve, 200); });
                    this.clients[id].socket?.send(message.serialize());
                }
                break;
            }
            case Messages_js_1.Messages.SERVER_COMMAND.CONNECT_HOST: {
                let message = new Messages_js_1.Messages.ToClient(JSON.stringify({ [Messages_js_1.Messages.SERVER_COMMAND.CONNECT_PEERS]: Reflect.ownKeys(this.clients) }));
                this.clients[_message.idSource].socket?.send(message.serialize());
                break;
            }
            default:
                this.broadcastMessageToAllConnectedClients(_message);
        }
    }
    addUserOnValidLoginRequest(_wsConnection, _message) {
        let name = _message.content?.name;
        for (let id in this.clients) {
            if (this.clients[id].name == name) {
                console.log("UsernameTaken", name);
                let netMessage = { idTarget: id, command: Messages_js_1.Messages.NET_COMMAND.LOGIN_RESPONSE, content: { success: false } };
                this.dispatch(netMessage);
                return;
            }
        }
        try {
            for (let id in this.clients) {
                let client = this.clients[id];
                if (client.socket == _wsConnection) {
                    client.name = name;
                    // _wsConnection.send(new Messages.LoginResponse(true, client.id, client.name).serialize());
                    let netMessage = { idTarget: id, command: Messages_js_1.Messages.NET_COMMAND.ASSIGN_ID, content: { success: true } };
                    this.dispatch(netMessage);
                    return;
                }
            }
        }
        catch (error) {
            console.error("Unhandled Exception: Unable to create or send LoginResponse", error);
        }
    }
    broadcastMessageToAllConnectedClients(_message) {
        if (_message.messageType != Messages_js_1.Messages.MESSAGE_TYPE.SERVER_HEARTBEAT)
            console.info("Broadcast", _message);
        // TODO: appearently, websocketServer keeps its own list of clients. Examine if it makes sense to double this information in this.clients
        let clientArray = Array.from(this.socket.clients);
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
            let netMessage = { idSource: _message.idSource, idTarget: _message.idRemote, command: Messages_js_1.Messages.NET_COMMAND.RTC_OFFER, content: { offer: _message.offer } };
            try {
                client.socket?.send(offerMessage.serialize());
                this.dispatch(netMessage);
            }
            catch (error) {
                console.error("Unhandled Exception: Unable to relay Offer to Client", error);
            }
        }
        else {
            console.error("Server is not connected to client with this id", _message.idRemote);
        }
    }
    answerRtcOfferOfClient(_wsConnection, _message) {
        console.log("Sending answer to: ", _message.idTarget);
        const client = this.clients[_message.idTarget];
        if (client) {
            // TODO Probable source of error, need to test
            if (client.socket != null)
                client.socket.send(_message.serialize());
            // TODO: with new messages, simply pass through
            let netMessage = { idTarget: _message.idTarget, command: Messages_js_1.Messages.NET_COMMAND.RTC_ANSWER, content: { answer: _message.answer } };
            this.dispatch(netMessage);
        }
    }
    sendIceCandidatesToRelevantPeer(_wsConnection, _message) {
        const client = this.clients[_message.idTarget];
        console.warn("Send Candidate", client, _message.candidate);
        if (client) {
            const candidateToSend = new Messages_js_1.Messages.IceCandidate(_message.idSource, client.id, _message.candidate);
            client.socket?.send(candidateToSend.serialize());
            let netMessage = { idTarget: _message.idTarget, command: Messages_js_1.Messages.NET_COMMAND.ICE_CANDIDATE, content: { candidate: _message.candidate } };
            this.dispatch(netMessage);
        }
    }
    createID = () => {
        // Math.random should be random enough because of its seed
        // convert to base 36 and pick the first few digits after comma
        return "_" + Math.random().toString(36).substr(2, 7);
    };
    heartbeat = () => {
        process.stdout.write("♥");
        let clients = {};
        for (let id in this.clients)
            clients[id] = { name: this.clients[id].name, peers: this.clients[id].peers };
        // let message: Messages.ServerHeartbeat = new Messages.ServerHeartbeat(JSON.stringify(clients));
        // this.broadcastMessageToAllConnectedClients(message);
        let message = { command: Messages_js_1.Messages.NET_COMMAND.SERVER_HEARTBEAT, content: clients };
        this.broadcast(message);
    };
}
exports.FudgeServer = FudgeServer;
