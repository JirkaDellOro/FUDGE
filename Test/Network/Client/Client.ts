///<reference path="../../../Network/Build/Client/FudgeClient.d.ts"/>
namespace ClientTest {
  import ƒClient = FudgeClient.FudgeClient;

  let client: ƒClient = new ƒClient();
  let clients: ƒClient[] = [];
  window.addEventListener("load", start);

  async function start(_event: Event): Promise<void> {
    document.forms[0].querySelector("button#connect").addEventListener("click", connectToServer);
    document.forms[0].querySelector("button#login").addEventListener("click", loginToServer);
  }

  async function connectToServer(_event: Event): Promise<void> {
    let domServer: HTMLInputElement = document.forms[0].querySelector("input[name=server");
    try {
      client.connectToSignalingServer(domServer.value);
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
    client.createLoginRequestAndSendToServer(domLogin.value);
  }

  function delay(_milisec: number): Promise<void> {
    return new Promise(resolve => {
      setTimeout(() => { resolve(); }, _milisec);
    });
  }

  async function receiveTCP(_event: CustomEvent): Promise<void> {
    if (_event.detail.messageType == Messages.MESSAGE_TYPE.SERVER_HEARTBEAT) {
      let message: Messages.ServerHeartbeat = <Messages.ServerHeartbeat>_event.detail;
      // carefull, parsing yields simple objects with matching structure, not real clients....
      clients = JSON.parse(message.messageData);

      if (client.name == "")
        proposeName();

      setTable(clients);
    }
  }

  function setTable(_clients: ƒClient[]): void {
    // console.log(_clients);
    let table: HTMLTableElement = document.querySelector("table");
    let html: string = "<tr><th>login</th><th>id</th><th>#</th>";
    let count: number = 0;
    for (let client of _clients)
      html += `<td>${count++}</td>`;
    html += `<th>Server</th></tr>`;

    count = 0;
    for (let client of _clients)
      html += `<tr><td>${client.name}</td><td>${client.id}</td><td>${count++}</td></tr>`;

    table.innerHTML = html;
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
}