var ClientWebSocket;
(function (ClientWebSocket) {
    //@ts-ignore
    const client = new FudgeNetwork.ClientManagerWebSocketOnly();
    console.log("Create Client", client);
    client.connectToSignalingServer();
})(ClientWebSocket || (ClientWebSocket = {}));
//# sourceMappingURL=Client.js.map