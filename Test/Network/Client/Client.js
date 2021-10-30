var ClientWebSocket;
(function (ClientWebSocket) {
    window.addEventListener("load", start);
    async function start(_event) {
        let settings = JSON.parse("{" + document.head.querySelector("meta[settings").getAttribute("settings") + "}");
        console.log(settings);
        let domServer = document.forms[0].querySelector("input[name=server");
        let domLogin = document.forms[0].querySelector("input[name=login");
        domServer.setAttribute("value", settings.server);
        domLogin.setAttribute("value", settings.login);
        document.forms[1].querySelector("button#connect").addEventListener("click", connect);
        document.forms[2].querySelector("button#sendTCP").addEventListener("click", sendTCP);
        document.forms[2].querySelector("button#sendRTC").addEventListener("click", sendRTC);
        let client;
        const messageTypes = FudgeNetwork.MESSAGE_TYPE;
        async function connect() {
            let formData = new FormData(document.forms[1]);
            let connectionType = formData.get("type").toString();
            console.log(`%c${connectionType}`, "color:blue; font-size: large");
            switch (connectionType) {
                case "WebSocket":
                    client = new FudgeNetwork.ClientManagerWebSocketOnly();
                    break;
                case "SinglePeer":
                    client = new FudgeNetwork.ClientManagerSinglePeer();
                    break;
            }
            console.log("Create", client);
            await client.connectToSignalingServer(domServer.value);
            await delay(1000); // replace with a signal indicating connection
            console.log("Connected");
            client.checkChosenUsernameAndCreateLoginRequest(domLogin.value);
            console.log("Username checked", domLogin.value);
            // let messageToSend: ƒ.General = new client.NetworkMessageMessageToServer(client.getLocalClientId(), "Hallo", client.localUserName);
            // client.sendTextMessageToSignalingServer(messageToSend);
            if (connectionType == "SinglePeer") {
                let domPartner = document.forms[1].querySelector("input#partner");
                client.checkUsernameToConnectToAndInitiateConnection(domPartner.value);
            }
        }
        async function sendTCP() {
            let domMessage = document.forms[2].querySelector("input#messageTCP");
            client.sendMessageToSignalingServer({
                messageType: messageTypes.CLIENT_TO_SERVER_MESSAGE, originatorId: client.getLocalClientId,
                originatorUserName: domLogin.value, messageData: domMessage.value
            });
        }
        async function sendRTC() {
            let domMessage = document.forms[2].querySelector("input#messageRTC");
            client.sendMessageToSingularPeer(domMessage.value);
        }
        function delay(_milisec) {
            return new Promise(resolve => {
                setTimeout(() => { resolve(); }, _milisec);
            });
        }
    }
})(ClientWebSocket || (ClientWebSocket = {}));
//# sourceMappingURL=Client.js.map