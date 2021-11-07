namespace Messages {
  export enum MESSAGE_TYPE {
    UNDEFINED = "undefined",
    ERROR = "error",
    ID_ASSIGNED = "idAssigned",
    LOGIN_REQUEST = "loginRequest",
    LOGIN_RESPONSE = "loginResponse",
    CLIENT_TO_SERVER = "clientToServer",
    SERVER_TO_CLIENT = "serverToClient",
    PEER_TO_SERVER_COMMAND = "serverCommand",
    PEER_TEXT_MESSAGE = "peerTextMessage",
    SERVER_TO_PEER = "serverToPeer",
    SERVER_HEARTBEAT = "serverHeartbeat",
    CLIENT_HEARTBEAT = "clientHeartbeat",
    RTC_OFFER = "rtcOffer",
    RTC_ANSWER = "rtcAnswer",
    ICE_CANDIDATE = "rtcCandidate"
  }

  export enum SERVER_COMMAND {
    UNDEFINED = "undefined",
    DISCONNECT_CLIENT = "disconnect_client",
    SPAWN_OBJECT = "spawn_object",
    ASSIGN_OBJECT_TO_CLIENT = "assign_object_to_client",
    DESTROY_OBJECT = "destroy_object",
    KEYS_INPUT = "keys_input",
    MOVEMENT_VALUE = "movement_value",
    //
    CREATE_MESH = "createMesh"
  }

  export class MessageBase {
    constructor(public readonly messageType: MESSAGE_TYPE, public readonly originatorId: string) {
    }

    public static deserialize(_message: string): MessageBase {
      let parsed: MessageBase = JSON.parse(_message);
      let message: MessageBase = new MessageBase(parsed.messageType, parsed.originatorId);
      Object.assign(message, parsed);
      return message;
    }

    public serialize(): string {
      return JSON.stringify(this);
    }
  }

  export class IdAssigned extends MessageBase {
    constructor(public assignedId: string) {
      super(MESSAGE_TYPE.ID_ASSIGNED, "Server");
    }
  }

  export class LoginRequest extends MessageBase {
    constructor(_originatorId: string, public loginUserName: string = "") {
      super(MESSAGE_TYPE.LOGIN_REQUEST, _originatorId);
    }
  }

  export class LoginResponse extends MessageBase {
    constructor(public loginSuccess: boolean, _assignedId: string, public originatorUsername: string) {
      super(MESSAGE_TYPE.LOGIN_RESPONSE, _assignedId);
    }
  }

  export class RtcOffer extends MessageBase {
    constructor(_originatorId: string, public idRemote: string, public offer: RTCSessionDescription | RTCSessionDescriptionInit | null | undefined) {
      super(MESSAGE_TYPE.RTC_OFFER, _originatorId);
    }
  }

  export class RtcAnswer extends MessageBase {
    constructor(_originatorId: string, public targetId: string, public answer: RTCSessionDescription) {
      super(MESSAGE_TYPE.RTC_ANSWER, _originatorId);
    }
  }

  export class IceCandidate extends MessageBase {
    constructor(_originatorId: string, public targetId: string, public candidate: RTCIceCandidate) {
      super(MESSAGE_TYPE.ICE_CANDIDATE, _originatorId);
    }
  }

  export class ToServer extends MessageBase {
    constructor(_originatorId: string, public messageData: string, public originatorUserName: string) {
      super(MESSAGE_TYPE.CLIENT_TO_SERVER, _originatorId);
    }
  }

  export class ToClient extends MessageBase {
    constructor(public messageData: string) {
      super(MESSAGE_TYPE.SERVER_TO_CLIENT, "SERVER");
    }
  }

  export class PeerTemplate {
    constructor(public messageType: MESSAGE_TYPE, public originatorId: string, public commandType: SERVER_COMMAND) {
    }
  }

  export class PeerSimpleText extends PeerTemplate {
    constructor(_originatorId: string, public messageData: string, public originatorUserName: string) {
      super(MESSAGE_TYPE.PEER_TEXT_MESSAGE, _originatorId, SERVER_COMMAND.UNDEFINED);
    }
  }

  export class PeerDisconnectClient extends PeerTemplate {
    constructor(_originatorId: string) {
      super(MESSAGE_TYPE.PEER_TO_SERVER_COMMAND, _originatorId, SERVER_COMMAND.DISCONNECT_CLIENT);
    }
  }

  export class ServerHeartbeat extends MessageBase {
    constructor(public messageData: string) {
      super(MESSAGE_TYPE.SERVER_HEARTBEAT, "SERVER");
    }
  }
  
  export class ClientHeartbeat extends MessageBase {
    constructor(_originatorId: string, public messageData: string) {
      super(MESSAGE_TYPE.CLIENT_HEARTBEAT, _originatorId);
    }
  }
}