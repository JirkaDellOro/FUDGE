"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PeerDisconnectClient = exports.PeerSimpleText = exports.PeerTemplate = exports.ClientIsMeshConnected = exports.ClientMeshReady = exports.ClientReady = exports.ToClient = exports.ToServer = exports.IceCandidate = exports.RtcAnswer = exports.RtcOffer = exports.LoginResponse = exports.LoginRequest = exports.IdAssigned = exports.MessageBase = exports.SERVER_COMMAND_TYPE = exports.MESSAGE_TYPE = void 0;
var MESSAGE_TYPE;
(function (MESSAGE_TYPE) {
    MESSAGE_TYPE["UNDEFINED"] = "undefined";
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
})(MESSAGE_TYPE = exports.MESSAGE_TYPE || (exports.MESSAGE_TYPE = {}));
var SERVER_COMMAND_TYPE;
(function (SERVER_COMMAND_TYPE) {
    SERVER_COMMAND_TYPE["UNDEFINED"] = "undefined";
    SERVER_COMMAND_TYPE["DISCONNECT_CLIENT"] = "disconnect_client";
    SERVER_COMMAND_TYPE["SPAWN_OBJECT"] = "spawn_object";
    SERVER_COMMAND_TYPE["ASSIGN_OBJECT_TO_CLIENT"] = "assign_object_to_client";
    SERVER_COMMAND_TYPE["DESTROY_OBJECT"] = "destroy_object";
    SERVER_COMMAND_TYPE["KEYS_INPUT"] = "keys_input";
    SERVER_COMMAND_TYPE["MOVEMENT_VALUE"] = "movement_value";
})(SERVER_COMMAND_TYPE = exports.SERVER_COMMAND_TYPE || (exports.SERVER_COMMAND_TYPE = {}));
class MessageBase {
    messageType;
    originatorId;
    constructor(messageType, originatorId) {
        this.messageType = messageType;
        this.originatorId = originatorId;
    }
}
exports.MessageBase = MessageBase;
class IdAssigned extends MessageBase {
    assignedId;
    constructor(assignedId) {
        super(MESSAGE_TYPE.ID_ASSIGNED, "Server");
        this.assignedId = assignedId;
    }
}
exports.IdAssigned = IdAssigned;
class LoginRequest extends MessageBase {
    loginUserName;
    constructor(_originatorId, loginUserName = "") {
        super(MESSAGE_TYPE.LOGIN_REQUEST, _originatorId);
        this.loginUserName = loginUserName;
    }
}
exports.LoginRequest = LoginRequest;
class LoginResponse extends MessageBase {
    loginSuccess;
    originatorUsername;
    constructor(loginSuccess, _assignedId, originatorUsername) {
        super(MESSAGE_TYPE.LOGIN_RESPONSE, _assignedId);
        this.loginSuccess = loginSuccess;
        this.originatorUsername = originatorUsername;
    }
}
exports.LoginResponse = LoginResponse;
class RtcOffer extends MessageBase {
    userNameToConnectTo;
    offer;
    constructor(_originatorId, userNameToConnectTo, offer) {
        super(MESSAGE_TYPE.RTC_OFFER, _originatorId);
        this.userNameToConnectTo = userNameToConnectTo;
        this.offer = offer;
    }
}
exports.RtcOffer = RtcOffer;
class RtcAnswer extends MessageBase {
    targetId;
    answer;
    constructor(_originatorId, targetId, answer) {
        super(MESSAGE_TYPE.RTC_ANSWER, _originatorId);
        this.targetId = targetId;
        this.answer = answer;
    }
}
exports.RtcAnswer = RtcAnswer;
class IceCandidate extends MessageBase {
    targetId;
    candidate;
    constructor(_originatorId, targetId, candidate) {
        super(MESSAGE_TYPE.ICE_CANDIDATE, _originatorId);
        this.targetId = targetId;
        this.candidate = candidate;
    }
}
exports.IceCandidate = IceCandidate;
class ToServer extends MessageBase {
    messageData;
    originatorUserName;
    constructor(_originatorId, messageData, originatorUserName) {
        super(MESSAGE_TYPE.CLIENT_TO_SERVER_MESSAGE, _originatorId);
        this.messageData = messageData;
        this.originatorUserName = originatorUserName;
    }
}
exports.ToServer = ToServer;
class ToClient extends MessageBase {
    messageData;
    constructor(messageData) {
        super(MESSAGE_TYPE.SERVER_TO_CLIENT_MESSAGE, "SERVER");
        this.messageData = messageData;
    }
}
exports.ToClient = ToClient;
class ClientReady extends MessageBase {
    constructor(_originatorId) {
        super(MESSAGE_TYPE.CLIENT_READY_FOR_MESH_CONNECTION, _originatorId);
    }
}
exports.ClientReady = ClientReady;
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
exports.ClientMeshReady = ClientMeshReady;
class ClientIsMeshConnected extends MessageBase {
    constructor(_originatorId) {
        super(MESSAGE_TYPE.CLIENT_MESH_CONNECTED, _originatorId);
    }
}
exports.ClientIsMeshConnected = ClientIsMeshConnected;
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
exports.PeerTemplate = PeerTemplate;
class PeerSimpleText extends PeerTemplate {
    messageData;
    originatorUserName;
    constructor(_originatorId, messageData, originatorUserName) {
        super(MESSAGE_TYPE.PEER_TEXT_MESSAGE, _originatorId, SERVER_COMMAND_TYPE.UNDEFINED);
        this.messageData = messageData;
        this.originatorUserName = originatorUserName;
    }
}
exports.PeerSimpleText = PeerSimpleText;
class PeerDisconnectClient extends PeerTemplate {
    constructor(_originatorId) {
        super(MESSAGE_TYPE.PEER_TO_SERVER_COMMAND, _originatorId, SERVER_COMMAND_TYPE.DISCONNECT_CLIENT);
    }
}
exports.PeerDisconnectClient = PeerDisconnectClient;
