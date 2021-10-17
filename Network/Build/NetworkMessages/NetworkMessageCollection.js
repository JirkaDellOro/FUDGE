import * as FudgeNetwork from "../ModuleCollectorClient.js";
export class NetworkMessageIdAssigned {
    originatorId = "Server";
    assignedId;
    messageType = FudgeNetwork.MESSAGE_TYPE.ID_ASSIGNED;
    constructor(_assignedId) {
        this.assignedId = _assignedId;
    }
}
export class NetworkMessageLoginRequest {
    originatorId;
    messageType = FudgeNetwork.MESSAGE_TYPE.LOGIN_REQUEST;
    loginUserName = "";
    constructor(_originatorId, _loginUserName) {
        this.loginUserName = _loginUserName;
        this.originatorId = _originatorId;
    }
}
export class NetworkMessageLoginResponse {
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
export class NetworkMessageRtcOffer {
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
export class NetworkMessageRtcAnswer {
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
export class NetworkMessageIceCandidate {
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
export class NetworkMessageMessageToServer {
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
export class NetworkMessageMessageToClient {
    messageType = FudgeNetwork.MESSAGE_TYPE.SERVER_TO_CLIENT_MESSAGE;
    originatorId = "SERVER";
    messageData;
    constructor(_messageData) {
        this.messageData = _messageData;
    }
}
export class NetworkMessageClientReady {
    messageType = FudgeNetwork.MESSAGE_TYPE.CLIENT_READY_FOR_MESH_CONNECTION;
    originatorId;
    constructor(_originatorId) {
        this.originatorId = _originatorId;
    }
}
export class NetworkMessageServerSendMeshClientArray {
    messageType = FudgeNetwork.MESSAGE_TYPE.SERVER_SEND_MESH_CANDIDATES_TO_CLIENT;
    originatorId = "SERVER";
    candidateArray;
    constructor(_candidateArray) {
        this.candidateArray = _candidateArray;
    }
}
export class NetworkMessageClientMeshReady {
    messageType = FudgeNetwork.MESSAGE_TYPE.CLIENT_READY_FOR_MESH_CONNECTION;
    originatorId;
    constructor(_originatorId) {
        this.originatorId = _originatorId;
    }
}
export class NetworkMessageClientIsMeshConnected {
    messageType = FudgeNetwork.MESSAGE_TYPE.CLIENT_MESH_CONNECTED;
    originatorId;
    constructor(_originatorId) {
        this.originatorId = _originatorId;
    }
}
export class PeerMessageSimpleText {
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
export class PeerMessageDisconnectClient {
    originatorId;
    messageType = FudgeNetwork.MESSAGE_TYPE.PEER_TO_SERVER_COMMAND;
    commandType = FudgeNetwork.SERVER_COMMAND_TYPE.DISCONNECT_CLIENT;
    constructor(_originatorId) {
        this.originatorId = _originatorId;
    }
}
export class PeerMessageKeysInput {
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
