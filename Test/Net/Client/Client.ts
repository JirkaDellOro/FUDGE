///<reference path="../../../Net/Build/Client/FudgeClient.d.ts"/>
namespace ClientTest {
  import ƒ = FudgeCore;
  import ƒClient = FudgeNet.FudgeClient;
  ƒ.Debug.setFilter(ƒ.DebugConsole, ƒ.DEBUG_FILTER.ALL);

  let client: ƒClient = new ƒClient();
  window.addEventListener("load", start);

  async function start(_event: Event): Promise<void> {
    document.forms[0].querySelector("button#connect").addEventListener("click", connectToServer);
    document.forms[0].querySelector("button#login").addEventListener("click", loginToServer);
    document.forms[0].querySelector("button#mesh").addEventListener("click", createStructure);
    document.forms[0].querySelector("button#host").addEventListener("click", createStructure);
    document.forms[0].querySelector("button#disconnect").addEventListener("click", createStructure);
    setTable();
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

      for (let i: number = 0; Object.values(client.clientsInfoFromServer).find(_client => _client.name == "Client-" + i); i++)
        domLogin.value = "Client-" + (i + 1);
    }
  }

  async function receiveMessage(_event: CustomEvent | MessageEvent): Promise<void> {
    if (_event instanceof MessageEvent) {
      let message: FudgeNet.Message = JSON.parse(_event.data);
      if (message.command != FudgeNet.COMMAND.SERVER_HEARTBEAT && message.command != FudgeNet.COMMAND.CLIENT_HEARTBEAT)
        console.table(message);
      switch (message.command) {
        case FudgeNet.COMMAND.SERVER_HEARTBEAT:
          if (client.name == "")
            proposeName();
          setTable();
          client.dispatch({ command: FudgeNet.COMMAND.CLIENT_HEARTBEAT });
          break;
        default:
          if (message.idSource) {
            let blink: HTMLSpanElement = document.querySelector(`#${message.idSource}`);
            blink.style.backgroundColor = "white";
          }
      }
      return;
    }
  }

  function setTable(): void {
    let table: HTMLTableElement = document.querySelector("table");
    let html: string = `<tr><th>&nbsp;</th><th>name</th><th>id</th><th>Comment</th></tr>`;

    html += `<tr><td><span style="background-color: white;">&nbsp;</span></td><td>Server</td><td>&nbsp;</td><td>&nbsp;</td></tr>`;

    for (let id in client.clientsInfoFromServer) {
      html += `<tr><td><span id="${id}">&nbsp;</span></td><td>${client.clientsInfoFromServer[id].name}</td><td>${id}</td><td></td></tr>`;
    }

    table.innerHTML = html;
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