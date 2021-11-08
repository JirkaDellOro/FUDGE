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
        switch (_event.detail.messageType) {
            case Messages.MESSAGE_TYPE.SERVER_HEARTBEAT:
                {
                    let message = _event.detail;
                    // carefull, parsing yields simple objects with matching structure, not real clients....
                    clients = JSON.parse(message.messageData);
                    if (client.name == "")
                        proposeName();
                    setTable(clients);
                    for (let id in client.peers)
                        client.sendToPeer(id, new Messages.PeerToPeer(client.id, "Message from " + client.id + "|" + client.name));
                }
                break;
            case Messages.MESSAGE_TYPE.CLIENT_TO_SERVER:
                {
                    console.log("Message received", _event.detail);
                    let message = _event.detail;
                    if (message.messageData == Messages.SERVER_COMMAND.CREATE_MESH)
                        createRtcConnectionToAllClients();
                }
                break;
            case Messages.MESSAGE_TYPE.PEER_TO_PEER:
                {
                    let blink = document.querySelector(`#${_event.detail.idSource}`);
                    blink.style.backgroundColor = "white";
                }
                break;
        }
    }
    function setTable(_clients) {
        let table = document.querySelector("table");
        let html = `<tr><th>&nbsp;</th><th>name</th><th>id</th><th>Comment</th></tr>`;
        html += `<tr><td><span style="background-color: white;">&nbsp;</span></td><td>Server</td><td>&nbsp;</td><td>&nbsp;</td></tr>`;
        for (let id in _clients) {
            html += `<tr><td><span id="${id}">&nbsp;</span></td><td>${_clients[id].name}</td><td>${_clients[id].id}</td><td></td></tr>`;
        }
        table.innerHTML = html;
    }
    function createStructure(_event) {
        let button = _event.target;
        switch (button.textContent) {
            case "create mesh":
                console.log("createMesh");
                createMesh();
                break;
            case "become host":
                console.log("createHost", button.id);
                break;
        }
    }
    function createMesh() {
        client.sendToServer(new Messages.ToServer(client.id, Messages.SERVER_COMMAND.CREATE_MESH, client.name));
    }
    function createRtcConnectionToAllClients() {
        console.log("Connect all clients");
        // for (let remote of clients) {
        //   if (client.id == remote.id || client.name != "Client-0")
        //     continue;
        //   client.connectToPeer(remote.id);
        // }
    }
})(ClientTest || (ClientTest = {}));
//# sourceMappingURL=Client.js.map