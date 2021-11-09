namespace Messages {
  export enum MESSAGE_TYPE {
    UNDEFINED = "undefined",
    ERROR = "error",
    ID_ASSIGNED = "idAssigned",
    LOGIN_REQUEST = "loginRequest",
    LOGIN_RESPONSE = "loginResponse",
    CLIENT_TO_SERVER = "clientToServer",
    SERVER_TO_CLIENT = "serverToClient",
    PEER_TO_PEER = "peerToPeer",
    SERVER_HEARTBEAT = "serverHeartbeat",
    CLIENT_HEARTBEAT = "clientHeartbeat",
    RTC_OFFER = "rtcOffer",
    RTC_ANSWER = "rtcAnswer",
    ICE_CANDIDATE = "rtcCandidate"
  }

  export enum SERVER_COMMAND {
    UNDEFINED = "undefined",
    DISCONNECT_CLIENT = "disconnect_client",
    CREATE_MESH = "createMesh",
    CONNECT_HOST = "connectHost",
    CONNECT_PEERS = "connectPeers"
  }

  export enum NET_COMMAND {
    UNDEFINED = "undefined",
    ERROR = "error",
    ASSIGN_ID = "assignId",
    LOGIN_REQUEST = "loginRequest",
    LOGIN_RESPONSE = "loginResponse",
    SERVER_HEARTBEAT = "serverHeartbeat",
    CLIENT_HEARTBEAT = "clientHeartbeat",
    RTC_OFFER = "rtcOffer",
    RTC_ANSWER = "rtcAnswer",
    ICE_CANDIDATE = "rtcCandidate"
  }

  export enum NET_ROUTE {
    SERVER = "toServer",
    CLIENT = "toClient",
    HOST = "toHost",
    ALL = "toAll",
    VIA_SERVER_CLIENT = "viaServerToClient",
    VIA_SERVER_HOST = "viaServerToHost",
    VIA_SERVER_ALL = "viaServerToAll"
  }

  export interface NetMessage {
    /** the route the message is supposed to take */ 
    route: NET_ROUTE; 
    /** the command the message is supposed to trigger */ 
    command: NET_COMMAND; 
    idSource?: string; /** the id of the client sending the message, undefined for server. Automatically inserted by send-method */
    idTarget?: string; /** the id of the intended recipient of the message, undefined for messages to the server or to all */
    timeServer?: number; /** the timestamp of the server sending or passing this message. Automatically set by send- or pass-method */
    timeSender?: number; /** the timestamp of the sender. Automatically set by send-method */
    content?: Object; /** the actual content of the message as a simple javascript object like a FUDGE-Mutator */
  }

  export class MessageBase {
    constructor(public readonly messageType: MESSAGE_TYPE, public readonly idSource: string) {
    }

    public static deserialize(_message: string): MessageBase {
      let parsed: MessageBase = JSON.parse(_message);
      let message: MessageBase = new MessageBase(parsed.messageType, parsed.idSource);
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
    constructor(_idSource: string, public loginUserName: string = "") {
      super(MESSAGE_TYPE.LOGIN_REQUEST, _idSource);
    }
  }

  export class LoginResponse extends MessageBase {
    constructor(public loginSuccess: boolean, _assignedId: string, public originatorUsername: string) {
      super(MESSAGE_TYPE.LOGIN_RESPONSE, _assignedId);
    }
  }

  export class RtcOffer extends MessageBase {
    constructor(_idSource: string, public idRemote: string, public offer: RTCSessionDescription | RTCSessionDescriptionInit | null | undefined) {
      super(MESSAGE_TYPE.RTC_OFFER, _idSource);
    }
  }

  export class RtcAnswer extends MessageBase {
    constructor(_idSource: string, public idTarget: string, public answer: RTCSessionDescription) {
      super(MESSAGE_TYPE.RTC_ANSWER, _idSource);
    }
  }

  export class IceCandidate extends MessageBase {
    constructor(_idSource: string, public idTarget: string, public candidate: RTCIceCandidate) {
      super(MESSAGE_TYPE.ICE_CANDIDATE, _idSource);
    }
  }

  export class ToServer extends MessageBase {
    constructor(_idSource: string, public messageData: string, public originatorUserName: string) {
      super(MESSAGE_TYPE.CLIENT_TO_SERVER, _idSource);
    }
  }

  export class ToClient extends MessageBase {
    constructor(public messageData: string) {
      super(MESSAGE_TYPE.SERVER_TO_CLIENT, "SERVER");
    }
  }

  export class PeerToPeer extends MessageBase {
    constructor(_idSource: string, public messageData: string) {
      super(MESSAGE_TYPE.PEER_TO_PEER, _idSource);
    }
  }

  export class ServerHeartbeat extends MessageBase {
    constructor(public messageData: string) {
      super(MESSAGE_TYPE.SERVER_HEARTBEAT, "SERVER");
    }
  }
  
  export class ClientHeartbeat extends MessageBase {
    constructor(_idSource: string, public messageData: string) {
      super(MESSAGE_TYPE.CLIENT_HEARTBEAT, _idSource);
    }
  }
}