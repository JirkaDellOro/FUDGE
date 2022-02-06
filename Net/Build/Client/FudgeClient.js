"use strict";
var FudgeNet;
(function (FudgeNet) {
    let COMMAND;
    (function (COMMAND) {
        COMMAND["UNDEFINED"] = "undefined";
        COMMAND["ERROR"] = "error";
        /** sent from server to assign an id for the connection and reconfirmed by the client. `idTarget` is used to carry the id  */
        COMMAND["ASSIGN_ID"] = "assignId";
        /** sent from a client to the server to suggest a login name. `name` used for the suggested name  */
        COMMAND["LOGIN_REQUEST"] = "loginRequest";
        /** sent from the server to the client requesting a login name. `content.success` is true or false for feedback */
        COMMAND["LOGIN_RESPONSE"] = "loginResponse";
        /** sent from the server every second to check if the connection is still up.
         * `content` is an array of objects with the ids of the clients and their connected peers as known to the server */
        COMMAND["SERVER_HEARTBEAT"] = "serverHeartbeat";
        /** not used yet */
        COMMAND["CLIENT_HEARTBEAT"] = "clientHeartbeat";
        /** command used internally when a client tries to connect to another via rtc to create a peer-to-peer-connection */
        COMMAND["RTC_OFFER"] = "rtcOffer";
        /** command used internally when a client answers a conection request from another client */
        COMMAND["RTC_ANSWER"] = "rtcAnswer";
        /** command used internally when a client send its connection candidates for peer-to-peer connetion */
        COMMAND["ICE_CANDIDATE"] = "rtcCandidate";
        /** command sent by a client to the server and from the server to all clients to initiate a mesh structure between the clients
         * creating peer-to-peer-connections between all clients known to the server */
        COMMAND["CREATE_MESH"] = "createMesh";
        /** command sent by a client, which is supposed to become the host, to the server and from the server to all clients
         * to create peer-to-peer-connections between this host and all other clients known to the server */
        COMMAND["CONNECT_HOST"] = "connectHost";
        /** command initializing peer-to-peer-connections between the client identified with `idTarget` and all the peers
         * identified by the array giwen with `content.peers` */
        COMMAND["CONNECT_PEERS"] = "connectPeers";
        /** dissolve peer-to-peer-connection between the client identified with `idTarget` and all the peers
         * identified by the array giwen with `content.peers` or to all peers the client is connected to, if content.peers is undefined */
        COMMAND["DISCONNECT_PEERS"] = "disconnectPeers";
    })(COMMAND = FudgeNet.COMMAND || (FudgeNet.COMMAND = {}));
    /**
     * Defines the route the message should take.
     * - route undefined -> send message to peer idTarget using RTC
     * - route undefined & idTarget undefined -> send message to all peers using RTC
     * - route HOST -> send message to peer acting as host using RTC, ignoring idTarget
     * - route SERVER -> send message to server using websocket
     * - route VIA_SERVER -> send message to client idTarget via server using websocket
     * - route VIA_SERVER_HOST -> send message to client acting as host via server using websocket, ignoring idTarget
     */
    let ROUTE;
    (function (ROUTE) {
        ROUTE["HOST"] = "toHost";
        ROUTE["SERVER"] = "toServer";
        ROUTE["VIA_SERVER"] = "viaServer";
        ROUTE["VIA_SERVER_HOST"] = "viaServerToHost";
    })(ROUTE = FudgeNet.ROUTE || (FudgeNet.ROUTE = {}));
})(FudgeNet || (FudgeNet = {}));
var FudgeNet;
(function (FudgeNet) {
    let EVENT;
    (function (EVENT) {
        EVENT["CONNECTION_OPENED"] = "open";
        EVENT["CONNECTION_CLOSED"] = "close";
        EVENT["ERROR"] = "error";
        EVENT["MESSAGE_RECEIVED"] = "message";
    })(EVENT = FudgeNet.EVENT || (FudgeNet.EVENT = {}));
    // More info from here https://developer.mozilla.org/en-US/docs/Web/API/RTCConfiguration
    // tslint:disable-next-line: typedef
    FudgeNet.configuration = {
        iceServers: [
            // { urls: "stun:stun2.1.google.com:19302" }
            // { urls: "stun:stun.example.com" }
            { urls: "stun:stun.l.google.com:19302" }
            // { urls: "turn:0.peerjs.com:3478", username: "peerjs", credential: "peerjsp" }
            // {
            //   urls: "turn:192.158.29.39:3478?transport=udp",
            //   credential: "JZEOEt2V3Qb0y27GRntt2u2PAYA=",
            //   username: "28224511:1379330808"
            // }
            // { urls: "stun:relay.backups.cz" },
            // {
            //   urls: "turn:relay.backups.cz",
            //   credential: "webrtc",
            //   username: "webrtc"
            // },
            // {
            //   urls: "turn:relay.backups.cz?transport=tcp",
            //   credential: "webrtc",
            //   username: "webrtc"
            // }
            // {
            //   urls: "stun:stun.stunprotocol.org"
            // }
            // {
            //   urls: "turn:numb.viagenie.ca",
            //   credential: "muazkh",
            //   username: "webrtc@live.com"
            // }
        ]
    };
    /**
     * Manages a single rtc peer-to-peer connection with multiple channels.
     * {@link FudgeNet.Message}s are passed on from the client using this connection
     * for further processing by some observer. Instances of this class are
     * used internally by the {@link FudgeClient} and should not be used otherwise.
     * @author Jirka Dell'Oro-Friedl, HFU, 2021
     */
    // TODO: use extension instead of decorator pattern
    class Rtc extends RTCPeerConnection {
        dataChannel;
        // TODO: use mediaStream in the future? 
        mediaStream;
        constructor() {
            super(FudgeNet.configuration);
            this.addEventListener("signalingstatechange", (_event) => this.logState("Signaling state change", _event));
            this.addEventListener("connectionstatechange", (_event) => this.logState("Connection state change", _event));
        }
        setupDataChannel = (_client, _idRemote) => {
            let newDataChannel = this.createDataChannel(_client.id + "->" + _idRemote /* , { negotiated: true, id: 0 } */);
            console.warn("Created data channel");
            this.addDataChannel(_client, newDataChannel);
        };
        addDataChannel = (_client, _dataChannel) => {
            console.warn("AddDataChannel", _dataChannel.id, _dataChannel.label);
            this.dataChannel = _dataChannel;
            this.dataChannel.addEventListener(EVENT.CONNECTION_OPENED, dispatchRtcEvent);
            this.dataChannel.addEventListener(EVENT.CONNECTION_CLOSED, dispatchRtcEvent);
            this.dataChannel.addEventListener(EVENT.MESSAGE_RECEIVED, _client.hndMessage);
            function dispatchRtcEvent(_event) {
                _client.dispatchEvent(new CustomEvent(EVENT.MESSAGE_RECEIVED, { detail: _event }));
            }
        };
        send = (_message) => {
            if (this.dataChannel && this.dataChannel.readyState == "open")
                this.dataChannel.send(_message);
            else {
                // console.warn(`Can't send message on ${this.dataChannel?.id}, status ${this.dataChannel?.readyState}, message ${_message}`);
            }
        };
        logState = (_type, _event) => {
            let target = _event.target;
            let state = { type: _type, connection: target.connectionState, iceState: target.iceConnectionState, iceGather: target.iceGatheringState };
            console.table(state);
        };
    }
    FudgeNet.Rtc = Rtc;
})(FudgeNet || (FudgeNet = {}));
///<reference path="../Message.ts"/>
///<reference path="./RtcConnection.ts"/>
///<reference path="../../../Core/Build/FudgeCore.d.ts"/>
var FudgeNet;
///<reference path="../Message.ts"/>
///<reference path="./RtcConnection.ts"/>
///<reference path="../../../Core/Build/FudgeCore.d.ts"/>
(function (FudgeNet) {
    var ƒ = FudgeCore;
    /**
     * Manages a websocket connection to a FudgeServer and multiple rtc-connections to other FudgeClients.
     * Processes messages from in the format {@link FudgeNet.Message} according to the controlling
     * fields {@link FudgeNet.ROUTE} and {@link FudgeNet.COMMAND}.
     * @author Falco Böhnke, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2021
     */
    class FudgeClient extends EventTarget {
        id;
        name;
        urlServer;
        socket;
        peers = {};
        // TODO: examine, if server should know about connected peers and send this information also
        clientsInfoFromServer = {};
        idHost;
        constructor() {
            super();
        }
        /**
         * Tries to connect to the server at the given url and installs the appropriate listeners
         */
        connectToServer = (_uri = "ws://localhost:8080") => {
            this.urlServer = _uri;
            this.socket = new WebSocket(_uri);
            this.addWebSocketEventListeners();
        };
        /**
         * Tries to publish a human readable name for this client. Identification still solely by `id`
         */
        loginToServer = (_name) => {
            try {
                let message = {
                    command: FudgeNet.COMMAND.LOGIN_REQUEST, route: FudgeNet.ROUTE.SERVER, content: { name: _name }
                };
                this.dispatch(message);
            }
            catch (error) {
                console.info("Unexpected error: Sending Login Request", error);
            }
        };
        /**
         * Tries to connect to another client with the given id via rtc
         */
        connectToPeer = (_idPeer) => {
            if (_idPeer == this.id || this.peers[_idPeer]) // don't connect to self or already connected peers
                return;
            if (this.peers[_idPeer])
                ƒ.Debug.warn("Peers already connected, ignoring request", this.id, _idPeer);
            else
                this.cRstartNegotiation(_idPeer);
        };
        connectPeers(_ids) {
            for (let id of _ids) {
                this.connectToPeer(id);
            }
        }
        /**
         * Tries to disconnect the peer given with id
         */
        disconnectPeer(_idRemote) {
            let peer = this.peers[_idRemote];
            if (!peer)
                return;
            peer.close();
            delete this.peers[_idRemote];
            console.log("Deleted peer", _idRemote, "remaining", this.peers);
        }
        /**
         * Disconnect all peers
         */
        disconnectPeers(_ids) {
            if (_ids) {
                for (let id of _ids)
                    this.disconnectPeer(id);
                return;
            }
            // no ids specified, disconnect all
            for (let id in this.peers)
                this.peers[id].close();
            this.peers = {};
        }
        /**
         * Dispatches a {@link FudgeNet.Message} to the server, a specific client or all
         * according to {@link FudgeNet.ROUTE} and `idTarget`
         */
        dispatch(_message) {
            _message.timeSender = Date.now();
            _message.idSource = this.id;
            let message = JSON.stringify(_message);
            try {
                if (_message.route == FudgeNet.ROUTE.HOST) {
                    // to host via rtc
                    this.sendToPeer(this.idHost, message);
                }
                else if (_message.route) {
                    // other routes go via or to the server
                    this.socket.send(message);
                }
                else {
                    // send via RTC to specific peer (if idTarget set) or all peers (if not set)
                    if (_message.idTarget)
                        this.sendToPeer(_message.idTarget, message);
                    else
                        this.sendToAllPeers(message);
                }
            }
            catch (_error) {
                console.log(_error);
            }
        }
        /**
         * Sends out a disconnect message to all peers, disconnects from all peers and sends a CREATE_MESH-command to the server,
         * to establish RTC-peer-connections between all clients
         */
        createMesh() {
            this.dispatch({ command: FudgeNet.COMMAND.DISCONNECT_PEERS });
            this.disconnectPeers();
            this.dispatch({ command: FudgeNet.COMMAND.CREATE_MESH, route: FudgeNet.ROUTE.SERVER });
        }
        /**
         * Sends out a disconnect message to all peers, disconnects from all peers and sends a CONNECT_HOST-command to the server,
         * to establish RTC-peer-connections between this client and all others, making this the host
         */
        becomeHost() {
            this.dispatch({ command: FudgeNet.COMMAND.DISCONNECT_PEERS });
            this.disconnectPeers();
            console.log("createHost", this.id);
            this.dispatch({ command: FudgeNet.COMMAND.CONNECT_HOST, route: FudgeNet.ROUTE.SERVER });
        }
        hndMessage = (_event) => {
            let message = JSON.parse(_event.data);
            // if (message.command != FudgeNet.COMMAND.SERVER_HEARTBEAT && message.command != FudgeNet.COMMAND.CLIENT_HEARTBEAT)
            // console.log(_event.timeStamp, message);
            //tslint:disable-next-line: no-any
            switch (message.command) {
                case FudgeNet.COMMAND.ASSIGN_ID:
                    console.info("ID received", (message.idTarget));
                    this.assignIdAndSendConfirmation(message.idTarget);
                    break;
                case FudgeNet.COMMAND.LOGIN_RESPONSE:
                    this.loginValidAddUser(message.idSource, message.content?.success, message.content?.name);
                    break;
                case FudgeNet.COMMAND.RTC_OFFER:
                    this.cEreceiveOffer(message);
                    break;
                case FudgeNet.COMMAND.RTC_ANSWER:
                    this.cRreceiveAnswer(message);
                    break;
                case FudgeNet.COMMAND.ICE_CANDIDATE:
                    this.cEaddIceCandidate(_event, message);
                    break;
                case FudgeNet.COMMAND.CONNECT_PEERS:
                    this.connectPeers(message.content?.peers);
                    break;
                case FudgeNet.COMMAND.DISCONNECT_PEERS:
                    let ids = message.content?.peers;
                    this.disconnectPeers(ids);
                    break;
                case FudgeNet.COMMAND.SERVER_HEARTBEAT:
                    //@ts-ignore
                    this.clientsInfoFromServer = message.content;
                    let host;
                    for (let id in this.clientsInfoFromServer)
                        if (this.clientsInfoFromServer[id].isHost)
                            host = id;
                    if (host != this.idHost) {
                        this.idHost = host;
                        console.log("New host", host);
                    }
                    break;
            }
            // Dispatch a new event with the same information a programm using this client can react to
            this.dispatchEvent(new MessageEvent(_event.type, _event));
        };
        // ----------------------
        sendToPeer = (_idPeer, _message) => {
            this.peers[_idPeer].send(_message);
        };
        sendToAllPeers = (_message) => {
            for (let idPeer in this.peers) {
                this.sendToPeer(idPeer, _message);
            }
        };
        addWebSocketEventListeners = () => {
            try {
                this.socket.addEventListener(FudgeNet.EVENT.CONNECTION_OPENED, (_connOpen) => {
                    console.info("Connected to the signaling server", _connOpen);
                });
                this.socket.addEventListener(FudgeNet.EVENT.ERROR, (_err) => {
                    console.error(_err);
                });
                this.socket.addEventListener(FudgeNet.EVENT.MESSAGE_RECEIVED, (_receivedMessage) => {
                    this.hndMessage(_receivedMessage);
                });
            }
            catch (error) {
                console.info("Unexpected Error: Adding websocket Eventlistener", error);
            }
        };
        loginValidAddUser = (_assignedId, _success, _name) => {
            if (_success) {
                this.name = _name;
                console.info("Logged in to server as: " + this.name, this.id);
            }
            else {
                console.info("Login failed, username taken", this.name, this.id);
            }
        };
        assignIdAndSendConfirmation = (_id) => {
            try {
                if (!_id)
                    throw (new Error("id undefined"));
                this.id = _id;
                // this.sendToServer(new Messages.IdAssigned(_id));
                let message = { command: FudgeNet.COMMAND.ASSIGN_ID, route: FudgeNet.ROUTE.SERVER };
                this.dispatch(message);
            }
            catch (error) {
                console.info("Unexpected Error: Sending ID Confirmation", error);
            }
        };
        //#region RTC-Negotiation
        // cR = caller
        /**
         * Create a new Rtc-Object, install listeners to it and create a data channel
         */
        cRstartNegotiation = async (_idRemote) => {
            let rtc = new FudgeNet.Rtc();
            this.peers[_idRemote] = rtc;
            rtc.addEventListener("negotiationneeded", async (_event) => this.cRsendOffer(_idRemote));
            rtc.addEventListener("icecandidate", (_event) => this.cRsendIceCandidates(_event, _idRemote));
            rtc.addEventListener("icegatheringstatechange", (_event) => {
                console.log("ICE-state", rtc.iceGatheringState);
            });
            // fires the negotiationneeded-event
            rtc.setupDataChannel(this, _idRemote);
            // this.cRsendOffer(_idRemote);
            // rtc.restartIce();
        };
        /**
         * Start negotiation by sending an offer with the local description of the connection via the signalling server
         */
        cRsendOffer = async (_idRemote) => {
            let rtc = this.peers[_idRemote];
            let localDescription = await rtc.createOffer({ iceRestart: true });
            await rtc.setLocalDescription(localDescription);
            const offerMessage = {
                route: FudgeNet.ROUTE.SERVER, command: FudgeNet.COMMAND.RTC_OFFER, idTarget: _idRemote, content: { offer: rtc.localDescription }
            };
            this.dispatch(offerMessage);
            console.info("Caller: send offer, expected 'have-local-offer', got:  ", this.peers[_idRemote].signalingState);
        };
        // cE = callee
        /**
         * Callee receives offer, creates a peerConnection on its side, sets the remote description and its own local description,
         * installs a datachannel-event on the connection and sends its local description back to the caller as answer to the offer via the server
         */
        cEreceiveOffer = async (_message) => {
            console.info("Callee: offer received, create connection", _message);
            let rtc = (this.peers[_message.idSource] = new FudgeNet.Rtc());
            rtc.addEventListener("datachannel", (_event) => this.cEestablishConnection(_event, this.peers[_message.idSource]));
            await rtc.setRemoteDescription(new RTCSessionDescription(_message.content?.offer));
            await rtc.setLocalDescription();
            // rtc.setupDataChannel(this, _message.idSource!);
            const answerMessage = {
                route: FudgeNet.ROUTE.SERVER, command: FudgeNet.COMMAND.RTC_ANSWER, idTarget: _message.idSource, content: { answer: rtc.localDescription }
            };
            console.info("Callee: send answer to server ", answerMessage);
            this.dispatch(answerMessage);
            console.info("Callee: remote description set, expected 'stable', got:  ", rtc.signalingState);
        };
        /**
         * Caller receives the answer and sets the remote description on its side. The first part of the negotiation is done.
         */
        cRreceiveAnswer = async (_message) => {
            console.info("Caller: received answer, create data channel ", _message);
            let rtc = this.peers[_message.idSource];
            await rtc.setRemoteDescription(_message.content?.answer);
            // if (!rtc.dataChannel)
            //   rtc.setupDataChannel(this, _message.idSource!);
            // else
            // console.warn("Datachannel reuse: ", rtc.dataChannel!.id, rtc.dataChannel!.label);
        };
        /**
         * Caller starts collecting ICE-candidates and calls this function for each candidate found,
         * which sends the candidate info to callee via the server
         */
        cRsendIceCandidates = async (_event, _idRemote) => {
            if (!_event.candidate)
                return;
            let pc = _event.currentTarget;
            console.info("Caller: send ICECandidates to server", _event.candidate);
            let message = {
                route: FudgeNet.ROUTE.SERVER, command: FudgeNet.COMMAND.ICE_CANDIDATE, idTarget: _idRemote, content: { candidate: _event.candidate, states: [pc.connectionState, pc.iceConnectionState, pc.iceGatheringState] }
            };
            this.dispatch(message);
        };
        /**
         * Callee receives the info about the ice-candidate and adds it to the connection
         */
        cEaddIceCandidate = async (_event, _message) => {
            console.info("Callee: try to add candidate to peer connection", _message.content?.candidate);
            await this.peers[_message.idSource].addIceCandidate(_message.content?.candidate);
        };
        cEestablishConnection = (_event, _peer) => {
            console.info("Callee: establish channel on connection", _event.channel);
            if (_event.channel) {
                _peer.addDataChannel(this, _event.channel);
            }
            else {
                console.error("Unexpected Error: RemoteDatachannel");
            }
        };
    }
    FudgeNet.FudgeClient = FudgeClient;
})(FudgeNet || (FudgeNet = {}));
//# sourceMappingURL=FudgeClient.js.map