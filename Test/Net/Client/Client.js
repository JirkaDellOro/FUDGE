///<reference path="../../../Net/Build/Client/FudgeClient.d.ts"/>
var ClientTest;
///<reference path="../../../Net/Build/Client/FudgeClient.d.ts"/>
(function (ClientTest) {
    var ƒ = FudgeCore;
    var ƒClient = FudgeNet.FudgeClient;
    ƒ.Debug.setFilter(ƒ.DebugConsole, ƒ.DEBUG_FILTER.ALL);
    // Create a FudgeClient for this browser tab
    let client = new ƒClient();
    // keep a list of known clients, updated with information from the server
    let clientsKnown = {};
    window.addEventListener("load", start);
    async function start(_event) {
        document.forms[0].querySelector("button#connect").addEventListener("click", connectToServer);
        document.forms[0].querySelector("button#rename").addEventListener("click", rename);
        document.forms[0].querySelector("button#mesh").addEventListener("click", structurePeers);
        document.forms[0].querySelector("button#host").addEventListener("click", structurePeers);
        document.forms[0].querySelector("button#disconnect").addEventListener("click", structurePeers);
        document.forms[0].querySelector("button#reset").addEventListener("click", structurePeers);
        document.forms[1].querySelector("fieldset").addEventListener("click", sendMessage);
        createTable();
    }
    async function connectToServer(_event) {
        let domServer = document.forms[0].querySelector("input[name=server");
        try {
            // connect to a server with the given url
            client.connectToServer(domServer.value);
            await delay(1000);
            // document.forms[0].querySelector("button#login").removeAttribute("disabled");
            document.forms[0].querySelector("button#mesh").removeAttribute("disabled");
            document.forms[0].querySelector("button#host").removeAttribute("disabled");
            document.forms[0].querySelector("input#id").value = client.id;
            // install an event listener to be called when a message comes in
            client.addEventListener(FudgeNet.EVENT.MESSAGE_RECEIVED, receiveMessage);
        }
        catch (_error) {
            console.log(_error);
            console.log("Make sure, FudgeServer is running and accessable");
        }
    }
    async function rename(_event) {
        let domProposeName = document.forms[0].querySelector("input[name=proposal]");
        let domName = document.forms[0].querySelector("input[name=name]");
        domName.value = domProposeName.value;
        // associate a readable name with this client id
        client.loginToServer(domName.value);
    }
    async function receiveMessage(_event) {
        if (_event instanceof MessageEvent) {
            let message = JSON.parse(_event.data);
            if (message.command != FudgeNet.COMMAND.SERVER_HEARTBEAT && message.command != FudgeNet.COMMAND.CLIENT_HEARTBEAT)
                showMessage(message);
            switch (message.command) {
                case FudgeNet.COMMAND.SERVER_HEARTBEAT:
                    if (client.name == undefined)
                        proposeName();
                    updateTable();
                    // on each server heartbeat, dispatch this clients heartbeat
                    client.dispatch({ command: FudgeNet.COMMAND.CLIENT_HEARTBEAT });
                    break;
                case FudgeNet.COMMAND.CLIENT_HEARTBEAT:
                    let span = document.querySelector(`#${message.idSource} span`);
                    blink(span);
                    break;
                    break;
                case FudgeNet.COMMAND.DISCONNECT_PEERS:
                    client.disconnectPeers();
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
        let domProposeName = document.forms[0].querySelector("input[name=proposal");
        if (document.activeElement == domProposeName)
            return; // don't interfere when user's at the element
        let i = 0;
        for (; Object.values(client.clientsInfoFromServer).find(_info => _info.name == "Client-" + i); i++)
            ;
        domProposeName.value = "Client-" + i;
    }
    function createTable() {
        let table = document.querySelector("table");
        let html = `<tr><th>&nbsp;</th><th>name</th><th>id</th><th>data</th><th>signal</th><th>connection</th><th>gather</th><th>ice</th></tr>`;
        html += `<tr><td><span>0</span></td><td>Server</td><td>&nbsp;</td><td>&nbsp;</td></tr>`;
        table.innerHTML = html;
    }
    function updateTable() {
        let table = document.querySelector("table");
        let span = document.querySelector(`td>span`); // first cell is server blinker
        blink(span);
        for (let id in clientsKnown)
            if (!client.clientsInfoFromServer[id])
                deleteRow(id);
        // each client keeps information about all clients
        clientsKnown = client.clientsInfoFromServer;
        for (let id in clientsKnown) {
            let name = clientsKnown[id].name;
            let isHost = clientsKnown[id].isHost;
            let peer = client.peers[id];
            let row = table.querySelector(`#${id}`);
            if (row) {
                row.querySelector("td[name=name]").textContent = name + (isHost ? " (HOST)" : "");
                row.querySelector("td[name=data]").textContent = peer?.dataChannel?.readyState;
                row.querySelector("td[name=signal]").textContent = peer?.signalingState;
                row.querySelector("td[name=connection]").textContent = peer?.connectionState;
                row.querySelector("td[name=gather]").textContent = peer?.iceGatheringState;
                row.querySelector("td[name=ice]").textContent = peer?.iceConnectionState;
            }
            else {
                row = document.createElement("tr");
                table.appendChild(row);
                let html;
                html = `<tr id="${id}"><td><span>0</span></td><td name="name">${name}</td><td name="id">${id}</td>`;
                html += `<td name="data"></td>`;
                html += `<td name="signal"></td>`;
                html += `<td name="connection"></td>`;
                html += `<td name="gather"></td>`;
                html += `<td name="ice"></td></tr>`;
                row.outerHTML = html;
            }
        }
    }
    function deleteRow(_id) {
        let table = document.querySelector("table");
        let row = table.querySelector(`tr#${_id}`);
        table.removeChild(row.parentElement);
    }
    function blink(_span) {
        let newSpan = document.createElement("span");
        newSpan.textContent = (parseInt(_span.textContent) + 1).toString().padStart(3, "0");
        _span.parentElement.replaceChild(newSpan, _span);
    }
    function structurePeers(_event) {
        let button = _event.target;
        switch (button.textContent) {
            case "create mesh":
                // creates an RTC-Mesh, where all clients are directly connected to one another
                client.createMesh();
                break;
            case "become host":
                // creates a host structure, where all other clients are connected to this client but not to each other
                client.becomeHost();
                break;
            case "disconnect":
                client.disconnectPeers();
                break;
            default:
                // send a command to dismiss all RTC-connections
                client.dispatch({ command: FudgeNet.COMMAND.DISCONNECT_PEERS, route: FudgeNet.ROUTE.VIA_SERVER });
        }
    }
    function sendMessage(_event) {
        let formdata = new FormData(document.forms[1]);
        let protocol = formdata.get("protocol").toString();
        let message = formdata.get("message").toString();
        let ws = protocol == "ws";
        let receiver = formdata.get("receiver").toString();
        switch (_event.target.id) {
            case "sendServer":
                // send the message to the server only
                client.dispatch({ route: FudgeNet.ROUTE.SERVER, content: { text: message } });
                break;
            case "sendHost":
                // send the message to the host via RTC or TCP
                client.dispatch({ route: ws ? FudgeNet.ROUTE.VIA_SERVER_HOST : FudgeNet.ROUTE.HOST, content: { text: message } });
                break;
            case "sendAll":
                // send the message to all clients (no target specified) via RTC (no route specified) or TCP (route = via server)
                client.dispatch({ route: ws ? FudgeNet.ROUTE.VIA_SERVER : undefined, content: { text: message } });
                break;
            case "sendClient":
                // send the message to a specific client (target specified) via RTC (no route specified) or TCP (route = via server)
                client.dispatch({ route: ws ? FudgeNet.ROUTE.VIA_SERVER : undefined, idTarget: receiver, content: { text: message } });
                break;
        }
    }
    function showMessage(_message) {
        console.table(_message);
        if (_message.command)
            return;
        let received = document.forms[1].querySelector("textarea#received");
        let line = (_message.route || "toPeer") + " > " + _message.idSource + "(" + clientsKnown[_message.idSource].name + "):" + JSON.stringify(_message.content);
        received.value = line + "\n" + received.value;
    }
})(ClientTest || (ClientTest = {}));
//# sourceMappingURL=Client.js.map