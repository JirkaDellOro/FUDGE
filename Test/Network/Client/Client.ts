///<reference path="../../../Network/Build/Client/FudgeClient.d.ts"/>
namespace ClientTest {
  import ƒ = FudgeCore;
  import ƒClient = FudgeClient.FudgeClient;
  ƒ.Debug.setFilter(ƒ.DebugConsole, ƒ.DEBUG_FILTER.ALL);

  let client: ƒClient = new ƒClient();
  let clients: { [id: string]: ƒClient } = {};
  window.addEventListener("load", start);

  async function start(_event: Event): Promise<void> {
    document.forms[0].querySelector("button#connect").addEventListener("click", connectToServer);
    document.forms[0].querySelector("button#login").addEventListener("click", loginToServer);
    document.forms[0].querySelector("button#mesh").addEventListener("click", createStructure);
    document.forms[0].querySelector("button#host").addEventListener("click", createStructure);
    setTable(clients);
  }

  async function connectToServer(_event: Event): Promise<void> {
    let domServer: HTMLInputElement = document.forms[0].querySelector("input[name=server");
    try {
      client.connectToServer(domServer.value);
      await delay(1000);
      document.forms[0].querySelector("button#login").removeAttribute("disabled");
      document.forms[0].querySelector("button#mesh").removeAttribute("disabled");
      document.forms[0].querySelector("button#host").removeAttribute("disabled");
      (<HTMLInputElement>document.forms[0].querySelector("input#id")).value = client.id;
      client.addEventListener(FudgeClient.EVENT.MESSAGE_RECEIVED, receiveMessage);
    } catch (_error) {
      console.log(_error);
      console.log("Make sure, FudgeServer is running and accessable");
    }
  }

  async function loginToServer(_event: Event): Promise<void> {
    let domLogin: HTMLInputElement = document.forms[0].querySelector("input[name=login");
    client.loginToServer(domLogin.value);
  }

  function delay(_milisec: number): Promise<void> {
    return new Promise(resolve => {
      setTimeout(() => { resolve(); }, _milisec);
    });
  }

  function proposeName(): void {
    {
      // search for a free number i to use for the proposal of the name "Client" + i
      let domLogin: HTMLInputElement = document.forms[0].querySelector("input[name=login");
      if (document.activeElement == domLogin)
        return; // don't interfere when user's at the element

      for (let i: number = 0; Object.values(clients).find(_client => _client.name == "Client-" + i); i++)
        domLogin.value = "Client-" + (i + 1);
    }
  }

  async function receiveMessage(_event: CustomEvent): Promise<void> {
    // console.log("received", _event);
    switch (_event.detail.messageType) {
      case Messages.MESSAGE_TYPE.SERVER_HEARTBEAT:
        {
          let message: Messages.ServerHeartbeat = <Messages.ServerHeartbeat>_event.detail;
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
          console.log("Message client to server received", _event.detail);
          let message: Messages.ToServer = <Messages.ToServer>_event.detail;
          // if (message.messageData == Messages.SERVER_COMMAND.CREATE_MESH)
          //   createRtcConnectionToClients();
        }
        break;
      case Messages.MESSAGE_TYPE.SERVER_TO_CLIENT:
        {
          console.log("Message server to client received", _event.detail);
          let message: object = JSON.parse(_event.detail.messageData);
          if (message["connectPeers"])
            createRtcConnectionToClients(message["connectPeers"]);
        }
        break;
      case Messages.MESSAGE_TYPE.PEER_TO_PEER:
        {
          let blink: HTMLSpanElement = document.querySelector(`#${_event.detail.idSource}`);
          blink.style.backgroundColor = "white";
        }
        break;
      default:
        console.log("Unhandled event", _event);
    }
  }

  function setTable(_clients: { [id: string]: ƒClient }): void {
    let table: HTMLTableElement = document.querySelector("table");
    let html: string = `<tr><th>&nbsp;</th><th>name</th><th>id</th><th>Comment</th></tr>`;

    html += `<tr><td><span style="background-color: white;">&nbsp;</span></td><td>Server</td><td>&nbsp;</td><td>&nbsp;</td></tr>`;

    for (let id in _clients) {
      html += `<tr><td><span id="${id}">&nbsp;</span></td><td>${_clients[id].name}</td><td>${id}</td><td></td></tr>`;
    }

    table.innerHTML = html;
  }

  function createStructure(_event: Event): void {
    let button: HTMLButtonElement = <HTMLButtonElement>_event.target;
    switch (button.textContent) {
      case "create mesh":
        client.sendToServer(new Messages.ToServer(client.id, Messages.SERVER_COMMAND.CREATE_MESH, client.name));
        break;
      case "become host":
        console.log("createHost", button.id);
        client.sendToServer(new Messages.ToServer(client.id, Messages.SERVER_COMMAND.CONNECT_HOST, client.name));
        break;
    }
  }

  function createRtcConnectionToClients(_ids: string[]): void {
    for (let id in clients) {
      if (client.id == id)
        continue;
      console.log("Try to connect", id);
      client.connectToPeer(id);
    }
  }
}