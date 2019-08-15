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
