///<reference path="../../../Net/Build/Client/FudgeClient.d.ts"/>
var ClientTest;
///<reference path="../../../Net/Build/Client/FudgeClient.d.ts"/>
(function (ClientTest) {
    var ƒ = FudgeCore;
    var ƒClient = FudgeNet.FudgeClient;
    ƒ.Debug.setFilter(ƒ.DebugConsole, ƒ.DEBUG_FILTER.ALL);
    let client = new ƒClient();
    let clientsKnown = {};
    window.addEventListener("load", start);
    async function start(_event) {
        document.forms[0].querySelector("button#connect").addEventListener("click", connectToServer);
        document.forms[0].querySelector("button#login").addEventListener("click", loginToServer);
        document.forms[0].querySelector("button#mesh").addEventListener("click", createStructure);
        document.forms[0].querySelector("button#host").addEventListener("click", createStructure);
        document.forms[0].querySelector("button#disconnect").addEventListener("click", createStructure);
        document.forms[1].querySelector("fieldset").addEventListener("click", sendMessage);
        createTable();
    }
    async function connectToServer(_event) {
        let domServer = document.forms[0].querySelector("input[name=server");
        try {
            client.connectToServer(domServer.value);
            await delay(1000);
            document.forms[0].querySelector("button#login").removeAttribute("disabled");
            document.forms[0].querySelector("button#mesh").removeAttribute("disabled");
            document.forms[0].querySelector("button#host").removeAttribute("disabled");
            document.forms[0].querySelector("input#id").value = client.id;
            client.addEventListener(FudgeNet.EVENT.MESSAGE_RECEIVED, receiveMessage);
        }
        catch (_error) {
            console.log(_error);
            console.log("Make sure, FudgeServer is running and accessable");
        }
    }
    async function loginToServer(_event) {
        let domLogin = document.forms[0].querySelector("input[name=login");
        client.loginToServer(domLogin.value);
    }
    async function receiveMessage(_event) {
        if (_event instanceof MessageEvent) {
            let message = JSON.parse(_event.data);
            if (message.command != FudgeNet.COMMAND.SERVER_HEARTBEAT && message.command != FudgeNet.COMMAND.CLIENT_HEARTBEAT)
                console.table(message);
            switch (message.command) {
                case FudgeNet.COMMAND.SERVER_HEARTBEAT:
                    if (client.name == undefined)
                        proposeName();
                    updateTable();
                    client.dispatch({ command: FudgeNet.COMMAND.CLIENT_HEARTBEAT });
                    break;
                case FudgeNet.COMMAND.CLIENT_HEARTBEAT:
                    let span = document.querySelector(`#${message.idSource} span`);
                    blink(span);
                    break;
                default:
                    break;
            }
            return;
        }
        else
            console.table(_event);
    }
    function delay(_milisec) {
        return new Promise(resolve => {
            setTimeout(() => { resolve(); }, _milisec);
        });
    }
    function proposeName() {
        // search for a free number i to use for the proposal of the name "Client" + i
        let domLogin = document.forms[0].querySelector("input[name=login");
        if (document.activeElement == domLogin)
            return; // don't interfere when user's at the element
        let i = 0;
        for (; Object.values(client.clientsInfoFromServer).find(_info => _info.name == "Client-" + i); i++)
            ;
        domLogin.value = "Client-" + i;
    }
    function createTable() {
        let table = document.querySelector("table");
        let html = `<tr><th>&nbsp;</th><th>name</th><th>id</th><th>Comment</th></tr>`;
        html += `<tr><td><span>0</span></td><td>Server</td><td>&nbsp;</td><td>&nbsp;</td></tr>`;
        table.innerHTML = html;
    }
    function updateTable() {
        let table = document.querySelector("table");
        let span = document.querySelector(`td>span`); // first cell is server blinker
        blink(span);
        for (let id in clientsKnown)
            if (!client.clientsInfoFromServer[id])
                comment(id, "Disconnected");
        clientsKnown = client.clientsInfoFromServer;
        for (let id in clientsKnown) {
            let name = clientsKnown[id].name;
            let isHost = clientsKnown[id].isHost;
            let row = table.querySelector(`#${id}`);
            if (row) {
                row.querySelector("td[name=name]").textContent = name + (isHost ? " (HOST)" : "");
                row.querySelector("td[name=comment]").textContent = client.peers[id]?.dataChannel?.readyState;
            }
            else {
                row = document.createElement("tr");
                table.appendChild(row);
                row.outerHTML = `<tr id="${id}"><td><span>0</span></td><td name="name">${name}</td><td name="id">${id}</td><td name="comment"></td></tr>`;
            }
        }
    }
    function comment(_id, _comment) {
        let table = document.querySelector("table");
        let cell = table.querySelector(`#${_id}>td[name=comment]`);
        cell.textContent = _comment;
    }
    function blink(_span) {
        let newSpan = document.createElement("span");
        newSpan.textContent = (parseInt(_span.textContent) + 1).toString().padStart(3, "0");
        _span.parentElement.replaceChild(newSpan, _span);
    }
    function createStructure(_event) {
        let button = _event.target;
        switch (button.textContent) {
            case "create mesh":
                client.createMesh();
                break;
            case "become host":
                client.becomeHost();
                break;
            default:
                client.dispatch({ command: FudgeNet.COMMAND.DISCONNECT_PEERS });
                client.disconnectPeers();
                break;
        }
    }
    function sendMessage(_event) {
        let formdata = new FormData(document.forms[1]);
        let message = formdata.get("message").toString();
        let tcp = formdata.get("protocol").toString() == "tcp";
        let receiver = formdata.get("receiver").toString();
        switch (_event.target.id) {
            case "sendServer":
                client.dispatch({ route: FudgeNet.ROUTE.SERVER, content: { text: message } });
                break;
            case "sendHost":
                client.dispatch({ route: tcp ? FudgeNet.ROUTE.VIA_SERVER_HOST : FudgeNet.ROUTE.HOST, content: { text: message } });
                break;
            case "sendAll":
                client.dispatch({ route: tcp ? FudgeNet.ROUTE.VIA_SERVER : undefined, content: { text: message } });
                break;
            case "sendClient":
                client.dispatch({ route: tcp ? FudgeNet.ROUTE.VIA_SERVER : undefined, idTarget: receiver, content: { text: message } });
                break;
        }
    }
})(ClientTest || (ClientTest = {}));
//# sourceMappingURL=Client.js.map