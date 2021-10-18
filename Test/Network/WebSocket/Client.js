var ClientWebSocket;
(function (ClientWebSocket) {
    //@ts-ignore
    const client = new FudgeNetwork.ClientManagerWebSocketOnly();
    console.log(client);
    client.connectToSignalingServer();
})(ClientWebSocket || (ClientWebSocket = {}));
//# sourceMappingURL=Client.js.map