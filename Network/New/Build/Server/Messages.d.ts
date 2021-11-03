export declare enum MESSAGE_TYPE {
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
export declare enum SERVER_COMMAND_TYPE {
    UNDEFINED = "undefined",
    DISCONNECT_CLIENT = "disconnect_client",
    SPAWN_OBJECT = "spawn_object",
    ASSIGN_OBJECT_TO_CLIENT = "assign_object_to_client",
    DESTROY_OBJECT = "destroy_object",
    KEYS_INPUT = "keys_input",
    MOVEMENT_VALUE = "movement_value"
}
export declare class MessageBase {
    readonly messageType: MESSAGE_TYPE;
    readonly originatorId: string;
    constructor(messageType: MESSAGE_TYPE, originatorId: string);
    static deserialize(_message: string): MessageBase;
    serialize(): string;
}
export declare class IdAssigned extends MessageBase {
    assignedId: string;
    constructor(assignedId: string);
}
export declare class LoginRequest extends MessageBase {
    loginUserName: string;
    constructor(_originatorId: string, loginUserName?: string);
}
export declare class LoginResponse extends MessageBase {
    loginSuccess: boolean;
    originatorUsername: string;
    constructor(loginSuccess: boolean, _assignedId: string, originatorUsername: string);
}
export declare class RtcOffer extends MessageBase {
    userNameToConnectTo: string;
    offer: RTCSessionDescription | RTCSessionDescriptionInit | null | undefined;
    constructor(_originatorId: string, userNameToConnectTo: string, offer: RTCSessionDescription | RTCSessionDescriptionInit | null | undefined);
}
export declare class RtcAnswer extends MessageBase {
    targetId: string;
    answer: RTCSessionDescription;
    constructor(_originatorId: string, targetId: string, answer: RTCSessionDescription);
}
export declare class IceCandidate extends MessageBase {
    targetId: string;
    candidate: RTCIceCandidate;
    constructor(_originatorId: string, targetId: string, candidate: RTCIceCandidate);
}
export declare class ToServer extends MessageBase {
    messageData: string;
    originatorUserName: string;
    constructor(_originatorId: string, messageData: string, originatorUserName: string);
}
export declare class ToClient extends MessageBase {
    messageData: string;
    constructor(messageData: string);
}
export declare class ClientReady extends MessageBase {
    constructor(_originatorId: string);
}
export declare class ClientMeshReady extends MessageBase {
    constructor(_originatorId: string);
}
export declare class ClientIsMeshConnected extends MessageBase {
    constructor(_originatorId: string);
}
export declare class PeerTemplate {
    messageType: MESSAGE_TYPE;
    originatorId: string;
    commandType: SERVER_COMMAND_TYPE;
    constructor(messageType: MESSAGE_TYPE, originatorId: string, commandType: SERVER_COMMAND_TYPE);
}
export declare class PeerSimpleText extends PeerTemplate {
    messageData: string;
    originatorUserName: string;
    constructor(_originatorId: string, messageData: string, originatorUserName: string);
}
export declare class PeerDisconnectClient extends PeerTemplate {
    constructor(_originatorId: string);
}
