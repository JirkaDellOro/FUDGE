var ClientTest;
(function (ClientTest) {
    window.addEventListener("load", start);
    async function start(_event) {
        let client = new FudgeClient.FudgeClient();
        console.log(client);
        client.connectToSignalingServer("ws://localhost:8080");
    }
})(ClientTest || (ClientTest = {}));
//# sourceMappingURL=Client.js.map