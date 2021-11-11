"use strict";
var Messages;
(function (Messages) {
    let NET_COMMAND;
    (function (NET_COMMAND) {
        NET_COMMAND["UNDEFINED"] = "undefined";
        NET_COMMAND["ERROR"] = "error";
        /** sent from server to assign an id for the connection and reconfirmed by the client. idTarget is used to carry the id  */
        NET_COMMAND["ASSIGN_ID"] = "assignId";
        /** sent from server to assign an id for the connection and reconfirmed by the client. idTarget is used to carry the id  */
        NET_COMMAND["LOGIN_REQUEST"] = "loginRequest";
        NET_COMMAND["LOGIN_RESPONSE"] = "loginResponse";
        NET_COMMAND["SERVER_HEARTBEAT"] = "serverHeartbeat";
        NET_COMMAND["CLIENT_HEARTBEAT"] = "clientHeartbeat";
        NET_COMMAND["RTC_OFFER"] = "rtcOffer";
        NET_COMMAND["RTC_ANSWER"] = "rtcAnswer";
        NET_COMMAND["ICE_CANDIDATE"] = "rtcCandidate";
        NET_COMMAND["DISCONNECT_CLIENT"] = "disconnect_client";
        NET_COMMAND["CREATE_MESH"] = "createMesh";
        NET_COMMAND["CONNECT_HOST"] = "connectHost";
        NET_COMMAND["CONNECT_PEERS"] = "connectPeers";
    })(NET_COMMAND = Messages.NET_COMMAND || (Messages.NET_COMMAND = {}));
    /**
     * Defines the route the message should take.
     * - route undefined -> send message to peer idTarget using RTC
     * - route undefined & idTarget undefined -> send message to all peers using RTC
     * - route HOST -> send message to peer acting as host using RTC, ignoring idTarget
     * - route SERVER -> send message to server using websocket
     * - route VIA_SERVER -> send message to client idTarget via server using websocket
     * - route VIA_SERVER_HOST -> send message to client acting as host via server using websocket, ignoring idTarget
     */
    let NET_ROUTE;
    (function (NET_ROUTE) {
        NET_ROUTE["HOST"] = "toHost";
        NET_ROUTE["SERVER"] = "toServer";
        NET_ROUTE["VIA_SERVER"] = "viaServer";
        NET_ROUTE["VIA_SERVER_HOST"] = "viaServerToHost";
    })(NET_ROUTE = Messages.NET_ROUTE || (Messages.NET_ROUTE = {}));
})(Messages || (Messages = {}));
module.exports = {Messages: Messages}; 
