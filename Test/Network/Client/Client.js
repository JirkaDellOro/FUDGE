///<reference path="../../../Network/Build/Client/FudgeClient.d.ts"/>
var ClientTest;
///<reference path="../../../Network/Build/Client/FudgeClient.d.ts"/>
(function (ClientTest) {
    window.addEventListener("load", start);
    async function start(_event) {
        // setTable();
        let client = new FudgeClient.FudgeClient();
        console.log(client);
        client.connectToSignalingServer("ws://localhost:8080");
        await delay(1000);
        client.createLoginRequestAndSendToServer("Test");
        client.webSocketConnectionToSignalingServer.addEventListener("receive", receiveTCP);
    }
    function delay(_milisec) {
        return new Promise(resolve => {
            setTimeout(() => { resolve(); }, _milisec);
        });
    }
    async function receiveTCP(_event) {
        if (_event.detail.messageType == Messages.MESSAGE_TYPE.SERVER_HEARTBEAT) {
            let message = _event.detail;
            // carefull, parsing yields simple objects with matching structure, not real clients....
            let clients = JSON.parse(message.messageData);
            setTable(clients);
        }
    }
    function setTable(_clients) {
        // console.log(_clients);
        let table = document.querySelector("table");
        let html = "<tr><td></td>";
        for (let client = 0; client < _clients.length; client++)
            html += `<td>${client}</td>`;
        html += `<td>Server</td></tr>`;
        for (let client = 0; client < _clients.length; client++)
            html += `<tr><td>${client}</td></tr>`;
        table.innerHTML = html;
    }
})(ClientTest || (ClientTest = {}));
//# sourceMappingURL=Client.js.map