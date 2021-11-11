"use strict";
var FudgeNet;
(function (FudgeNet) {
    let COMMAND;
    (function (COMMAND) {
        COMMAND["UNDEFINED"] = "undefined";
        COMMAND["ERROR"] = "error";
        /** sent from server to assign an id for the connection and reconfirmed by the client. idTarget is used to carry the id  */
        COMMAND["ASSIGN_ID"] = "assignId";
        COMMAND["LOGIN_REQUEST"] = "loginRequest";
        COMMAND["LOGIN_RESPONSE"] = "loginResponse";
        COMMAND["SERVER_HEARTBEAT"] = "serverHeartbeat";
        COMMAND["CLIENT_HEARTBEAT"] = "clientHeartbeat";
        COMMAND["RTC_OFFER"] = "rtcOffer";
        COMMAND["RTC_ANSWER"] = "rtcAnswer";
        COMMAND["ICE_CANDIDATE"] = "rtcCandidate";
        COMMAND["DISCONNECT_CLIENT"] = "disconnect_client";
        COMMAND["CREATE_MESH"] = "createMesh";
        COMMAND["CONNECT_HOST"] = "connectHost";
        COMMAND["CONNECT_PEERS"] = "connectPeers";
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
module.exports = {FudgeNet: FudgeNet}; 
