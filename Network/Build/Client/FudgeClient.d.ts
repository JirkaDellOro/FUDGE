/// <reference path="../../../Core/Build/FudgeCore.d.ts" />
declare namespace Messages {
    enum NET_COMMAND {
        UNDEFINED = "undefined",
        ERROR = "error",
        /** sent from server to assign an id for the connection and reconfirmed by the client. idTarget is used to carry the id  */
        ASSIGN_ID = "assignId",
        /** sent from server to assign an id for the connection and reconfirmed by the client. idTarget is used to carry the id  */
        LOGIN_REQUEST = "loginRequest",
        LOGIN_RESPONSE = "loginResponse",
        SERVER_HEARTBEAT = "serverHeartbeat",
        CLIENT_HEARTBEAT = "clientHeartbeat",
        RTC_OFFER = "rtcOffer",
        RTC_ANSWER = "rtcAnswer",
        ICE_CANDIDATE = "rtcCandidate",
        DISCONNECT_CLIENT = "disconnect_client",
        CREATE_MESH = "createMesh",
        CONNECT_HOST = "connectHost",
        CONNECT_PEERS = "connectPeers"
    }
    /**
     * Defines the route the message should take.
     * - route undefined -> send message to peer idTarget using RTC
     * - route undefined & idTarget undefined -> send message to all peers using RTC
     * - route HOST -> send message to peer acting as host using RTC, ignoring idTarget
     * - route SERVER -> send message to server using websocket
     * - route VIA_SERVER -> send message to client idTarget via server using websocket
     * - route VIA_SERVER_HOST -> send message to client acting as host via server using websocket, ignoring idTarget
     */
    enum NET_ROUTE {
        HOST = "toHost",
        SERVER = "toServer",
        VIA_SERVER = "viaServer",
        VIA_SERVER_HOST = "viaServerToHost"
    }
    interface NetMessage {
        /** the command the message is supposed to trigger */
        command?: NET_COMMAND;
        /** the route the message is supposed to take, undefined for peers */
        route?: NET_ROUTE;
        /** the id of the client sending the message, undefined for server. Automatically inserted by dispatch-method */
        idSource?: string;
        /** the id of the intended recipient of the message, undefined for messages to the server or to all */
        idTarget?: string;
        /** the timestamp of the server sending or passing this message. Automatically set by dispatch- or pass-method */
        timeServer?: number;
        /** the timestamp of the sender. Automatically set by dispatch-method */
        timeSender?: number;
        /** the actual content of the message as a simple javascript object like a FUDGE-Mutator */
        content?: {
            [key: string]: any;
        };
    }
}
declare namespace FudgeClient {
    class FudgeClient extends EventTarget {
        id: string;
        name: string;
        urlServer: string | undefined;
        socket: WebSocket;
        peers: {
            [id: string]: RtcConnection;
        };
        constructor();
        connectToServer: (_uri?: string) => void;
        loginToServer: (_name: string) => void;
        dispatch(_message: Messages.NetMessage): void;
        connectToPeer: (_idRemote: string) => void;
        private sendToPeer;
        private sendToAllPeers;
        private addWebSocketEventListeners;
        private hndMessage;
        private beginPeerConnectionNegotiation;
        private createNegotiationOfferAndSendToPeer;
        private receiveNegotiationOfferAndSetRemoteDescription;
        private answerNegotiationOffer;
        private receiveAnswerAndSetRemoteDescription;
        private sendIceCandidatesToPeer;
        private addReceivedCandidateToPeerConnection;
        private receiveDataChannelAndEstablishConnection;
        private loginValidAddUser;
        private assignIdAndSendConfirmation;
    }
}
declare namespace FudgeClient {
    enum EVENT {
        CONNECTION_OPENED = "open",
        CONNECTION_CLOSED = "close",
        ERROR = "error",
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
