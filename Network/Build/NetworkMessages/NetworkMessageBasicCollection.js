"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const FudgeNetwork = __importStar(require("./../ModuleCollector"));
class NetworkMessageIdAssigned {
    constructor(_assignedId) {
        this.originatorId = "Server";
        this.messageType = FudgeNetwork.MESSAGE_TYPE.ID_ASSIGNED;
        this.assignedId = _assignedId;
    }
}
exports.NetworkMessageIdAssigned = NetworkMessageIdAssigned;
class NetworkMessageLoginRequest {
    constructor(_originatorId, _loginUserName) {
        this.messageType = FudgeNetwork.MESSAGE_TYPE.LOGIN_REQUEST;
        this.loginUserName = "";
        this.loginUserName = _loginUserName;
        this.originatorId = _originatorId;
    }
}
exports.NetworkMessageLoginRequest = NetworkMessageLoginRequest;
class NetworkMessageLoginResponse {
    constructor(_loginSuccess, _assignedId, _originatorUsername) {
        this.messageType = FudgeNetwork.MESSAGE_TYPE.LOGIN_RESPONSE;
        this.loginSuccess = _loginSuccess;
        this.originatorId = _assignedId;
        this.originatorUsername = _originatorUsername;
    }
}
exports.NetworkMessageLoginResponse = NetworkMessageLoginResponse;
class NetworkMessageRtcOffer {
    constructor(_originatorId, _userNameToConnectTo, _offer) {
        this.messageType = FudgeNetwork.MESSAGE_TYPE.RTC_OFFER;
        this.originatorId = _originatorId;
        this.userNameToConnectTo = _userNameToConnectTo;
        this.offer = _offer;
    }
}
exports.NetworkMessageRtcOffer = NetworkMessageRtcOffer;
class NetworkMessageRtcAnswer {
    constructor(_originatorId, _targetId, _userNameToConnectTo, _answer) {
        this.messageType = FudgeNetwork.MESSAGE_TYPE.RTC_ANSWER;
        this.originatorId = _originatorId;
        this.targetId = _targetId;
        this.answer = _answer;
    }
}
exports.NetworkMessageRtcAnswer = NetworkMessageRtcAnswer;
class NetworkMessageIceCandidate {
    constructor(_originatorId, _targetId, _candidate) {
        this.messageType = FudgeNetwork.MESSAGE_TYPE.ICE_CANDIDATE;
        this.originatorId = _originatorId;
        this.targetId = _targetId;
        this.candidate = _candidate;
    }
}
exports.NetworkMessageIceCandidate = NetworkMessageIceCandidate;
class PeerMessageSimpleText {
    constructor(_originatorId, _messageData) {
        this.messageType = FudgeNetwork.MESSAGE_TYPE.PEER_TEXT_MESSAGE;
        this.commandType = FudgeNetwork.SERVER_COMMAND_TYPE.UNDEFINED;
        this.originatorId = _originatorId;
        this.messageData = _messageData;
    }
}
exports.PeerMessageSimpleText = PeerMessageSimpleText;
class PeerMessageDisconnectClient {
    constructor(_originatorId) {
        this.messageType = FudgeNetwork.MESSAGE_TYPE.PEER_TO_SERVER_COMMAND;
        this.commandType = FudgeNetwork.SERVER_COMMAND_TYPE.DISCONNECT_CLIENT;
        this.originatorId = _originatorId;
    }
}
exports.PeerMessageDisconnectClient = PeerMessageDisconnectClient;
class PeerMessageKeysInput {
    constructor(_originatorId, _pressedKeycode, _pressedKeyCodes) {
        this.messageType = FudgeNetwork.MESSAGE_TYPE.PEER_TO_SERVER_COMMAND;
        this.commandType = FudgeNetwork.SERVER_COMMAND_TYPE.KEYS_INPUT;
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
