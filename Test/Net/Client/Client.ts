///<reference path="../../../Net/Build/Client/FudgeClient.d.ts"/>
namespace ClientTest {
  import ƒ = FudgeCore;
  import ƒClient = FudgeNet.FudgeClient;
  ƒ.Debug.setFilter(ƒ.DebugConsole, ƒ.DEBUG_FILTER.ALL);

  // Create a FudgeClient for this browser tab
  let client: ƒClient = new ƒClient();
  // keep a list of known clients, updated with information from the server
  let clientsKnown: { [id: string]: { name?: string; isHost?: boolean; } } = {};

  window.addEventListener("load", start);

  async function start(_event: Event): Promise<void> {
    document.forms[0].querySelector("button#connect").addEventListener("click", connectToServer);
    document.forms[0].querySelector("button#rename").addEventListener("click", rename);
    document.forms[0].querySelector("button#mesh").addEventListener("click", createStructure);
    document.forms[0].querySelector("button#host").addEventListener("click", createStructure);
    document.forms[0].querySelector("button#disconnect").addEventListener("click", createStructure);
    document.forms[1].querySelector("fieldset").addEventListener("click", sendMessage);
    createTable();
  }

  async function connectToServer(_event: Event): Promise<void> {
    let domServer: HTMLInputElement = document.forms[0].querySelector("input[name=server");
    try {
      // connect to a server with the given url
      client.connectToServer(domServer.value);
      await delay(1000);
      // document.forms[0].querySelector("button#login").removeAttribute("disabled");
      document.forms[0].querySelector("button#mesh").removeAttribute("disabled");
      document.forms[0].querySelector("button#host").removeAttribute("disabled");
      (<HTMLInputElement>document.forms[0].querySelector("input#id")).value = client.id;
      // install an event listener to be called when a message comes in
      client.addEventListener(FudgeNet.EVENT.MESSAGE_RECEIVED, receiveMessage);
    } catch (_error) {
      console.log(_error);
      console.log("Make sure, FudgeServer is running and accessable");
    }
  }

  async function rename(_event: Event): Promise<void> {
    let domProposeName: HTMLInputElement = document.forms[0].querySelector("input[name=proposal]");
    let domName: HTMLInputElement = document.forms[0].querySelector("input[name=name]");
    domName.value = domProposeName.value;
    // associate a readable name with this client id
    client.loginToServer(domName.value);
  }

  async function receiveMessage(_event: CustomEvent | MessageEvent): Promise<void> {
    if (_event instanceof MessageEvent) {
      let message: FudgeNet.Message = JSON.parse(_event.data);
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
          let span: HTMLSpanElement = document.querySelector(`#${message.idSource} span`);
          blink(span);
          break;
        default:
          break;
      }
      return;
    } else
      console.table(_event);
  }

  function delay(_milisec: number): Promise<void> {
    return new Promise(resolve => {
      setTimeout(() => { resolve(); }, _milisec);
    });
  }

  function proposeName(): void {
    // search for a free number i to use for the proposal of the name "Client" + i
    let domProposeName: HTMLInputElement = document.forms[0].querySelector("input[name=proposal");
    if (document.activeElement == domProposeName)
      return; // don't interfere when user's at the element

    let i: number = 0;
    for (; Object.values(client.clientsInfoFromServer).find(_info => _info.name == "Client-" + i); i++);
    domProposeName.value = "Client-" + i;
  }

  function createTable(): void {
    let table: HTMLTableElement = document.querySelector("table");
    let html: string = `<tr><th>&nbsp;</th><th>name</th><th>id</th><th>Comment</th></tr>`;
    html += `<tr><td><span>0</span></td><td>Server</td><td>&nbsp;</td><td>&nbsp;</td></tr>`;
    table.innerHTML = html;
  }

  function updateTable(): void {
    let table: HTMLTableElement = document.querySelector("table");
    let span: HTMLSpanElement = document.querySelector(`td>span`); // first cell is server blinker
    blink(span);


    for (let id in clientsKnown)
      if (!client.clientsInfoFromServer[id])
        comment(id, "Disconnected");

    // each client keeps information about all clients
    clientsKnown = client.clientsInfoFromServer;

    for (let id in clientsKnown) {
      let name: string = clientsKnown[id].name;
      let isHost: boolean = clientsKnown[id].isHost;
      let row: HTMLTableRowElement = table.querySelector(`#${id}`);
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

  function comment(_id: string, _comment: string): void {
    let table: HTMLTableElement = document.querySelector("table");
    let cell: HTMLTableCellElement = table.querySelector(`#${_id}>td[name=comment]`);
    cell.textContent = _comment;
  }

  function blink(_span: HTMLSpanElement): void {
    let newSpan: HTMLSpanElement = document.createElement("span");
    newSpan.textContent = (parseInt(_span.textContent) + 1).toString().padStart(3, "0");
    _span.parentElement.replaceChild(newSpan, _span);
  }

  function createStructure(_event: Event): void {
    let button: HTMLButtonElement = <HTMLButtonElement>_event.target;
    switch (button.textContent) {
      case "create mesh":
        // creates an RTC-Mesh, where all clients are directly connected to one another
        client.createMesh();
        break;
      case "become host":
        // creates a host structure, where all other clients are connected to this client but not to each other
        client.becomeHost();
        break;
      default:
        // send a command to dismiss all RTC-connections
        client.dispatch({ command: FudgeNet.COMMAND.DISCONNECT_PEERS });
        client.disconnectPeers();
        break;
    }
  }

  function sendMessage(_event: Event): void {
    let formdata: FormData = new FormData(document.forms[1]);
    let message: string = formdata.get("message").toString();
    let tcp: boolean = formdata.get("protocol").toString() == "tcp";
    let receiver: string = formdata.get("receiver").toString();

    switch ((<HTMLElement>_event.target).id) {
      case "sendServer":
        // send the message to the server only
        client.dispatch({ route: FudgeNet.ROUTE.SERVER, content: { text: message } });
        break;
      case "sendHost":
        // send the message to the host via RTC or TCP
        client.dispatch({ route: tcp ? FudgeNet.ROUTE.VIA_SERVER_HOST : FudgeNet.ROUTE.HOST, content: { text: message } });
        break;
      case "sendAll":
        // send the message to all clients (no target specified) via RTC (no route specified) or TCP (route = via server)
        client.dispatch({ route: tcp ? FudgeNet.ROUTE.VIA_SERVER : undefined, content: { text: message } });
        break;
      case "sendClient":
        // send the message to a specific client (target specified) via RTC (no route specified) or TCP (route = via server)
        client.dispatch({ route: tcp ? FudgeNet.ROUTE.VIA_SERVER : undefined, idTarget: receiver, content: { text: message } });
        break;
    }
  }

  function showMessage(_message: FudgeNet.Message): void {
    console.table(_message);
    if (_message.command)
      return;
    let received: HTMLTextAreaElement = document.forms[1].querySelector("textarea#received");
    let line: string = _message.idSource + "(" + clientsKnown[_message.idSource].name + "):" + JSON.stringify(_message.content);
    received.value = line + "\n" + received.value;
  }
}