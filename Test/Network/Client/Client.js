var ClientWebSocket;
(function (ClientWebSocket) {
    window.addEventListener("load", start);
    async function start(_event) {
        let settings = JSON.parse("{" + document.head.querySelector("meta[settings").getAttribute("settings") + "}");
        console.log(settings);
        let domServer = document.forms[0].querySelector("input[name=server");
        let domLogin = document.forms[0].querySelector("input[name=login");
        document.forms[1].querySelector("input#partner").setAttribute("value", settings.partner);
        domServer.setAttribute("value", settings.server);
        domLogin.setAttribute("value", settings.login);
        document.forms[1].querySelector("button#login").addEventListener("click", login);
        document.forms[1].querySelector("button#peer").addEventListener("click", connectToPeer);
        document.forms[2].querySelector("button#sendTCP").addEventListener("click", sendTCP);
        document.forms[2].querySelector("button#sendRTC").addEventListener("click", sendRTC);
        let client;
        const messageTypes = FudgeNetwork.MESSAGE_TYPE;
        async function login() {
            let formData = new FormData(document.forms[1]);
            let connectionType = formData.get("type")?.toString();
            console.log(`%c${connectionType}`, "color:blue; font-size: large");
            switch (connectionType) {
                case "WebSocket":
                    client = new FudgeNetwork.ClientManagerWebSocketOnly();
                    document.forms[2].querySelector("button#sendTCP").removeAttribute("disabled");
                    break;
                case "SinglePeer":
                    client = new FudgeNetwork.ClientManagerSinglePeer();
                    document.forms[1].querySelector("button#peer").removeAttribute("disabled");
                    document.forms[2].querySelector("button#sendRTC").removeAttribute("disabled");
                    client.ownPeerConnection.addEventListener("receive", receiveRTC);
                    // this.ownPeerConnection.dispatchEvent(new CustomEvent("remoteConnected", {detail: this}));
                    break;
                default:
                    console.error("Select a connection type!");
                    return;
            }
            console.log("Create", client);
            await client.connectToSignalingServer(domServer.value);
            await delay(1000); // replace with a signal indicating connection
            console.log("Logged in");
            client.checkChosenUsernameAndCreateLoginRequest(domLogin.value);
            console.log("Username checked", domLogin.value);
            if (connectionType == "WebSocket")
                client.webSocketConnectionToSignalingServer.addEventListener("receive", receiveTCP);
        }
        async function connectToPeer(_event) {
            let domPartner = document.forms[1].querySelector("input#partner");
            client.checkUsernameToConnectToAndInitiateConnection(domPartner.value);
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
        async function receiveRTC(_event) {
            let domReceive = document.forms[2].querySelector("textarea#receivedRTC");
            domReceive.value += _event.detail.originatorUserName + ": " + _event.detail.messageData + "\n";
        }
        async function receiveTCP(_event) {
            let domReceive = document.forms[2].querySelector("textarea#receivedTCP");
            domReceive.value += _event.detail.originatorUserName + ": " + _event.detail.messageData + "\n";
        }
        function delay(_milisec) {
            return new Promise(resolve => {
                setTimeout(() => { resolve(); }, _milisec);
            });
        }
    }
})(ClientWebSocket || (ClientWebSocket = {}));
//# sourceMappingURL=Client.js.map