///<reference path="../../../Network/Build/Client/FudgeClient.d.ts"/>
var ClientTest;
///<reference path="../../../Network/Build/Client/FudgeClient.d.ts"/>
(function (ClientTest) {
    var ƒ = FudgeCore;
    var ƒClient = FudgeClient.FudgeClient;
    ƒ.Debug.setFilter(ƒ.DebugConsole, ƒ.DEBUG_FILTER.ALL);
    let client = new ƒClient();
    let clients = [];
    window.addEventListener("load", start);
    async function start(_event) {
        document.forms[0].querySelector("button#connect").addEventListener("click", connectToServer);
        document.forms[0].querySelector("button#login").addEventListener("click", loginToServer);
        document.querySelector("table").addEventListener("click", createStructure);
        setTable(clients);
    }
    async function connectToServer(_event) {
        let domServer = document.forms[0].querySelector("input[name=server");
        try {
            client.connectToServer(domServer.value);
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
            for (let i = 0; clients.find(_client => _client.name == "Client-" + i); i++)
                domLogin.value = "Client-" + (i + 1);
        }
    }
    async function receiveTCP(_event) {
        switch (_event.detail.messageType) {
            case Messages.MESSAGE_TYPE.SERVER_HEARTBEAT:
                {
                    let message = _event.detail;
                    // carefull, parsing yields simple objects with matching structure, not real clients....
                    clients = JSON.parse(message.messageData);
                    if (client.name == "")
                        proposeName();
                    setTable(clients);
                    if (client.remoteEventPeerDataChannel)
                        client.sendToPeer("Test");
                }
                break;
            case Messages.MESSAGE_TYPE.CLIENT_TO_SERVER_MESSAGE:
                {
                    console.log("Message received", _event.detail);
                    let message = _event.detail;
                    if (message.messageData == Messages.SERVER_COMMAND.CREATE_MESH)
                        createRtcConnectionToAllClients();
                }
                break;
        }
    }
    function setTable(_clients) {
        // console.log(_clients);
        let table = document.querySelector("table");
        let html = `<tr><th><button type="button">Mesh</button></th><th>login</th><th>id</th><th>#</th>`;
        let count = 0;
        for (let client of _clients)
            html += `<th>${count++}</th>`;
        html += `<th>Server</th></tr>`;
        count = 0;
        for (let client of _clients) {
            html += `<tr><td><button type="button" id="${client.id}">Host</button></td><td>${client.name}</td><td>${client.id}</td><td>${count++}</td>`;
            for (let i = 0; i < _clients.length; i++) {
                html += `<td><span>R</span></td>`;
            }
            html += `<td><span style="background-color: white;">W</span></td></tr>`;
        }
        table.innerHTML = html;
    }
    function createStructure(_event) {
        let button = _event.target;
        switch (button.textContent) {
            case "Mesh":
                console.log("createMesh");
                createMesh();
                break;
            case "Host":
                console.log("createHost", button.id);
                break;
        }
    }
    function createMesh() {
        client.sendToServer(new Messages.ToServer(client.id, Messages.SERVER_COMMAND.CREATE_MESH, client.name));
    }
    function createRtcConnectionToAllClients() {
        console.log("Connect all clients");
        for (let remote of clients) {
            if (client.id == remote.id || client.name != "Client-0")
                continue;
            client.connectToPeer(remote.id);
            client.addEventListener("receive", hndPeerMessage);
        }
    }
    function hndPeerMessage(_message) {
        console.log("Peer Message received", _message.detail);
    }
})(ClientTest || (ClientTest = {}));
//# sourceMappingURL=Client.js.map