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
        NET_COMMAND["ASSIGN_ID"] = "assignId";
        NET_COMMAND["LOGIN_REQUEST"] = "loginRequest";
        NET_COMMAND["LOGIN_RESPONSE"] = "loginResponse";
        NET_COMMAND["SERVER_HEARTBEAT"] = "serverHeartbeat";
        NET_COMMAND["CLIENT_HEARTBEAT"] = "clientHeartbeat";
        NET_COMMAND["RTC_OFFER"] = "rtcOffer";
        NET_COMMAND["RTC_ANSWER"] = "rtcAnswer";
        NET_COMMAND["ICE_CANDIDATE"] = "rtcCandidate";
    })(NET_COMMAND = Messages.NET_COMMAND || (Messages.NET_COMMAND = {}));
    let NET_ROUTE;
    (function (NET_ROUTE) {
        NET_ROUTE["SERVER"] = "toServer";
        NET_ROUTE["CLIENT"] = "toClient";
        NET_ROUTE["HOST"] = "toHost";
        NET_ROUTE["ALL"] = "toAll";
        NET_ROUTE["VIA_SERVER_CLIENT"] = "viaServerToClient";
        NET_ROUTE["VIA_SERVER_HOST"] = "viaServerToHost";
        NET_ROUTE["VIA_SERVER_ALL"] = "viaServerToAll";
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
module.exports = {Messages: Messages}; 
