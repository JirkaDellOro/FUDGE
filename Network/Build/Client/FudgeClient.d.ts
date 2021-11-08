/// <reference path="../../../Core/Build/FudgeCore.d.ts" />
declare namespace Messages {
    enum MESSAGE_TYPE {
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
    enum SERVER_COMMAND {
        UNDEFINED = "undefined",
        DISCONNECT_CLIENT = "disconnect_client",
        CREATE_MESH = "createMesh"
    }
    class MessageBase {
        readonly messageType: MESSAGE_TYPE;
        readonly idSource: string;
        constructor(messageType: MESSAGE_TYPE, idSource: string);
        static deserialize(_message: string): MessageBase;
        serialize(): string;
    }
    class IdAssigned extends MessageBase {
        assignedId: string;
        constructor(assignedId: string);
    }
    class LoginRequest extends MessageBase {
        loginUserName: string;
        constructor(_idSource: string, loginUserName?: string);
    }
    class LoginResponse extends MessageBase {
        loginSuccess: boolean;
        originatorUsername: string;
        constructor(loginSuccess: boolean, _assignedId: string, originatorUsername: string);
    }
    class RtcOffer extends MessageBase {
        idRemote: string;
        offer: RTCSessionDescription | RTCSessionDescriptionInit | null | undefined;
        constructor(_idSource: string, idRemote: string, offer: RTCSessionDescription | RTCSessionDescriptionInit | null | undefined);
    }
    class RtcAnswer extends MessageBase {
        idTarget: string;
        answer: RTCSessionDescription;
        constructor(_idSource: string, idTarget: string, answer: RTCSessionDescription);
    }
    class IceCandidate extends MessageBase {
        idTarget: string;
        candidate: RTCIceCandidate;
        constructor(_idSource: string, idTarget: string, candidate: RTCIceCandidate);
    }
    class ToServer extends MessageBase {
        messageData: string;
        originatorUserName: string;
        constructor(_idSource: string, messageData: string, originatorUserName: string);
    }
    class ToClient extends MessageBase {
        messageData: string;
        constructor(messageData: string);
    }
    class PeerToPeer extends MessageBase {
        messageData: string;
        constructor(_idSource: string, messageData: string);
    }
    class ServerHeartbeat extends MessageBase {
        messageData: string;
        constructor(messageData: string);
    }
    class ClientHeartbeat extends MessageBase {
        messageData: string;
        constructor(_idSource: string, messageData: string);
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
        constructor();
        connectToServer: (_uri?: string) => void;
        loginToServer: (_requestingUsername: string) => void;
        sendToServer: (_message: Messages.MessageBase) => void;
        connectToPeer: (_idRemote: string) => void;
        sendToPeer: (_idRemote: string, _message: object) => void;
        sendToAllPeers: (_message: object) => void;
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
        private displayServerMessage;
        private loginValidAddUser;
        private assignIdAndSendConfirmation;
    }
}
declare namespace FudgeClient {
    enum EVENT {
        CONNECTION_OPENED = "open",
        CONNECTION_CLOSED = "close",
        MESSAGE_RECEIVED = "message"
    }
    let configuration: {
        iceServers: {
            urls: string;
        }[];
    };
    class RtcConnection {
        peerConnection: RTCPeerConnection;
        dataChannel: RTCDataChannel | undefined;
        mediaStream: MediaStream | undefined;
        constructor();
        createDataChannel(_client: FudgeClient, _idRemote: string): void;
        addDataChannel(_client: FudgeClient, _dataChannel: RTCDataChannel): void;
    }
}
