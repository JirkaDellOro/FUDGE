import WebSocket from "ws";
import { Messages } from "../../Build/Messages.js";

console.log("Messages", Messages);

enum CONNECTION {
  TCP, RTC
}

export interface Client {
  id: string;
  name?: string;
  wsServer?: WebSocket;
  peers: { [id: string]: CONNECTION[] };
}

export class FudgeServer {
  public wsServer!: WebSocket.Server;
  public clients: { [id: string]: Client } = {};

  public startUp = (_port: number = 8080) => {
    console.log(_port);
    this.wsServer = new WebSocket.Server({ port: _port });
    this.addEventListeners();
    setInterval(this.heartbeat, 1000);
  }

  public closeDown = () => {
    this.wsServer.close();
  }

  public addEventListeners = (): void => {
    this.wsServer.on("connection", (_wsConnection: WebSocket) => {
      console.log("User connected to FudgeServer");

      try {
        const id: string = this.createID();
        _wsConnection.send(new Messages.IdAssigned(id).serialize());
        const client: Client = { wsServer: _wsConnection, id: id, peers: {} };
        this.clients[id] = client;
      } catch (error) {
        console.error("Unhandled Exception SERVER: Sending ID to ClientDataType", error);
      }

      _wsConnection.on("message", (_message: string) => {
        this.handleMessage(_message, _wsConnection);
      });

      _wsConnection.addEventListener("close", () => {
        console.error("Error at connection");
        for (let id in this.clients) {
          if (this.clients[id].wsServer === _wsConnection) {
            console.log("Client connection found, deleting");
            delete this.clients[id];
            console.log(this.clients);
          }
          else {
            console.log("Wrong client to delete, moving on");
          }
        }
      });
    });
  }

  // TODO Check if event.type can be used for identification instead => It cannot
  public async handleMessage(_message: string, _wsConnection: WebSocket): Promise<void> {
    let message: Messages.MessageBase = Messages.MessageBase.deserialize(_message);
    if (!message || !message.messageType) {
      console.error("Unhandled Exception: Invalid Message Object received. Does it implement MessageBase?");
      return;
    }
    console.log("Message received", message);

    switch (message.messageType) {
      case Messages.MESSAGE_TYPE.ID_ASSIGNED:
        console.log("Id confirmation received for client: " + message.idSource);
        break;

      case Messages.MESSAGE_TYPE.LOGIN_REQUEST:
        this.addUserOnValidLoginRequest(_wsConnection, <Messages.LoginRequest>message);
        break;

      case Messages.MESSAGE_TYPE.CLIENT_TO_SERVER:
        this.receive(<Messages.ToServer>message);
        break;

      case Messages.MESSAGE_TYPE.RTC_OFFER:
        this.sendRtcOfferToRequestedClient(_wsConnection, <Messages.RtcOffer>message);
        break;

      case Messages.MESSAGE_TYPE.RTC_ANSWER:
        this.answerRtcOfferOfClient(_wsConnection, <Messages.RtcAnswer>message);
        break;

      case Messages.MESSAGE_TYPE.ICE_CANDIDATE:
        this.sendIceCandidatesToRelevantPeer(_wsConnection, <Messages.IceCandidate>message);
        break;
      default:
        console.log("WebSocket: Message type not recognized");
        break;
    }
  }

  public async receive(_message: Messages.ToServer): Promise<void> {
    switch (_message.messageData) {
      case Messages.SERVER_COMMAND.CREATE_MESH: {
        let ids: string[] = <string[]>Reflect.ownKeys(this.clients);
        while (ids.length > 1) {
          let id: string = <string>ids.pop();
          let message: Messages.ToClient = new Messages.ToClient(JSON.stringify({ [Messages.SERVER_COMMAND.CONNECT_PEERS]: ids }));
          await new Promise((resolve) => { setTimeout(resolve, 200); });
          this.clients[id].wsServer?.send(message.serialize());
        }
        break;
      }
      case Messages.SERVER_COMMAND.CONNECT_HOST: {
        let message: Messages.ToClient = new Messages.ToClient(JSON.stringify({ [Messages.SERVER_COMMAND.CONNECT_PEERS]: Reflect.ownKeys(this.clients) }));
        this.clients[_message.idSource].wsServer?.send(message.serialize());
        break;
      }
      default:
        this.broadcastMessageToAllConnectedClients(<Messages.ToClient>_message);
    }
  }

  public addUserOnValidLoginRequest(_wsConnection: WebSocket, _message: Messages.LoginRequest): void {
    for (let id in this.clients) {
      if (this.clients[id].name == _message.loginUserName) {
        _wsConnection.send(new Messages.LoginResponse(false, "", "").serialize());
        console.log("UsernameTaken", _message.loginUserName);
        return;
      }
    }
    try {
      for (let id in this.clients) {
        let client: Client = this.clients[id];
        if (client.wsServer == _wsConnection) {
          client.name = _message.loginUserName;
          _wsConnection.send(new Messages.LoginResponse(true, client.id, client.name).serialize());
          return;
        }
      }
    } catch (error) {
      console.error("Unhandled Exception: Unable to create or send LoginResponse", error);
    }
  }

  public broadcastMessageToAllConnectedClients(_message: Messages.ToClient): void {
    console.info("Broadcast", _message);
    // TODO: appearently, websocketServer keeps its own list of clients. Examine if it makes sense to double this information in this.clients
    let clientArray: WebSocket[] = Array.from(this.wsServer.clients);
    let message: string = _message.serialize();
    clientArray.forEach(_client => {
      _client.send(message);
    });
  }

  public sendRtcOfferToRequestedClient(_wsConnection: WebSocket, _message: Messages.RtcOffer): void {
    console.log("Sending offer to: ", _message.idRemote);
    const client: Client | undefined = this.clients[_message.idRemote];

    if (client) {
      const offerMessage: Messages.RtcOffer = new Messages.RtcOffer(_message.idSource, client.id, _message.offer);
      try {
        client.wsServer?.send(offerMessage.serialize());
      } catch (error) {
        console.error("Unhandled Exception: Unable to relay Offer to Client", error);
      }
    } else { console.error("User to connect to doesn't exist under that Name"); }
  }

  public answerRtcOfferOfClient(_wsConnection: WebSocket, _message: Messages.RtcAnswer): void {
    console.log("Sending answer to: ", _message.idTarget);
    const client: Client | undefined = this.clients[_message.idTarget];

    if (client) {
      // TODO Probable source of error, need to test
      if (client.wsServer != null)
        client.wsServer.send(_message.serialize());
    }
  }

  public sendIceCandidatesToRelevantPeer(_wsConnection: WebSocket, _message: Messages.IceCandidate): void {
    const client: Client | undefined = this.clients[_message.idTarget];

    console.warn("Send Candidate", client, _message.candidate);
    if (client) {
      const candidateToSend: Messages.IceCandidate = new Messages.IceCandidate(_message.idSource, client.id, _message.candidate);
      client.wsServer?.send(candidateToSend.serialize());
    }
  }

  public createID = (): string => {
    // Math.random should be random enough because of its seed
    // convert to base 36 and pick the first few digits after comma
    return "_" + Math.random().toString(36).substr(2, 7);
  }

  private heartbeat = (): void => {
    console.log("Server Heartbeat");
    let clients: { [id: string]: object } = {};
    for (let id in this.clients)
      clients[id] = { name: this.clients[id].name, peers: this.clients[id].peers };
    let message: Messages.ServerHeartbeat = new Messages.ServerHeartbeat(JSON.stringify(clients));
    this.broadcastMessageToAllConnectedClients(message);
  }
}