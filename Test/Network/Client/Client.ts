///<reference path="../../../Network/Build/Client/FudgeClient.d.ts"/>
namespace ClientTest {
  import ƒClient = FudgeClient.FudgeClient;
  window.addEventListener("load", start);

  async function start(_event: Event): Promise<void> {
    // setTable();

    let client: FudgeClient.FudgeClient = new FudgeClient.FudgeClient();
    console.log(client);
    client.connectToSignalingServer("ws://localhost:8080");

    await delay(1000);

    client.createLoginRequestAndSendToServer("Test");
    client.webSocketConnectionToSignalingServer.addEventListener("receive", receiveTCP);
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
      let clients: ƒClient[] = JSON.parse(message.messageData);
      setTable(clients);
    }
  }

  function setTable(_clients: ƒClient[]): void {
    // console.log(_clients);
    let table: HTMLTableElement = document.querySelector("table");
    let html: string = "<tr><td></td>";
    for (let client: number = 0; client < _clients.length; client++)
      html += `<td>${client}</td>`;
    html += `<td>Server</td></tr>`;

    for (let client: number = 0; client < _clients.length; client++)
      html += `<tr><td>${client}</td></tr>`;

    table.innerHTML = html;
  }
}