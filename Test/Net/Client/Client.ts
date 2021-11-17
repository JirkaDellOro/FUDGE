///<reference path="../../../Net/Build/Client/FudgeClient.d.ts"/>
namespace ClientTest {
  import ƒ = FudgeCore;
  import ƒClient = FudgeNet.FudgeClient;
  ƒ.Debug.setFilter(ƒ.DebugConsole, ƒ.DEBUG_FILTER.ALL);

  let client: ƒClient = new ƒClient();
  let clientsKnown: { [id: string]: { name?: string; isHost?: boolean; } } = {};

  window.addEventListener("load", start);

  async function start(_event: Event): Promise<void> {
    document.forms[0].querySelector("button#connect").addEventListener("click", connectToServer);
    document.forms[0].querySelector("button#login").addEventListener("click", loginToServer);
    document.forms[0].querySelector("button#mesh").addEventListener("click", createStructure);
    document.forms[0].querySelector("button#host").addEventListener("click", createStructure);
    document.forms[0].querySelector("button#disconnect").addEventListener("click", createStructure);
    createTable();
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
      client.addEventListener(FudgeNet.EVENT.MESSAGE_RECEIVED, receiveMessage);
    } catch (_error) {
      console.log(_error);
      console.log("Make sure, FudgeServer is running and accessable");
    }
  }

  async function loginToServer(_event: Event): Promise<void> {
    let domLogin: HTMLInputElement = document.forms[0].querySelector("input[name=login");
    client.loginToServer(domLogin.value);
  }

  async function receiveMessage(_event: CustomEvent | MessageEvent): Promise<void> {
    if (_event instanceof MessageEvent) {
      let message: FudgeNet.Message = JSON.parse(_event.data);
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
          let span: HTMLSpanElement = document.querySelector(`#${message.idSource} span`);
          blink(span);
          break;
        default:
          break;
      }
      return;
    }
  }

  function delay(_milisec: number): Promise<void> {
    return new Promise(resolve => {
      setTimeout(() => { resolve(); }, _milisec);
    });
  }

  function proposeName(): void {
    // search for a free number i to use for the proposal of the name "Client" + i
    let domLogin: HTMLInputElement = document.forms[0].querySelector("input[name=login");
    if (document.activeElement == domLogin)
      return; // don't interfere when user's at the element

    let i: number = 0;
    for (; Object.values(client.clientsInfoFromServer).find(_info => _info.name == "Client-" + i); i++);
    domLogin.value = "Client-" + i;
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

    clientsKnown = client.clientsInfoFromServer;

    for (let id in clientsKnown) {
      let name: string = clientsKnown[id].name;
      let isHost: boolean = clientsKnown[id].isHost;
      let row: HTMLTableRowElement = table.querySelector(`#${id}`);
      if (row)
        row.querySelector("td[name=name]").textContent = name + (isHost ? " (HOST)" : "");
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
}