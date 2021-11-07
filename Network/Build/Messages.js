"use strict";
var Messages;
(function (Messages) {
    let MESSAGE_TYPE;
    (function (MESSAGE_TYPE) {
        MESSAGE_TYPE["UNDEFINED"] = "undefined";
        MESSAGE_TYPE["ERROR"] = "error";
        MESSAGE_TYPE["ID_ASSIGNED"] = "id_assigned";
        MESSAGE_TYPE["LOGIN_REQUEST"] = "login_request";
        MESSAGE_TYPE["LOGIN_RESPONSE"] = "login_response";
        MESSAGE_TYPE["RTC_OFFER"] = "offer";
        MESSAGE_TYPE["RTC_ANSWER"] = "answer";
        MESSAGE_TYPE["ICE_CANDIDATE"] = "candidate";
        MESSAGE_TYPE["SERVER_ASSIGNMENT_REQUEST"] = "server_assignment_request";
        MESSAGE_TYPE["CLIENT_TO_SERVER_MESSAGE"] = "client_to_server_message";
        MESSAGE_TYPE["CLIENT_READY_FOR_MESH_CONNECTION"] = "client_ready_for_mesh_connection";
        MESSAGE_TYPE["CLIENT_MESH_CONNECTED"] = "client_mesh_connected";
        MESSAGE_TYPE["SERVER_SEND_MESH_CANDIDATES_TO_CLIENT"] = "server_send_mesh_candidates_to_client";
        MESSAGE_TYPE["SERVER_TO_CLIENT_MESSAGE"] = "server_to_client_message";
        MESSAGE_TYPE["PEER_TO_SERVER_COMMAND"] = "server_command";
        MESSAGE_TYPE["PEER_TEXT_MESSAGE"] = "peer_text_message";
        MESSAGE_TYPE["SERVER_TO_PEER_MESSAGE"] = "server_to_peer_message";
        MESSAGE_TYPE["SERVER_HEARTBEAT"] = "server_heartbeat";
        MESSAGE_TYPE["CLIENT_HEARTBEAT"] = "client_heartbeat";
    })(MESSAGE_TYPE = Messages.MESSAGE_TYPE || (Messages.MESSAGE_TYPE = {}));
    let SERVER_COMMAND;
    (function (SERVER_COMMAND) {
        SERVER_COMMAND["UNDEFINED"] = "undefined";
        SERVER_COMMAND["DISCONNECT_CLIENT"] = "disconnect_client";
        SERVER_COMMAND["SPAWN_OBJECT"] = "spawn_object";
        SERVER_COMMAND["ASSIGN_OBJECT_TO_CLIENT"] = "assign_object_to_client";
        SERVER_COMMAND["DESTROY_OBJECT"] = "destroy_object";
        SERVER_COMMAND["KEYS_INPUT"] = "keys_input";
        SERVER_COMMAND["MOVEMENT_VALUE"] = "movement_value";
        //
        SERVER_COMMAND["CREATE_MESH"] = "createMesh";
    })(SERVER_COMMAND = Messages.SERVER_COMMAND || (Messages.SERVER_COMMAND = {}));
    class MessageBase {
        messageType;
        originatorId;
        constructor(messageType, originatorId) {
            this.messageType = messageType;
            this.originatorId = originatorId;
        }
        static deserialize(_message) {
            let parsed = JSON.parse(_message);
            let message = new MessageBase(parsed.messageType, parsed.originatorId);
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
        constructor(_originatorId, loginUserName = "") {
            super(MESSAGE_TYPE.LOGIN_REQUEST, _originatorId);
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
        constructor(_originatorId, idRemote, offer) {
            super(MESSAGE_TYPE.RTC_OFFER, _originatorId);
            this.idRemote = idRemote;
            this.offer = offer;
        }
    }
    Messages.RtcOffer = RtcOffer;
    class RtcAnswer extends MessageBase {
        targetId;
        answer;
        constructor(_originatorId, targetId, answer) {
            super(MESSAGE_TYPE.RTC_ANSWER, _originatorId);
            this.targetId = targetId;
            this.answer = answer;
        }
    }
    Messages.RtcAnswer = RtcAnswer;
    class IceCandidate extends MessageBase {
        targetId;
        candidate;
        constructor(_originatorId, targetId, candidate) {
            super(MESSAGE_TYPE.ICE_CANDIDATE, _originatorId);
            this.targetId = targetId;
            this.candidate = candidate;
        }
    }
    Messages.IceCandidate = IceCandidate;
    class ToServer extends MessageBase {
        messageData;
        originatorUserName;
        constructor(_originatorId, messageData, originatorUserName) {
            super(MESSAGE_TYPE.CLIENT_TO_SERVER_MESSAGE, _originatorId);
            this.messageData = messageData;
            this.originatorUserName = originatorUserName;
        }
    }
    Messages.ToServer = ToServer;
    class ToClient extends MessageBase {
        messageData;
        constructor(messageData) {
            super(MESSAGE_TYPE.SERVER_TO_CLIENT_MESSAGE, "SERVER");
            this.messageData = messageData;
        }
    }
    Messages.ToClient = ToClient;
    class ClientReady extends MessageBase {
        constructor(_originatorId) {
            super(MESSAGE_TYPE.CLIENT_READY_FOR_MESH_CONNECTION, _originatorId);
        }
    }
    Messages.ClientReady = ClientReady;
    // export class ServerSendMeshClientArray extends MessageBase {
    //   constructor(public candidateArray: Client[]) {
    //     super(MESSAGE_TYPE.SERVER_SEND_MESH_CANDIDATES_TO_CLIENT, "SERVER");
    //   }
    // }
    class ClientMeshReady extends MessageBase {
        constructor(_originatorId) {
            super(MESSAGE_TYPE.CLIENT_READY_FOR_MESH_CONNECTION, _originatorId);
        }
    }
    Messages.ClientMeshReady = ClientMeshReady;
    class ClientIsMeshConnected extends MessageBase {
        constructor(_originatorId) {
            super(MESSAGE_TYPE.CLIENT_MESH_CONNECTED, _originatorId);
        }
    }
    Messages.ClientIsMeshConnected = ClientIsMeshConnected;
    class PeerTemplate {
        messageType;
        originatorId;
        commandType;
        constructor(messageType, originatorId, commandType) {
            this.messageType = messageType;
            this.originatorId = originatorId;
            this.commandType = commandType;
        }
    }
    Messages.PeerTemplate = PeerTemplate;
    class PeerSimpleText extends PeerTemplate {
        messageData;
        originatorUserName;
        constructor(_originatorId, messageData, originatorUserName) {
            super(MESSAGE_TYPE.PEER_TEXT_MESSAGE, _originatorId, SERVER_COMMAND.UNDEFINED);
            this.messageData = messageData;
            this.originatorUserName = originatorUserName;
        }
    }
    Messages.PeerSimpleText = PeerSimpleText;
    class PeerDisconnectClient extends PeerTemplate {
        constructor(_originatorId) {
            super(MESSAGE_TYPE.PEER_TO_SERVER_COMMAND, _originatorId, SERVER_COMMAND.DISCONNECT_CLIENT);
        }
    }
    Messages.PeerDisconnectClient = PeerDisconnectClient;
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
        constructor(_originatorId, messageData) {
            super(MESSAGE_TYPE.CLIENT_HEARTBEAT, _originatorId);
            this.messageData = messageData;
        }
    }
    Messages.ClientHeartbeat = ClientHeartbeat;
})(Messages || (Messages = {}));
module.exports = {Messages: Messages}; 
