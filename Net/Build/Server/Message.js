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
module.exports = { FudgeNet: FudgeNet };
