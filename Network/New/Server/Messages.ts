export enum MESSAGE_TYPE {
  UNDEFINED = "undefined",
  ID_ASSIGNED = "id_assigned",
  LOGIN_REQUEST = "login_request",
  LOGIN_RESPONSE = "login_response",
  RTC_OFFER = "offer",
  RTC_ANSWER = "answer",
  ICE_CANDIDATE = "candidate",
  SERVER_ASSIGNMENT_REQUEST = "server_assignment_request",
  CLIENT_TO_SERVER_MESSAGE = "client_to_server_message",
  CLIENT_READY_FOR_MESH_CONNECTION = "client_ready_for_mesh_connection",
  CLIENT_MESH_CONNECTED = "client_mesh_connected",
  SERVER_SEND_MESH_CANDIDATES_TO_CLIENT = "server_send_mesh_candidates_to_client",
  SERVER_TO_CLIENT_MESSAGE = "server_to_client_message",
  PEER_TO_SERVER_COMMAND = "server_command",
  PEER_TEXT_MESSAGE = "peer_text_message",
  SERVER_TO_PEER_MESSAGE = "server_to_peer_message"
}


export enum SERVER_COMMAND_TYPE {
  UNDEFINED = "undefined",
  DISCONNECT_CLIENT = "disconnect_client",
  SPAWN_OBJECT = "spawn_object",
  ASSIGN_OBJECT_TO_CLIENT = "assign_object_to_client",
  DESTROY_OBJECT = "destroy_object",
  KEYS_INPUT = "keys_input",
  MOVEMENT_VALUE = "movement_value"

}

export class MessageBase {
  constructor(public readonly messageType: MESSAGE_TYPE, public readonly originatorId: string) {
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
  constructor(_originatorId: string, public userNameToConnectTo: string, public offer: RTCSessionDescription | RTCSessionDescriptionInit | null | undefined) {
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
    super(MESSAGE_TYPE.CLIENT_TO_SERVER_MESSAGE, _originatorId);
  }
}

export class ToClient extends MessageBase {
  constructor(public messageData: string) {
    super(MESSAGE_TYPE.SERVER_TO_CLIENT_MESSAGE, "SERVER");
  }
}

export class ClientReady extends MessageBase {
  constructor(_originatorId: string) {
    super(MESSAGE_TYPE.CLIENT_READY_FOR_MESH_CONNECTION, _originatorId);
  }
}

// export class ServerSendMeshClientArray extends MessageBase {
//   constructor(public candidateArray: Client[]) {
//     super(MESSAGE_TYPE.SERVER_SEND_MESH_CANDIDATES_TO_CLIENT, "SERVER");
//   }
// }

export class ClientMeshReady extends MessageBase {
  constructor(_originatorId: string) {
    super(MESSAGE_TYPE.CLIENT_READY_FOR_MESH_CONNECTION, _originatorId);
  }
}

export class ClientIsMeshConnected extends MessageBase {
  constructor(_originatorId: string) {
    super(MESSAGE_TYPE.CLIENT_MESH_CONNECTED, _originatorId);
  }
}


export class PeerTemplate {
  constructor(public messageType: MESSAGE_TYPE, public originatorId: string, public commandType: SERVER_COMMAND_TYPE) {
  }
}

export class PeerSimpleText extends PeerTemplate {
  constructor(_originatorId: string, public messageData: string, public originatorUserName: string) {
    super(MESSAGE_TYPE.PEER_TEXT_MESSAGE, _originatorId, SERVER_COMMAND_TYPE.UNDEFINED);
  }
}

export class PeerDisconnectClient extends PeerTemplate {
  constructor(_originatorId: string) {
    super(MESSAGE_TYPE.PEER_TO_SERVER_COMMAND, _originatorId, SERVER_COMMAND_TYPE.DISCONNECT_CLIENT);
  }
}


