///<reference path="../../../Network/Build/Client/FudgeClient.d.ts"/>
var ClientTest;
///<reference path="../../../Network/Build/Client/FudgeClient.d.ts"/>
(function (ClientTest) {
    var ƒ = FudgeCore;
    var ƒClient = FudgeClient.FudgeClient;
    ƒ.Debug.setFilter(ƒ.DebugConsole, ƒ.DEBUG_FILTER.ALL);
    let client = new ƒClient();
    let clients = {};
    window.addEventListener("load", start);
    async function start(_event) {
        document.forms[0].querySelector("button#connect").addEventListener("click", connectToServer);
        document.forms[0].querySelector("button#login").addEventListener("click", loginToServer);
        document.forms[0].querySelector("button#mesh").addEventListener("click", createStructure);
        document.forms[0].querySelector("button#host").addEventListener("click", createStructure);
        setTable(clients);
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
            client.addEventListener(FudgeClient.EVENT.MESSAGE_RECEIVED, receiveMessage);
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
            for (let i = 0; Object.values(clients).find(_client => _client.name == "Client-" + i); i++)
                domLogin.value = "Client-" + (i + 1);
        }
    }
    async function receiveMessage(_event) {
        if (_event instanceof MessageEvent) {
            let message = JSON.parse(_event.data);
            if (message.command != Messages.NET_COMMAND.SERVER_HEARTBEAT)
                console.table(message);
            switch (message.command) {
                case Messages.NET_COMMAND.SERVER_HEARTBEAT:
                    clients = message.content;
                    if (client.name == "")
                        proposeName();
                    setTable(clients);
                    client.dispatch({ content: { text: "Message from " + client.id + "|" + client.name } });
                    break;
                case Messages.NET_COMMAND.CONNECT_PEERS:
                    createRtcConnectionToClients(message.content.peers);
                    break;
                default:
                    let blink = document.querySelector(`#${message.idSource}`);
                    blink.style.backgroundColor = "white";
            }
            return;
        }
    }
    function setTable(_clients) {
        let table = document.querySelector("table");
        let html = `<tr><th>&nbsp;</th><th>name</th><th>id</th><th>Comment</th></tr>`;
        html += `<tr><td><span style="background-color: white;">&nbsp;</span></td><td>Server</td><td>&nbsp;</td><td>&nbsp;</td></tr>`;
        for (let id in _clients) {
            html += `<tr><td><span id="${id}">&nbsp;</span></td><td>${_clients[id].name}</td><td>${id}</td><td></td></tr>`;
        }
        table.innerHTML = html;
    }
    function createStructure(_event) {
        let button = _event.target;
        switch (button.textContent) {
            case "create mesh":
                // client.sendToServer(new Messages.ToServer(client.id, Messages.SERVER_COMMAND.CREATE_MESH, client.name));
                // let message: Messages.NetMessage = { command: Messages.NET_COMMAND.CREATE_MESH , route: Messages.NET_ROUTE.SERVER};
                client.dispatch({ command: Messages.NET_COMMAND.CREATE_MESH, route: Messages.NET_ROUTE.SERVER });
                break;
            case "become host":
                console.log("createHost", button.id);
                // client.sendToServer(new Messages.NetMessage(client.id, Messages.SERVER_COMMAND.CONNECT_HOST, client.name));
                client.dispatch({ command: Messages.NET_COMMAND.CONNECT_HOST, route: Messages.NET_ROUTE.SERVER });
                break;
        }
    }
    function createRtcConnectionToClients(_ids) {
        for (let id in clients) {
            if (client.id == id)
                continue;
            console.log("Try to connect", id);
            client.connectToPeer(id);
        }
    }
})(ClientTest || (ClientTest = {}));
//# sourceMappingURL=Client.js.map