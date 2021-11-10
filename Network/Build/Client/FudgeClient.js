"use strict";
var Messages;
(function (Messages) {
    let MESSAGE_TYPE;
    (function (MESSAGE_TYPE) {
        MESSAGE_TYPE["UNDEFINED"] = "undefined";
        MESSAGE_TYPE["ERROR"] = "error";
        MESSAGE_TYPE["ID_ASSIGNED"] = "idAssigned";
        MESSAGE_TYPE["LOGIN_REQUEST"] = "loginRequest";
        MESSAGE_TYPE["LOGIN_RESPONSE"] = "loginResponse";
        MESSAGE_TYPE["CLIENT_TO_SERVER"] = "clientToServer";
        MESSAGE_TYPE["SERVER_TO_CLIENT"] = "serverToClient";
        MESSAGE_TYPE["PEER_TO_PEER"] = "peerToPeer";
        MESSAGE_TYPE["SERVER_HEARTBEAT"] = "serverHeartbeat";
        MESSAGE_TYPE["CLIENT_HEARTBEAT"] = "clientHeartbeat";
        MESSAGE_TYPE["RTC_OFFER"] = "rtcOffer";
        MESSAGE_TYPE["RTC_ANSWER"] = "rtcAnswer";
        MESSAGE_TYPE["ICE_CANDIDATE"] = "rtcCandidate";
    })(MESSAGE_TYPE = Messages.MESSAGE_TYPE || (Messages.MESSAGE_TYPE = {}));
    let SERVER_COMMAND;
    (function (SERVER_COMMAND) {
        SERVER_COMMAND["UNDEFINED"] = "undefined";
        SERVER_COMMAND["DISCONNECT_CLIENT"] = "disconnect_client";
        SERVER_COMMAND["CREATE_MESH"] = "createMesh";
        SERVER_COMMAND["CONNECT_HOST"] = "connectHost";
        SERVER_COMMAND["CONNECT_PEERS"] = "connectPeers";
    })(SERVER_COMMAND = Messages.SERVER_COMMAND || (Messages.SERVER_COMMAND = {}));
    let NET_COMMAND;
    (function (NET_COMMAND) {
        NET_COMMAND["UNDEFINED"] = "undefined";
        NET_COMMAND["ERROR"] = "error";
        /** sent from server to assign an id for the connection and reconfirmed by the client. idTarget is used to carry the id  */
        NET_COMMAND["ASSIGN_ID"] = "assignId";
        /** sent from server to assign an id for the connection and reconfirmed by the client. idTarget is used to carry the id  */
        NET_COMMAND["LOGIN_REQUEST"] = "loginRequest";
        NET_COMMAND["LOGIN_RESPONSE"] = "loginResponse";
        NET_COMMAND["SERVER_HEARTBEAT"] = "serverHeartbeat";
        NET_COMMAND["CLIENT_HEARTBEAT"] = "clientHeartbeat";
        NET_COMMAND["RTC_OFFER"] = "rtcOffer";
        NET_COMMAND["RTC_ANSWER"] = "rtcAnswer";
        NET_COMMAND["ICE_CANDIDATE"] = "rtcCandidate";
    })(NET_COMMAND = Messages.NET_COMMAND || (Messages.NET_COMMAND = {}));
    /**
     * Defines the route the message should take.
     * - route undefined -> send message to peer idTarget using RTC
     * - route undefined & idTarget undefined -> send message to all peers using RTC
     * - route HOST -> send message to peer acting as host using RTC, ignoring idTarget
     * - route SERVER -> send message to server using websocket
     * - route VIA_SERVER -> send message to client idTarget via server using websocket
     * - route VIA_SERVER_HOST -> send message to client acting as host via server using websocket, ignoring idTarget
     */
    let NET_ROUTE;
    (function (NET_ROUTE) {
        NET_ROUTE["HOST"] = "toHost";
        NET_ROUTE["SERVER"] = "toServer";
        NET_ROUTE["VIA_SERVER"] = "viaServer";
        NET_ROUTE["VIA_SERVER_HOST"] = "viaServerToHost";
    })(NET_ROUTE = Messages.NET_ROUTE || (Messages.NET_ROUTE = {}));
    class MessageBase {
        messageType;
        idSource;
        constructor(messageType, idSource) {
            this.messageType = messageType;
            this.idSource = idSource;
        }
        static deserialize(_message) {
            let parsed = JSON.parse(_message);
            let message = new MessageBase(parsed.messageType, parsed.idSource);
            Object.assign(message, parsed);
            return message;
        }
        serialize() {
            return JSON.stringify(this);
        }
    }
    Messages.MessageBase = MessageBase;
    class IdAssigned extends MessageBase {
        assignedId;
        constructor(assignedId) {
            super(MESSAGE_TYPE.ID_ASSIGNED, "Server");
            this.assignedId = assignedId;
        }
    }
    Messages.IdAssigned = IdAssigned;
    class LoginRequest extends MessageBase {
        loginUserName;
        constructor(_idSource, loginUserName = "") {
            super(MESSAGE_TYPE.LOGIN_REQUEST, _idSource);
            this.loginUserName = loginUserName;
        }
    }
    Messages.LoginRequest = LoginRequest;
    class LoginResponse extends MessageBase {
        loginSuccess;
        originatorUsername;
        constructor(loginSuccess, _assignedId, originatorUsername) {
            super(MESSAGE_TYPE.LOGIN_RESPONSE, _assignedId);
            this.loginSuccess = loginSuccess;
            this.originatorUsername = originatorUsername;
        }
    }
    Messages.LoginResponse = LoginResponse;
    class RtcOffer extends MessageBase {
        idRemote;
        offer;
        constructor(_idSource, idRemote, offer) {
            super(MESSAGE_TYPE.RTC_OFFER, _idSource);
            this.idRemote = idRemote;
            this.offer = offer;
        }
    }
    Messages.RtcOffer = RtcOffer;
    class RtcAnswer extends MessageBase {
        idTarget;
        answer;
        constructor(_idSource, idTarget, answer) {
            super(MESSAGE_TYPE.RTC_ANSWER, _idSource);
            this.idTarget = idTarget;
            this.answer = answer;
        }
    }
    Messages.RtcAnswer = RtcAnswer;
    class IceCandidate extends MessageBase {
        idTarget;
        candidate;
        constructor(_idSource, idTarget, candidate) {
            super(MESSAGE_TYPE.ICE_CANDIDATE, _idSource);
            this.idTarget = idTarget;
            this.candidate = candidate;
        }
    }
    Messages.IceCandidate = IceCandidate;
    class ToServer extends MessageBase {
        messageData;
        originatorUserName;
        constructor(_idSource, messageData, originatorUserName) {
            super(MESSAGE_TYPE.CLIENT_TO_SERVER, _idSource);
            this.messageData = messageData;
            this.originatorUserName = originatorUserName;
        }
    }
    Messages.ToServer = ToServer;
    class ToClient extends MessageBase {
        messageData;
        constructor(messageData) {
            super(MESSAGE_TYPE.SERVER_TO_CLIENT, "SERVER");
            this.messageData = messageData;
        }
    }
    Messages.ToClient = ToClient;
    class PeerToPeer extends MessageBase {
        messageData;
        constructor(_idSource, messageData) {
            super(MESSAGE_TYPE.PEER_TO_PEER, _idSource);
            this.messageData = messageData;
        }
    }
    Messages.PeerToPeer = PeerToPeer;
    class ServerHeartbeat extends MessageBase {
        messageData;
        constructor(messageData) {
            super(MESSAGE_TYPE.SERVER_HEARTBEAT, "SERVER");
            this.messageData = messageData;
        }
    }
    Messages.ServerHeartbeat = ServerHeartbeat;
    class ClientHeartbeat extends MessageBase {
        messageData;
        constructor(_idSource, messageData) {
            super(MESSAGE_TYPE.CLIENT_HEARTBEAT, _idSource);
            this.messageData = messageData;
        }
    }
    Messages.ClientHeartbeat = ClientHeartbeat;
})(Messages || (Messages = {}));
///<reference path="../Messages.ts"/>
///<reference path="../../../Core/Build/FudgeCore.d.ts"/>
var FudgeClient;
///<reference path="../Messages.ts"/>
///<reference path="../../../Core/Build/FudgeCore.d.ts"/>
(function (FudgeClient_1) {
    var ƒ = FudgeCore;
    class FudgeClient extends EventTarget {
        id;
        name;
        urlServer = undefined;
        socket;
        peers = {};
        constructor() {
            super();
            this.name = "";
            this.id = "undefined";
        }
        connectToServer = (_uri = "ws://localhost:8080") => {
            this.urlServer = _uri;
            this.socket = new WebSocket(_uri);
            this.addWebSocketEventListeners();
        };
        loginToServer = (_name) => {
            try {
                // const loginMessage: Messages.LoginRequest = new Messages.LoginRequest(this.id, _name);
                // this.sendToServer(loginMessage);
                let message = {
                    command: Messages.NET_COMMAND.LOGIN_REQUEST, route: Messages.NET_ROUTE.SERVER, content: { name: _name }
                };
                this.dispatch(message);
            }
            catch (error) {
                ƒ.Debug.fudge("Unexpected error: Sending Login Request", error);
            }
        };
        dispatch(_message) {
            _message.timeSender = Date.now();
            let message = JSON.stringify(_message);
            try {
                if (!_message.route || _message.route == Messages.NET_ROUTE.HOST) {
                    // send via RTC to specific peer (if idTarget set), all peers (if not set) or host (if route set to host)
                }
                else {
                    _message.idSource = this.id;
                    this.socket.send(message);
                }
            }
            catch (_error) {
                console.log(_error);
            }
        }
        // public broadcast(_message: Messages.NetMessage): void {
        //   _message.timeServer = Date.now();
        //   let message: string = JSON.stringify(_message);
        //   for (let id in this.clients)
        //     // TODO: examine, if idTarget should be tweaked...
        //     this.clients[id].socket?.send(message);
        // }
        sendToServer = (_message) => {
            let stringifiedMessage = _message.serialize();
            if (this.socket.readyState == 1) {
                this.socket.send(stringifiedMessage);
            }
            else {
                ƒ.Debug.fudge("Websocket Connection closed unexpectedly");
            }
        };
        connectToPeer = (_idRemote) => {
            if (this.peers[_idRemote])
                ƒ.Debug.warn("Peers already connected, ignoring request", this.id, _idRemote);
            else
                // this.idRemote = _idRemote;
                this.beginPeerConnectionNegotiation(_idRemote);
        };
        sendToPeer = (_idRemote, _message) => {
            let message = new Messages.PeerToPeer(this.id, JSON.stringify(_message));
            let dataChannel = this.peers[_idRemote].dataChannel;
            if (dataChannel && dataChannel.readyState == "open")
                dataChannel.send(message.serialize());
            else {
                console.error("Datachannel: Connection unexpectedly lost");
            }
        };
        sendToAllPeers = (_message) => {
            for (let idPeer in this.peers) {
                this.sendToPeer(idPeer, _message);
            }
        };
        // ----------------------
        addWebSocketEventListeners = () => {
            try {
                this.socket.addEventListener(FudgeClient_1.EVENT.CONNECTION_OPENED, (_connOpen) => {
                    ƒ.Debug.fudge("Connected to the signaling server", _connOpen);
                });
                // this.wsServer.addEventListener(EVENT.ERROR, (_err: Event) => {
                // });
                this.socket.addEventListener(FudgeClient_1.EVENT.MESSAGE_RECEIVED, (_receivedMessage) => {
                    // this.parseMessageAndHandleMessageType(_receivedMessage);
                    this.hndMessage(_receivedMessage);
                });
            }
            catch (error) {
                ƒ.Debug.fudge("Unexpected Error: Adding websocket Eventlistener", error);
            }
        };
        hndMessage = (_event) => {
            let message = JSON.parse(_event.data);
            //tslint:disable-next-line: no-any
            // let content: any = message.content ? JSON.parse(message.content) : null;
            switch (message.command) {
                case Messages.NET_COMMAND.ASSIGN_ID:
                    ƒ.Debug.fudge("ID received", (message.idTarget));
                    this.assignIdAndSendConfirmation(message.idTarget);
                    break;
                case Messages.NET_COMMAND.LOGIN_RESPONSE:
                    this.loginValidAddUser(message.idSource, message.content?.success, message.content?.name);
                    break;
            }
            console.log(_event.timeStamp, message);
            this.dispatchEvent(new MessageEvent(_event.type, _event));
        };
        parseMessageAndHandleMessageType = (_receivedMessage) => {
            let message = Messages.MessageBase.deserialize(_receivedMessage.data);
            // console.log(_receivedMessage);
            switch (message.messageType) {
                // case Messages.MESSAGE_TYPE.ID_ASSIGNED:
                //   ƒ.Debug.fudge("ID received", (<Messages.IdAssigned>message).assignedId);
                //   // this.assignIdAndSendConfirmation(<Messages.IdAssigned>message);
                //   break;
                // case Messages.MESSAGE_TYPE.LOGIN_RESPONSE:
                //   this.loginValidAddUser(message.idSource, (<Messages.LoginResponse>message).loginSuccess, (<Messages.LoginResponse>message).originatorUsername);
                //   break;
                // case Messages.MESSAGE_TYPE.SERVER_HEARTBEAT:
                //   this.dispatchEvent(new CustomEvent(EVENT.MESSAGE_RECEIVED, { detail: message }));
                //   break;
                case Messages.MESSAGE_TYPE.CLIENT_TO_SERVER:
                case Messages.MESSAGE_TYPE.SERVER_TO_CLIENT:
                    this.dispatchEvent(new CustomEvent(FudgeClient_1.EVENT.MESSAGE_RECEIVED, { detail: message }));
                    break;
                case Messages.MESSAGE_TYPE.RTC_OFFER:
                    // ƒ.Debug.fudge("Received offer, current signaling state: ", this.connection.signalingState);
                    this.receiveNegotiationOfferAndSetRemoteDescription(message);
                    break;
                case Messages.MESSAGE_TYPE.RTC_ANSWER:
                    // ƒ.Debug.fudge("Received answer, current signaling state: ", this.connection.signalingState);
                    this.receiveAnswerAndSetRemoteDescription(message);
                    break;
                case Messages.MESSAGE_TYPE.ICE_CANDIDATE:
                    // ƒ.Debug.fudge("Received candidate, current signaling state: ", this.connection.signalingState);
                    this.addReceivedCandidateToPeerConnection(message);
                    break;
                default:
                    console.log("Dispatching message of unknown type", _receivedMessage);
                    // this.dispatchEvent(new CustomEvent(EVENT.MESSAGE_RECEIVED, {detail: _receivedMessage}));
                    this.dispatchEvent(new MessageEvent(_receivedMessage.type, _receivedMessage));
                    break;
            }
        };
        beginPeerConnectionNegotiation = (_idRemote) => {
            try {
                this.peers[_idRemote] = new FudgeClient_1.RtcConnection();
                this.peers[_idRemote].createDataChannel(this, _idRemote);
            }
            catch (error) {
                console.error("Unexpected Error: Creating Client Datachannel and adding Listeners", error);
            }
            let peerConnection = this.peers[_idRemote].peerConnection;
            peerConnection.addEventListener("icecandidate", (_event) => this.sendIceCandidatesToPeer(_event.candidate, _idRemote));
            peerConnection.createOffer()
                .then(async (offer) => {
                ƒ.Debug.fudge("Local: createOffer, expected 'stable', got:  ", peerConnection.signalingState);
                return offer;
            })
                .then(async (offer) => {
                await peerConnection.setLocalDescription(offer);
                ƒ.Debug.fudge("Local: setDescription, expected 'have-local-offer', got:  ", peerConnection.signalingState);
            })
                .then(() => {
                this.createNegotiationOfferAndSendToPeer(_idRemote);
            })
                .catch((error) => {
                console.error("Unexpected Error: Creating RTCOffer", error);
            });
        };
        createNegotiationOfferAndSendToPeer = (_idRemote) => {
            try {
                let peerConnection = this.peers[_idRemote].peerConnection;
                const offerMessage = new Messages.RtcOffer(this.id, _idRemote, peerConnection.localDescription);
                this.sendToServer(offerMessage);
                ƒ.Debug.fudge("Local: send offer, expected 'have-local-offer', got:  ", peerConnection.signalingState);
            }
            catch (error) {
                console.error("Unexpected Error: Creating Object and Sending RTC Offer", error);
            }
        };
        receiveNegotiationOfferAndSetRemoteDescription = (_offerMessage) => {
            ƒ.Debug.fudge("Remote: offer received, create connection", _offerMessage);
            let peer = this.peers[_offerMessage.idSource] || (this.peers[_offerMessage.idSource] = new FudgeClient_1.RtcConnection());
            let peerConnection = peer.peerConnection;
            peerConnection.addEventListener("datachannel", (_event) => this.receiveDataChannelAndEstablishConnection(_event, peer));
            let offerToSet = _offerMessage.offer;
            if (!offerToSet) {
                return;
            }
            peerConnection.setRemoteDescription(new RTCSessionDescription(offerToSet))
                .then(async () => {
                ƒ.Debug.fudge("Remote: set remote descripton, expected 'have-remote-offer', got:  ", peerConnection.signalingState);
                this.answerNegotiationOffer(_offerMessage.idSource);
            })
                .catch((error) => {
                console.error("Unexpected Error: Setting Remote Description and Creating Answer", error);
            });
            ƒ.Debug.fudge("Remote: remote description set, expected 'stable', got:  ", peerConnection.signalingState);
        };
        answerNegotiationOffer = (_idRemote) => {
            let ultimateAnswer;
            let peerConnection = this.peers[_idRemote]?.peerConnection;
            // Signaling example from here https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/createAnswer
            peerConnection.createAnswer()
                .then(async (answer) => {
                ƒ.Debug.fudge("Remote: create answer, expected 'have-remote-offer', got:  ", peerConnection.signalingState);
                ultimateAnswer = new RTCSessionDescription(answer);
                return await peerConnection.setLocalDescription(ultimateAnswer);
            }).then(async () => {
                ƒ.Debug.fudge("Remote: create answer function, expected 'stable', got:  ", peerConnection.signalingState);
                const answerMessage = new Messages.RtcAnswer(this.id, _idRemote, ultimateAnswer);
                ƒ.Debug.fudge("Remote: send answer to server ", answerMessage);
                this.sendToServer(answerMessage);
            })
                .catch((error) => {
                console.error("Unexpected error: Creating RTC Answer failed", error);
            });
        };
        receiveAnswerAndSetRemoteDescription = (_message) => {
            try {
                ƒ.Debug.fudge("Local: received answer, create data channel ", _message);
                let descriptionAnswer = new RTCSessionDescription(_message.answer);
                this.peers[_message.idSource].peerConnection.setRemoteDescription(descriptionAnswer);
                this.peers[_message.idSource].createDataChannel(this, _message.idSource);
            }
            catch (error) {
                console.error("Unexpected Error: Setting Remote Description from Answer", error);
            }
        };
        sendIceCandidatesToPeer = (_candidate, _idRemote) => {
            if (!_candidate)
                return;
            try {
                ƒ.Debug.fudge("Local: send ICECandidates to server");
                let message = new Messages.IceCandidate(this.id, _idRemote, _candidate);
                this.sendToServer(message);
            }
            catch (error) {
                console.error("Unexpected Error: Creating and Sending ICECandidates to Peer", error);
            }
        };
        addReceivedCandidateToPeerConnection = async (_message) => {
            ƒ.Debug.fudge("Remote: try to add candidate to peer connection");
            if (_message.candidate) {
                try {
                    await this.peers[_message.idSource].peerConnection.addIceCandidate(_message.candidate);
                }
                catch (error) {
                    console.error("Unexpected Error: Adding Ice Candidate", error);
                }
            }
        };
        receiveDataChannelAndEstablishConnection = (_event, _peer) => {
            ƒ.Debug.fudge("Remote: establish channel on connection", _event.channel);
            if (_event.channel) {
                _peer.addDataChannel(this, _event.channel);
            }
            else {
                console.error("Unexpected Error: RemoteDatachannel");
            }
        };
        loginValidAddUser = (_assignedId, _success, _name) => {
            if (_success) {
                this.name = _name;
                ƒ.Debug.fudge("Logged in to server as: " + this.name, this.id);
            }
            else {
                ƒ.Debug.fudge("Login failed, username taken", this.name, this.id);
            }
        };
        assignIdAndSendConfirmation = (_id) => {
            try {
                if (!_id)
                    throw (new Error("id undefined"));
                this.id = _id;
                // this.sendToServer(new Messages.IdAssigned(_id));
                let message = { command: Messages.NET_COMMAND.ASSIGN_ID, route: Messages.NET_ROUTE.SERVER };
                this.dispatch(message);
            }
            catch (error) {
                ƒ.Debug.fudge("Unexpected Error: Sending ID Confirmation", error);
            }
        };
    }
    FudgeClient_1.FudgeClient = FudgeClient;
})(FudgeClient || (FudgeClient = {}));
var FudgeClient;
(function (FudgeClient) {
    var ƒ = FudgeCore;
    let EVENT;
    (function (EVENT) {
        EVENT["CONNECTION_OPENED"] = "open";
        EVENT["CONNECTION_CLOSED"] = "close";
        EVENT["ERROR"] = "error";
        EVENT["MESSAGE_RECEIVED"] = "message";
    })(EVENT = FudgeClient.EVENT || (FudgeClient.EVENT = {}));
    // More info from here https://developer.mozilla.org/en-US/docs/Web/API/RTCConfiguration
    // tslint:disable-next-line: typedef
    FudgeClient.configuration = {
        iceServers: [
            { urls: "stun:stun2.1.google.com:19302" },
            { urls: "stun:stun.example.com" }
        ]
    };
    class RtcConnection {
        // TODO: figure out if it makes sense to create all these connections... RTCPeerConnection is undefined.
        peerConnection;
        dataChannel;
        mediaStream;
        constructor() {
            this.peerConnection = new RTCPeerConnection(FudgeClient.configuration);
        }
        createDataChannel(_client, _idRemote) {
            this.addDataChannel(_client, this.peerConnection.createDataChannel(_client.id + "->" + _idRemote));
        }
        addDataChannel(_client, _dataChannel) {
            this.dataChannel = _dataChannel;
            this.dataChannel.addEventListener(EVENT.CONNECTION_OPENED, dispatchRtcEvent);
            this.dataChannel.addEventListener(EVENT.CONNECTION_CLOSED, dispatchRtcEvent);
            this.dataChannel.addEventListener(EVENT.MESSAGE_RECEIVED, dispatchMessage);
            function dispatchRtcEvent(_event) {
                _client.dispatchEvent(new CustomEvent(EVENT.MESSAGE_RECEIVED, { detail: _event }));
            }
            function dispatchMessage(_messageEvent) {
                let message = JSON.parse(_messageEvent.data);
                ƒ.Debug.fudge("Received message from peer ", message.idSource);
                _client.dispatchEvent(new CustomEvent(EVENT.MESSAGE_RECEIVED, { detail: message }));
            }
        }
    }
    FudgeClient.RtcConnection = RtcConnection;
})(FudgeClient || (FudgeClient = {}));
//# sourceMappingURL=FudgeClient.js.map