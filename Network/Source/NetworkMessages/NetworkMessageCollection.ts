import * as FudgeNetwork from "../ModuleCollector";
export interface NetworkMessageMessageBase {
    readonly messageType: FudgeNetwork.MESSAGE_TYPE;
    readonly originatorId: string;
}


export class NetworkMessageIdAssigned implements NetworkMessageMessageBase {
    public originatorId: string = "Server";
    public assignedId: string;
    public messageType: FudgeNetwork.MESSAGE_TYPE = FudgeNetwork.MESSAGE_TYPE.ID_ASSIGNED;

    constructor(_assignedId: string) {
        this.assignedId = _assignedId;
    }
}

export class NetworkMessageLoginRequest implements NetworkMessageMessageBase {
    public originatorId: string;
    public messageType: FudgeNetwork.MESSAGE_TYPE = FudgeNetwork.MESSAGE_TYPE.LOGIN_REQUEST;
    public loginUserName: string = "";

    constructor(_originatorId: string, _loginUserName: string) {
        this.loginUserName = _loginUserName;
        this.originatorId = _originatorId;
    }
}

export class NetworkMessageLoginResponse implements NetworkMessageMessageBase {
    public originatorId: string;
    public originatorUsername: string;
    public messageType: FudgeNetwork.MESSAGE_TYPE = FudgeNetwork.MESSAGE_TYPE.LOGIN_RESPONSE;
    public loginSuccess: boolean;

    constructor(_loginSuccess: boolean, _assignedId: string, _originatorUsername: string) {
        this.loginSuccess = _loginSuccess;
        this.originatorId = _assignedId;
        this.originatorUsername = _originatorUsername;
    }
}

export class NetworkMessageRtcOffer implements NetworkMessageMessageBase {

    public originatorId: string;
    public messageType: FudgeNetwork.MESSAGE_TYPE = FudgeNetwork.MESSAGE_TYPE.RTC_OFFER;
    public userNameToConnectTo: string;
    public offer: RTCSessionDescription | RTCSessionDescriptionInit | null;
    constructor(_originatorId: string, _userNameToConnectTo: string, _offer: RTCSessionDescription | RTCSessionDescriptionInit | null) {
        this.originatorId = _originatorId;
        this.userNameToConnectTo = _userNameToConnectTo;
        this.offer = _offer;
    }
}

export class NetworkMessageRtcAnswer implements NetworkMessageMessageBase {

    public originatorId: string;
    public targetId: string;
    public messageType: FudgeNetwork.MESSAGE_TYPE = FudgeNetwork.MESSAGE_TYPE.RTC_ANSWER;
    public answer: RTCSessionDescription;

    constructor(_originatorId: string, _targetId: string, _userNameToConnectTo: string, _answer: RTCSessionDescription) {
        this.originatorId = _originatorId;
        this.targetId = _targetId;
        this.answer = _answer;

    }
}

export class NetworkMessageIceCandidate implements NetworkMessageMessageBase {

    public originatorId: string;
    public targetId: string;
    public messageType: FudgeNetwork.MESSAGE_TYPE = FudgeNetwork.MESSAGE_TYPE.ICE_CANDIDATE;

    public candidate: RTCIceCandidate;
    constructor(_originatorId: string, _targetId: string, _candidate: RTCIceCandidate) {
        this.originatorId = _originatorId;
        this.targetId = _targetId;
        this.candidate = _candidate;
    }
}

export class NetworkMessageMessageToServer implements NetworkMessageMessageBase {
    public messageType: FudgeNetwork.MESSAGE_TYPE = FudgeNetwork.MESSAGE_TYPE.CLIENT_TO_SERVER_MESSAGE;
    public originatorId: string;
    public originatorUserName: string;

    public messageData: string;

    constructor(_originatorId: string, _messageData: string, _originatorUserName: string) {
        this.originatorId = _originatorId;
        this.messageData = _messageData;
        this.originatorUserName = _originatorUserName;
    }
}

export class NetworkMessageMessageToClient implements NetworkMessageMessageBase {
    public messageType: FudgeNetwork.MESSAGE_TYPE = FudgeNetwork.MESSAGE_TYPE.SERVER_TO_CLIENT_MESSAGE;
    public originatorId: string = "SERVER";

    public messageData: string;
    constructor(_messageData: string) {
        this.messageData = _messageData;
    }
}

export class NetworkMessageClientReady implements NetworkMessageMessageBase {
    messageType: FudgeNetwork.MESSAGE_TYPE = FudgeNetwork.MESSAGE_TYPE.CLIENT_READY_FOR_MESH_CONNECTION;
    originatorId: string;

    constructor(_originatorId: string) {
        this.originatorId = _originatorId;
    }
}

export class NetworkMessageServerSendMeshClientArray implements NetworkMessageMessageBase {
    messageType: FudgeNetwork.MESSAGE_TYPE = FudgeNetwork.MESSAGE_TYPE.SERVER_SEND_MESH_CANDIDATES_TO_CLIENT;
    originatorId: string = "SERVER";

    candidateArray: FudgeNetwork.ClientDataType[];

    constructor(_candidateArray: FudgeNetwork.ClientDataType[]) {
        this.candidateArray = _candidateArray;
    }
}

export class NetworkMessageClientMeshReady implements NetworkMessageMessageBase {
    messageType: FudgeNetwork.MESSAGE_TYPE = FudgeNetwork.MESSAGE_TYPE.CLIENT_READY_FOR_MESH_CONNECTION;
    originatorId: string;

    constructor(_originatorId: string) {
        this.originatorId = _originatorId;
    }
}

export class NetworkMessageClientIsMeshConnected implements NetworkMessageMessageBase {
    messageType: FudgeNetwork.MESSAGE_TYPE = FudgeNetwork.MESSAGE_TYPE.CLIENT_MESH_CONNECTED;
    originatorId: string;

    constructor(_originatorId: string) {
        this.originatorId = _originatorId;
    }


}


export interface PeerMessageTemplate {
    originatorId: string;
    messageType: FudgeNetwork.MESSAGE_TYPE;
    commandType: FudgeNetwork.SERVER_COMMAND_TYPE;
}

export class PeerMessageSimpleText implements PeerMessageTemplate {
    originatorId: string;
    originatorUserName: string;
    messageType: FudgeNetwork.MESSAGE_TYPE = FudgeNetwork.MESSAGE_TYPE.PEER_TEXT_MESSAGE;
    commandType: FudgeNetwork.SERVER_COMMAND_TYPE = FudgeNetwork.SERVER_COMMAND_TYPE.UNDEFINED;
    messageData: string;

    constructor(_originatorId: string, _messageData: string, _originatorUserName: string) {
        this.originatorId = _originatorId;
        this.originatorUserName = _originatorUserName;
        this.messageData = _messageData;
    }
}

export class PeerMessageDisconnectClient implements PeerMessageTemplate {
    originatorId: string;
    messageType: FudgeNetwork.MESSAGE_TYPE = FudgeNetwork.MESSAGE_TYPE.PEER_TO_SERVER_COMMAND;
    commandType: FudgeNetwork.SERVER_COMMAND_TYPE = FudgeNetwork.SERVER_COMMAND_TYPE.DISCONNECT_CLIENT;

    constructor(_originatorId: string) {
        this.originatorId = _originatorId;
    }
}

export class PeerMessageKeysInput implements PeerMessageTemplate {
    originatorId: string;
    messageType: FudgeNetwork.MESSAGE_TYPE = FudgeNetwork.MESSAGE_TYPE.PEER_TO_SERVER_COMMAND;
    commandType: FudgeNetwork.SERVER_COMMAND_TYPE = FudgeNetwork.SERVER_COMMAND_TYPE.KEYS_INPUT;
    pressedKey: number;
    pressedKeys: number[] | null;

    constructor(_originatorId: string, _pressedKeycode: number, _pressedKeyCodes?: number[]) {
        this.originatorId = _originatorId;
        this.pressedKey = _pressedKeycode;
        if (_pressedKeyCodes) {
            this.pressedKeys = _pressedKeyCodes;
        }
        else { this.pressedKeys = null; }
    }
}

