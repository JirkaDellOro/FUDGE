/// <reference path="../../../Core/Build/FudgeCore.d.ts" />
declare namespace FudgeNet {
    enum COMMAND {
        UNDEFINED = "undefined",
        ERROR = "error",
        /** sent from server to assign an id for the connection and reconfirmed by the client. `idTarget` is used to carry the id  */
        ASSIGN_ID = "assignId",
        /** sent from a client to the server to suggest a login name. `name` used for the suggested name  */
        LOGIN_REQUEST = "loginRequest",
        /** sent from the server to the client requesting a login name. `content.success` is true or false for feedback */
        LOGIN_RESPONSE = "loginResponse",
        /** sent from the server every second to check if the connection is still up.
         * `content` is an array of objects with the ids of the clients and their connected peers as known to the server */
        SERVER_HEARTBEAT = "serverHeartbeat",
        /** not used yet */
        CLIENT_HEARTBEAT = "clientHeartbeat",
        /** command used internally when a client tries to connect to another via rtc to create a peer-to-peer-connection */
        RTC_OFFER = "rtcOffer",
        /** command used internally when a client answers a conection request from another client */
        RTC_ANSWER = "rtcAnswer",
        /** command used internally when a client send its connection candidates for peer-to-peer connetion */
        ICE_CANDIDATE = "rtcCandidate",
        /** command sent by a client to the server and from the server to all clients to initiate a mesh structure between the clients
         * creating peer-to-peer-connections between all clients known to the server */
        CREATE_MESH = "createMesh",
        /** command sent by a client, which is supposed to become the host, to the server and from the server to all clients
         * to create peer-to-peer-connections between this host and all other clients known to the server */
        CONNECT_HOST = "connectHost",
        /** command initializing peer-to-peer-connections between the client identified with `idTarget` and all the peers
         * identified by the array giwen with `content.peers` */
        CONNECT_PEERS = "connectPeers",
        /** dissolve peer-to-peer-connection between the client identified with `idTarget` and all the peers
         * identified by the array giwen with `content.peers` or to all peers the client is connected to, if content.peers is undefined */
        DISCONNECT_PEERS = "disconnectPeers",
        /** sent to the server to create a new room and return its id */
        ROOM_CREATE = "roomCreate",
        /** sent to the server and back to the calling client to retrieve an array of available room ids */
        ROOM_GET_IDS = "roomGetIds",
        /** sent to the server to join the calling client to the room given with the id, sent back to all clients in the room after */
        ROOM_ENTER = "roomEnter"
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
    enum ROUTE {
        HOST = "toHost",
        SERVER = "toServer",
        VIA_SERVER = "viaServer",
        VIA_SERVER_HOST = "viaServerToHost"
    }
    interface Message {
        /** the command the message is supposed to trigger */
        idRoom?: string;
        /** the command the message is supposed to trigger */
        command?: COMMAND;
        /** the route the message is supposed to take, undefined for peers */
        route?: ROUTE;
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
declare namespace FudgeNet {
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
    /**
     * Manages a single rtc peer-to-peer connection with multiple channels.
     * {@link FudgeNet.Message}s are passed on from the client using this connection
     * for further processing by some observer. Instances of this class are
     * used internally by the {@link FudgeClient} and should not be used otherwise.
     * @author Jirka Dell'Oro-Friedl, HFU, 2021
     */
    class Rtc extends RTCPeerConnection {
        dataChannel: RTCDataChannel | undefined;
        mediaStream: MediaStream | undefined;
        constructor();
        setupDataChannel: (_client: FudgeClient, _idRemote: string) => void;
        addDataChannel: (_client: FudgeClient, _dataChannel: RTCDataChannel) => void;
        send: (_message: string) => void;
        private logState;
    }
}
declare namespace FudgeNet {
    /**
     * Manages a websocket connection to a FudgeServer and multiple rtc-connections to other FudgeClients.
     * Processes messages from in the format {@link FudgeNet.Message} according to the controlling
     * fields {@link FudgeNet.ROUTE} and {@link FudgeNet.COMMAND}.
     * @author Falco Böhnke, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2021-2022
     */
    class FudgeClient extends EventTarget {
        id: string;
        name: string;
        urlServer: string;
        socket: WebSocket;
        peers: {
            [id: string]: Rtc;
        };
        clientsInfoFromServer: {
            [id: string]: {
                name?: string;
                isHost?: boolean;
            };
        };
        idHost: string;
        idRoom: string;
        constructor();
        /**
         * Tries to connect to the server at the given url and installs the appropriate listeners
         */
        connectToServer: (_uri?: string) => void;
        /**
         * Tries to publish a human readable name for this client. Identification still solely by `id`
         */
        loginToServer: (_name: string) => void;
        /**
         * Tries to connect to another client with the given id via rtc
         */
        connectToPeer: (_idPeer: string) => void;
        connectPeers(_ids: string[]): void;
        /**
         * Tries to disconnect the peer given with id
         */
        disconnectPeer(_idRemote: string): void;
        /**
         * Disconnect all peers
         */
        disconnectPeers(_ids?: string[]): void;
        /**
         * Dispatches a {@link FudgeNet.Message} to the server, a specific client or all
         * according to {@link FudgeNet.ROUTE} and `idTarget`
         */
        dispatch(_message: FudgeNet.Message): void;
        /**
         * Sends out a disconnect message to all peers, disconnects from all peers and sends a CREATE_MESH-command to the server,
         * to establish RTC-peer-connections between all clients
         */
        createMesh(): void;
        /**
         * Sends out a disconnect message to all peers, disconnects from all peers and sends a CONNECT_HOST-command to the server,
         * to establish RTC-peer-connections between this client and all others, making this the host
         */
        becomeHost(): void;
        hndMessage: (_event: MessageEvent) => void;
        private sendToPeer;
        private sendToAllPeers;
        private addWebSocketEventListeners;
        private loginValidAddUser;
        private assignIdAndSendConfirmation;
        /**
         * Create a new Rtc-Object, install listeners to it and create a data channel
         */
        private cRstartNegotiation;
        /**
         * Start negotiation by sending an offer with the local description of the connection via the signalling server
         */
        private cRsendOffer;
        /**
         * Callee receives offer, creates a peerConnection on its side, sets the remote description and its own local description,
         * installs a datachannel-event on the connection and sends its local description back to the caller as answer to the offer via the server
         */
        private cEreceiveOffer;
        /**
         * Caller receives the answer and sets the remote description on its side. The first part of the negotiation is done.
         */
        private cRreceiveAnswer;
        /**
         * Caller starts collecting ICE-candidates and calls this function for each candidate found,
         * which sends the candidate info to callee via the server
         */
        private cRsendIceCandidates;
        /**
         * Callee receives the info about the ice-candidate and adds it to the connection
         */
        private cEaddIceCandidate;
        private cEestablishConnection;
    }
}
