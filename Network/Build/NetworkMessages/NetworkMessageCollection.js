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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PeerMessageKeysInput = exports.PeerMessageDisconnectClient = exports.PeerMessageSimpleText = exports.NetworkMessageClientIsMeshConnected = exports.NetworkMessageClientMeshReady = exports.NetworkMessageServerSendMeshClientArray = exports.NetworkMessageClientReady = exports.NetworkMessageMessageToClient = exports.NetworkMessageMessageToServer = exports.NetworkMessageIceCandidate = exports.NetworkMessageRtcAnswer = exports.NetworkMessageRtcOffer = exports.NetworkMessageLoginResponse = exports.NetworkMessageLoginRequest = exports.NetworkMessageIdAssigned = void 0;
const FudgeNetwork = __importStar(require("../ModuleCollector"));
class NetworkMessageIdAssigned {
    originatorId = "Server";
    assignedId;
    messageType = FudgeNetwork.MESSAGE_TYPE.ID_ASSIGNED;
    constructor(_assignedId) {
        this.assignedId = _assignedId;
    }
}
exports.NetworkMessageIdAssigned = NetworkMessageIdAssigned;
class NetworkMessageLoginRequest {
    originatorId;
    messageType = FudgeNetwork.MESSAGE_TYPE.LOGIN_REQUEST;
    loginUserName = "";
    constructor(_originatorId, _loginUserName) {
        this.loginUserName = _loginUserName;
        this.originatorId = _originatorId;
    }
}
exports.NetworkMessageLoginRequest = NetworkMessageLoginRequest;
class NetworkMessageLoginResponse {
    originatorId;
    originatorUsername;
    messageType = FudgeNetwork.MESSAGE_TYPE.LOGIN_RESPONSE;
    loginSuccess;
    constructor(_loginSuccess, _assignedId, _originatorUsername) {
        this.loginSuccess = _loginSuccess;
        this.originatorId = _assignedId;
        this.originatorUsername = _originatorUsername;
    }
}
exports.NetworkMessageLoginResponse = NetworkMessageLoginResponse;
class NetworkMessageRtcOffer {
    originatorId;
    messageType = FudgeNetwork.MESSAGE_TYPE.RTC_OFFER;
    userNameToConnectTo;
    offer;
    constructor(_originatorId, _userNameToConnectTo, _offer) {
        this.originatorId = _originatorId;
        this.userNameToConnectTo = _userNameToConnectTo;
        this.offer = _offer;
    }
}
exports.NetworkMessageRtcOffer = NetworkMessageRtcOffer;
class NetworkMessageRtcAnswer {
    originatorId;
    targetId;
    messageType = FudgeNetwork.MESSAGE_TYPE.RTC_ANSWER;
    answer;
    constructor(_originatorId, _targetId, _userNameToConnectTo, _answer) {
        this.originatorId = _originatorId;
        this.targetId = _targetId;
        this.answer = _answer;
    }
}
exports.NetworkMessageRtcAnswer = NetworkMessageRtcAnswer;
class NetworkMessageIceCandidate {
    originatorId;
    targetId;
    messageType = FudgeNetwork.MESSAGE_TYPE.ICE_CANDIDATE;
    candidate;
    constructor(_originatorId, _targetId, _candidate) {
        this.originatorId = _originatorId;
        this.targetId = _targetId;
        this.candidate = _candidate;
    }
}
exports.NetworkMessageIceCandidate = NetworkMessageIceCandidate;
class NetworkMessageMessageToServer {
    messageType = FudgeNetwork.MESSAGE_TYPE.CLIENT_TO_SERVER_MESSAGE;
    originatorId;
    originatorUserName;
    messageData;
    constructor(_originatorId, _messageData, _originatorUserName) {
        this.originatorId = _originatorId;
        this.messageData = _messageData;
        this.originatorUserName = _originatorUserName;
    }
}
exports.NetworkMessageMessageToServer = NetworkMessageMessageToServer;
class NetworkMessageMessageToClient {
    messageType = FudgeNetwork.MESSAGE_TYPE.SERVER_TO_CLIENT_MESSAGE;
    originatorId = "SERVER";
    messageData;
    constructor(_messageData) {
        this.messageData = _messageData;
    }
}
exports.NetworkMessageMessageToClient = NetworkMessageMessageToClient;
class NetworkMessageClientReady {
    messageType = FudgeNetwork.MESSAGE_TYPE.CLIENT_READY_FOR_MESH_CONNECTION;
    originatorId;
    constructor(_originatorId) {
        this.originatorId = _originatorId;
    }
}
exports.NetworkMessageClientReady = NetworkMessageClientReady;
class NetworkMessageServerSendMeshClientArray {
    messageType = FudgeNetwork.MESSAGE_TYPE.SERVER_SEND_MESH_CANDIDATES_TO_CLIENT;
    originatorId = "SERVER";
    candidateArray;
    constructor(_candidateArray) {
        this.candidateArray = _candidateArray;
    }
}
exports.NetworkMessageServerSendMeshClientArray = NetworkMessageServerSendMeshClientArray;
class NetworkMessageClientMeshReady {
    messageType = FudgeNetwork.MESSAGE_TYPE.CLIENT_READY_FOR_MESH_CONNECTION;
    originatorId;
    constructor(_originatorId) {
        this.originatorId = _originatorId;
    }
}
exports.NetworkMessageClientMeshReady = NetworkMessageClientMeshReady;
class NetworkMessageClientIsMeshConnected {
    messageType = FudgeNetwork.MESSAGE_TYPE.CLIENT_MESH_CONNECTED;
    originatorId;
    constructor(_originatorId) {
        this.originatorId = _originatorId;
    }
}
exports.NetworkMessageClientIsMeshConnected = NetworkMessageClientIsMeshConnected;
class PeerMessageSimpleText {
    originatorId;
    originatorUserName;
    messageType = FudgeNetwork.MESSAGE_TYPE.PEER_TEXT_MESSAGE;
    commandType = FudgeNetwork.SERVER_COMMAND_TYPE.UNDEFINED;
    messageData;
    constructor(_originatorId, _messageData, _originatorUserName) {
        this.originatorId = _originatorId;
        this.originatorUserName = _originatorUserName;
        this.messageData = _messageData;
    }
}
exports.PeerMessageSimpleText = PeerMessageSimpleText;
class PeerMessageDisconnectClient {
    originatorId;
    messageType = FudgeNetwork.MESSAGE_TYPE.PEER_TO_SERVER_COMMAND;
    commandType = FudgeNetwork.SERVER_COMMAND_TYPE.DISCONNECT_CLIENT;
    constructor(_originatorId) {
        this.originatorId = _originatorId;
    }
}
exports.PeerMessageDisconnectClient = PeerMessageDisconnectClient;
class PeerMessageKeysInput {
    originatorId;
    messageType = FudgeNetwork.MESSAGE_TYPE.PEER_TO_SERVER_COMMAND;
    commandType = FudgeNetwork.SERVER_COMMAND_TYPE.KEYS_INPUT;
    pressedKey;
    pressedKeys;
    constructor(_originatorId, _pressedKeycode, _pressedKeyCodes) {
        this.originatorId = _originatorId;
        this.pressedKey = _pressedKeycode;
        if (_pressedKeyCodes) {
            this.pressedKeys = _pressedKeyCodes;
        }
        else {
            this.pressedKeys = null;
        }
    }
}
exports.PeerMessageKeysInput = PeerMessageKeysInput;
