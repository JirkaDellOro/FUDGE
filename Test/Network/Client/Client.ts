///<reference path="../../../Network/Build/Client/FudgeClient.d.ts"/>
namespace ClientTest {
  import ƒ = FudgeCore;
  import ƒClient = FudgeClient.FudgeClient;
  ƒ.Debug.setFilter(ƒ.DebugConsole, ƒ.DEBUG_FILTER.ALL);

  let client: ƒClient = new ƒClient();
  let clients: ƒClient[] = [];
  window.addEventListener("load", start);

  async function start(_event: Event): Promise<void> {
    document.forms[0].querySelector("button#connect").addEventListener("click", connectToServer);
    document.forms[0].querySelector("button#login").addEventListener("click", loginToServer);
    document.querySelector("table").addEventListener("click", createStructure);
    setTable(clients);
  }

  async function connectToServer(_event: Event): Promise<void> {
    let domServer: HTMLInputElement = document.forms[0].querySelector("input[name=server");
    try {
      client.connectToServer(domServer.value);
      await delay(1000);
      document.forms[0].querySelector("button#login").removeAttribute("disabled");
      client.wsServer.addEventListener("receive", receiveTCP);
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

      for (let i: number = 0; clients.find(_client => _client.name == "Client-" + i); i++)
        domLogin.value = "Client-" + (i + 1);
    }
  }

  async function receiveTCP(_event: CustomEvent): Promise<void> {
    switch (_event.detail.messageType) {
      case Messages.MESSAGE_TYPE.SERVER_HEARTBEAT:
        {
          let message: Messages.ServerHeartbeat = <Messages.ServerHeartbeat>_event.detail;
          // carefull, parsing yields simple objects with matching structure, not real clients....
          clients = JSON.parse(message.messageData);

          if (client.name == "")
            proposeName();

          setTable(clients);
        }
        break;
      case Messages.MESSAGE_TYPE.CLIENT_TO_SERVER:
        {
          console.log("Message received", _event.detail);
          let message: Messages.ToServer = <Messages.ToServer>_event.detail;
          if (message.messageData == Messages.SERVER_COMMAND.CREATE_MESH)
            createRtcConnectionToAllClients();
        }
        break;
    }
  }

  function setTable(_clients: ƒClient[]): void {
    // console.log(_clients);
    let table: HTMLTableElement = document.querySelector("table");
    let html: string = `<tr><th><button type="button">Mesh</button></th><th>login</th><th>id</th><th>#</th>`;
    let count: number = 0;
    for (let client of _clients)
      html += `<th>${count++}</th>`;
    html += `<th>Server</th></tr>`;

    count = 0;
    for (let client of _clients) {
      html += `<tr><td><button type="button" id="${client.id}">Host</button></td><td>${client.name}</td><td>${client.id}</td><td>${count++}</td>`;
      for (let i: number = 0; i < _clients.length; i++) {
        html += `<td><span>R</span></td>`;
      }
      html += `<td><span style="background-color: white;">W</span></td></tr>`;
    }

    table.innerHTML = html;
  }

  function createStructure(_event: Event): void {
    let button: HTMLButtonElement = <HTMLButtonElement>_event.target;
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

  function createMesh(): void {
    client.sendToServer(new Messages.ToServer(client.id, Messages.SERVER_COMMAND.CREATE_MESH, client.name));
  }

  function createRtcConnectionToAllClients(): void {
    console.log("Connect all clients");
    for (let remote of clients) {
      if (client.id == remote.id || client.name != "Client-0")
        continue;
      client.connectToPeer(remote.id);
      client.addEventListener("receive", hndPeerMessage);
    }
  }

  function hndPeerMessage(_message: CustomEvent): void {
    console.log("Peer Message received", _message.detail);
  }
}