///<reference path="../../../Network/Build/Client/FudgeClient.d.ts"/>
var ClientTest;
///<reference path="../../../Network/Build/Client/FudgeClient.d.ts"/>
(function (ClientTest) {
    var ƒClient = FudgeClient.FudgeClient;
    let client = new ƒClient();
    let clients = [];
    window.addEventListener("load", start);
    async function start(_event) {
        document.forms[0].querySelector("button#connect").addEventListener("click", connectToServer);
        document.forms[0].querySelector("button#login").addEventListener("click", loginToServer);
    }
    async function connectToServer(_event) {
        let domServer = document.forms[0].querySelector("input[name=server");
        try {
            client.connectToSignalingServer(domServer.value);
            await delay(1000);
            document.forms[0].querySelector("button#login").removeAttribute("disabled");
            client.wsServer.addEventListener("receive", receiveTCP);
        }
        catch (_error) {
            console.log(_error);
            console.log("Make sure, FudgeServer is running and accessable");
        }
    }
    async function loginToServer(_event) {
        let domLogin = document.forms[0].querySelector("input[name=login");
        client.createLoginRequestAndSendToServer(domLogin.value);
    }
    function delay(_milisec) {
        return new Promise(resolve => {
            setTimeout(() => { resolve(); }, _milisec);
        });
    }
    function proposeName() {
        {
            // search for a free number i to use for the proposal of the name "Client" + i
            let domLogin = document.forms[0].querySelector("input[name=login");
            if (document.activeElement == domLogin)
                return; // don't interfere when user's at the element
            for (let i = 0; clients.find(_client => _client.name == "Client-" + i); i++)
                domLogin.value = "Client-" + (i + 1);
        }
    }
    async function receiveTCP(_event) {
        if (_event.detail.messageType == Messages.MESSAGE_TYPE.SERVER_HEARTBEAT) {
            let message = _event.detail;
            // carefull, parsing yields simple objects with matching structure, not real clients....
            clients = JSON.parse(message.messageData);
            if (client.name == "")
                proposeName();
            setTable(clients);
        }
    }
    function setTable(_clients) {
        // console.log(_clients);
        let table = document.querySelector("table");
        let html = "<tr><th>login</th><th>id</th><th>#</th>";
        let count = 0;
        for (let client of _clients)
            html += `<th>${count++}</th>`;
        html += `<th>Server</th></tr>`;
        count = 0;
        for (let client of _clients) {
            html += `<tr><td>${client.name}</td><td>${client.id}</td><td>${count++}</td>`;
            for (let i = 0; i < _clients.length; i++) {
                html += `<td><span>W</span><span>R</span></td>`;
            }
            html += `<td><span style="background-color: white;">W</span></td></tr>`;
        }
        table.innerHTML = html;
    }
})(ClientTest || (ClientTest = {}));
//# sourceMappingURL=Client.js.map