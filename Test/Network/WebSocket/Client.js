var ClientWebSocket;
(function (ClientWebSocket) {
    window.addEventListener("load", start);
    async function start(_event) {
        let name = prompt("Enter a login name");
        //@ts-ignore
        const client = new FudgeNetwork.ClientManagerWebSocketOnly();
        //@ts-ignore
        const messageTypes = FudgeNetwork.MESSAGE_TYPE;
        console.log("Create", client);
        await client.connectToSignalingServer();
        await delay(1000);
        console.log("Connected");
        client.checkChosenUsernameAndCreateLoginRequest(name);
        console.log("Username checked");
        // let messageToSend: ƒ.General = new client.NetworkMessageMessageToServer(client.getLocalClientId(), "Hallo", client.localUserName);
        // client.sendTextMessageToSignalingServer(messageToSend);
        client.sendMessageToSignalingServer({
            messageType: messageTypes.CLIENT_TO_SERVER_MESSAGE, originatorId: client.getLocalClientId,
            originatorUserName: name, messageData: "Hallo"
        });
        function delay(_milisec) {
            return new Promise(resolve => {
                setTimeout(() => { resolve(); }, _milisec);
            });
        }
    }
})(ClientWebSocket || (ClientWebSocket = {}));
//# sourceMappingURL=Client.js.map