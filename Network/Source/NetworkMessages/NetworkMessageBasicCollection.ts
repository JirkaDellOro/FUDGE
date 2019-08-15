import * as FudgeNetwork from "./../ModuleCollector";
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
