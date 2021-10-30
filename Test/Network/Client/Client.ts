namespace ClientWebSocket {
  declare var FudgeNetwork: ƒ.General;

  window.addEventListener("load", start);

  async function start(_event: Event): Promise<void> {
    let settings: { [key: string]: string } = JSON.parse("{" + document.head.querySelector("meta[settings").getAttribute("settings") + "}");
    console.log(settings);
    let domServer: HTMLInputElement = document.forms[0].querySelector("input[name=server");
    let domLogin: HTMLInputElement = document.forms[0].querySelector("input[name=login");
    domServer.setAttribute("value", settings.server);
    domLogin.setAttribute("value", settings.login);
    document.forms[1].querySelector("button[id=connect]").addEventListener("click", connect);
    document.forms[2].querySelector("button[id=sendTCP]").addEventListener("click", sendTCP);
    document.forms[2].querySelector("button[id=sendRTC]").addEventListener("click", sendRTC);

    let client: ƒ.General;
    const messageTypes: ƒ.General = FudgeNetwork.MESSAGE_TYPE;

    async function connect(): Promise<void> {
      let formData: FormData = new FormData(document.forms[1]);
      let connectionType: string = formData.get("type").toString();
      console.log(`%c${connectionType}`, "color:blue; font-size: large");

      switch (connectionType) {
        case "WebSocket":
          client = new FudgeNetwork.ClientManagerWebSocketOnly();
          break;
        case "SinglePeer":
          client = new FudgeNetwork.ClientManagerSinglePeer();
          break;
      }

      console.log("Create", client);
      await client.connectToSignalingServer(domServer.value);
      await delay(1000); // replace with a signal indicating connection
      console.log("Connected");

      client.checkChosenUsernameAndCreateLoginRequest(domLogin.value);
      console.log("Username checked", domLogin.value);

      // let messageToSend: ƒ.General = new client.NetworkMessageMessageToServer(client.getLocalClientId(), "Hallo", client.localUserName);
      // client.sendTextMessageToSignalingServer(messageToSend);
      client.sendMessageToSignalingServer({
        messageType: messageTypes.CLIENT_TO_SERVER_MESSAGE, originatorId: client.getLocalClientId,
        originatorUserName: name, messageData: "Hallo"
      });

      if (connectionType == "SinglePeer") {
        let domPartner: HTMLInputElement = document.forms[1].querySelector("input[name=partner");
        client.checkUsernameToConnectToAndInitiateConnection(domPartner.value);
      }
    }

    async function sendTCP(): Promise<void> {
      console.log("sendTCP");
    }
    async function sendRTC(): Promise<void> {
      console.log("sendRTC");
    }

    function delay(_milisec: number): Promise<void> {
      return new Promise(resolve => {
        setTimeout(() => { resolve(); }, _milisec);
      });
    }
  }
}