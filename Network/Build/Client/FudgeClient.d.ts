/// <reference path="../../../Core/Build/FudgeCore.d.ts" />
declare namespace Messages {
    enum MESSAGE_TYPE {
        UNDEFINED = "undefined",
        ERROR = "error",
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
        SERVER_TO_PEER_MESSAGE = "server_to_peer_message",
        SERVER_HEARTBEAT = "server_heartbeat",
        CLIENT_HEARTBEAT = "client_heartbeat"
    }
    enum SERVER_COMMAND {
        UNDEFINED = "undefined",
        DISCONNECT_CLIENT = "disconnect_client",
        SPAWN_OBJECT = "spawn_object",
        ASSIGN_OBJECT_TO_CLIENT = "assign_object_to_client",
        DESTROY_OBJECT = "destroy_object",
        KEYS_INPUT = "keys_input",
        MOVEMENT_VALUE = "movement_value",
        CREATE_MESH = "createMesh"
    }
    class MessageBase {
        readonly messageType: MESSAGE_TYPE;
        readonly originatorId: string;
        constructor(messageType: MESSAGE_TYPE, originatorId: string);
        static deserialize(_message: string): MessageBase;
        serialize(): string;
    }
    class IdAssigned extends MessageBase {
        assignedId: string;
        constructor(assignedId: string);
    }
    class LoginRequest extends MessageBase {
        loginUserName: string;
        constructor(_originatorId: string, loginUserName?: string);
    }
    class LoginResponse extends MessageBase {
        loginSuccess: boolean;
        originatorUsername: string;
        constructor(loginSuccess: boolean, _assignedId: string, originatorUsername: string);
    }
    class RtcOffer extends MessageBase {
        idRemote: string;
        offer: RTCSessionDescription | RTCSessionDescriptionInit | null | undefined;
        constructor(_originatorId: string, idRemote: string, offer: RTCSessionDescription | RTCSessionDescriptionInit | null | undefined);
    }
    class RtcAnswer extends MessageBase {
        targetId: string;
        answer: RTCSessionDescription;
        constructor(_originatorId: string, targetId: string, answer: RTCSessionDescription);
    }
    class IceCandidate extends MessageBase {
        targetId: string;
        candidate: RTCIceCandidate;
        constructor(_originatorId: string, targetId: string, candidate: RTCIceCandidate);
    }
    class ToServer extends MessageBase {
        messageData: string;
        originatorUserName: string;
        constructor(_originatorId: string, messageData: string, originatorUserName: string);
    }
    class ToClient extends MessageBase {
        messageData: string;
        constructor(messageData: string);
    }
    class ClientReady extends MessageBase {
        constructor(_originatorId: string);
    }
    class ClientMeshReady extends MessageBase {
        constructor(_originatorId: string);
    }
    class ClientIsMeshConnected extends MessageBase {
        constructor(_originatorId: string);
    }
    class PeerTemplate {
        messageType: MESSAGE_TYPE;
        originatorId: string;
        commandType: SERVER_COMMAND;
        constructor(messageType: MESSAGE_TYPE, originatorId: string, commandType: SERVER_COMMAND);
    }
    class PeerSimpleText extends PeerTemplate {
        messageData: string;
        originatorUserName: string;
        constructor(_originatorId: string, messageData: string, originatorUserName: string);
    }
    class PeerDisconnectClient extends PeerTemplate {
        constructor(_originatorId: string);
    }
    class ServerHeartbeat extends MessageBase {
        messageData: string;
        constructor(messageData: string);
    }
    class ClientHeartbeat extends MessageBase {
        messageData: string;
        constructor(_originatorId: string, messageData: string);
    }
}
declare namespace FudgeClient {
    class FudgeClient extends EventTarget {
        id: string;
        name: string;
        wsServerUrl: string | undefined;
        wsServer: WebSocket;
        peers: {
            [id: string]: RtcConnection;
        };
        ownPeerConnection: RTCPeerConnection;
        idRemote: string;
        ownPeerDataChannel: RTCDataChannel | undefined;
        remoteEventPeerDataChannel: RTCDataChannel | undefined;
        isInitiator: boolean;
        readonly configuration: {
            iceServers: {
                urls: string;
            }[];
        };
        constructor();
        connectToServer: (_uri?: string) => void;
        loginToServer: (_requestingUsername: string) => void;
        sendToServer: (_message: Messages.MessageBase) => void;
        connectToPeer: (_idRemote: string) => void;
        sendToPeer: (_messageToSend: string) => void;
        private createRTCPeerConnectionAndAddEventListeners;
        private addWebSocketEventListeners;
        private parseMessageAndHandleMessageType;
        private beginPeerConnectionNegotiation;
        private createNegotiationOfferAndSendToPeer;
        private receiveNegotiationOfferAndSetRemoteDescription;
        private answerNegotiationOffer;
        private receiveAnswerAndSetRemoteDescription;
        private sendIceCandidatesToPeer;
        private addReceivedCandidateToPeerConnection;
        private receiveDataChannelAndEstablishConnection;
        private dataChannelMessageHandler;
        private displayServerMessage;
        private loginValidAddUser;
        private assignIdAndSendConfirmation;
        private stringifyObjectForNetworkSending;
        private setOwnClientId;
        private setOwnUserName;
        private dataChannelStatusChangeHandler;
    }
}
declare namespace FudgeClient {
    class RtcConnection {
        idRemote: string;
        dataChannel: RTCDataChannel | undefined;
        peerConnection: RTCPeerConnection | undefined;
        mediaStream: MediaStream | undefined;
    }
}
