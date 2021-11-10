import WebSocket from "ws";
import { Messages } from "../../Build/Messages.js";

console.log("Messages", Messages);

export interface Client {
  id: string;
  name?: string;
  socket?: WebSocket;
  peers: string[];
}

export class FudgeServer {
  public socket!: WebSocket.Server;
  public clients: { [id: string]: Client } = {};

  public startUp = (_port: number = 8080) => {
    console.log(_port);
    this.socket = new WebSocket.Server({ port: _port });
    this.addEventListeners();
    setInterval(this.heartbeat, 1000);
  }

  public closeDown = () => {
    this.socket.close();
  }

  public dispatch(_message: Messages.NetMessage): void {
    _message.timeServer = Date.now();
    let message: string = JSON.stringify(_message);
    if (_message.idTarget)
      this.clients[_message.idTarget].socket?.send(message);
  }

  public broadcast(_message: Messages.NetMessage): void {
    _message.timeServer = Date.now();
    let message: string = JSON.stringify(_message);
    for (let id in this.clients)
      // TODO: examine, if idTarget should be tweaked...
      this.clients[id].socket?.send(message);
  }

  private addEventListeners = (): void => {
    this.socket.on("connection", (_socket: WebSocket) => {
      console.log("User connected to FudgeServer");

      try {
        const id: string = this.createID();
        const client: Client = { socket: _socket, id: id, peers: [] };
        this.clients[id] = client;
        let netMessage: Messages.NetMessage = { idTarget: id, command: Messages.NET_COMMAND.ASSIGN_ID };
        this.dispatch(netMessage);
      } catch (error) {
        console.error("Unhandled Exception", error);
      }

      _socket.on("message", (_message: string) => {
        this.handleMessage(_message, _socket);
      });

      _socket.addEventListener("close", () => {
        console.error("Error at connection");
        for (let id in this.clients) {
          if (this.clients[id].socket === _socket) {
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

  private async handleMessage(_message: string, _wsConnection: WebSocket): Promise<void> {
    let message: Messages.NetMessage = JSON.parse(_message);
    console.log("Message received", message);

    switch (message.command) {
      case Messages.NET_COMMAND.ASSIGN_ID:
        console.log("Id confirmation received for client: " + message.idSource);
        break;
      case Messages.NET_COMMAND.LOGIN_REQUEST:
        this.addUserOnValidLoginRequest(_wsConnection, message);
        break;
    }


    //   case Messages.MESSAGE_TYPE.LOGIN_REQUEST:
    //     this.addUserOnValidLoginRequest(_wsConnection, <Messages.LoginRequest>message);
    //     break;

    //   case Messages.MESSAGE_TYPE.CLIENT_TO_SERVER:
    //     this.receive(<Messages.ToServer>message);
    //     break;

    //   case Messages.MESSAGE_TYPE.RTC_OFFER:
    //     this.sendRtcOfferToRequestedClient(_wsConnection, <Messages.RtcOffer>message);
    //     break;

    //   case Messages.MESSAGE_TYPE.RTC_ANSWER:
    //     this.answerRtcOfferOfClient(_wsConnection, <Messages.RtcAnswer>message);
    //     break;

    //   case Messages.MESSAGE_TYPE.ICE_CANDIDATE:
    //     this.sendIceCandidatesToRelevantPeer(_wsConnection, <Messages.IceCandidate>message);
    //     break;
    //   default:
    //     console.log("WebSocket: Message type not recognized");
    //     break;
    // }
  }

  private async receive(_message: Messages.ToServer): Promise<void> {
    switch (_message.messageData) {
      case Messages.SERVER_COMMAND.CREATE_MESH: {
        let ids: string[] = <string[]>Reflect.ownKeys(this.clients);
        while (ids.length > 1) {
          let id: string = <string>ids.pop();
          let message: Messages.ToClient = new Messages.ToClient(JSON.stringify({ [Messages.SERVER_COMMAND.CONNECT_PEERS]: ids }));
          await new Promise((resolve) => { setTimeout(resolve, 200); });
          this.clients[id].socket?.send(message.serialize());
        }
        break;
      }
      case Messages.SERVER_COMMAND.CONNECT_HOST: {
        let message: Messages.ToClient = new Messages.ToClient(JSON.stringify({ [Messages.SERVER_COMMAND.CONNECT_PEERS]: Reflect.ownKeys(this.clients) }));
        this.clients[_message.idSource].socket?.send(message.serialize());
        break;
      }
      default:
        this.broadcastMessageToAllConnectedClients(<Messages.ToClient>_message);
    }
  }

  private addUserOnValidLoginRequest(_wsConnection: WebSocket, _message: Messages.NetMessage): void {
    let name: string = _message.content?.name;
    for (let id in this.clients) {
      if (this.clients[id].name == name) {
        console.log("UsernameTaken", name);
        let netMessage: Messages.NetMessage = { idTarget: id, command: Messages.NET_COMMAND.LOGIN_RESPONSE, content: { success: false } };
        this.dispatch(netMessage);
        return;
      }
    }
    try {
      for (let id in this.clients) {
        let client: Client = this.clients[id];
        if (client.socket == _wsConnection) {
          client.name = name;
          // _wsConnection.send(new Messages.LoginResponse(true, client.id, client.name).serialize());

          let netMessage: Messages.NetMessage = { idTarget: id, command: Messages.NET_COMMAND.ASSIGN_ID, content: { success: true } };
          this.dispatch(netMessage);
          return;
        }
      }
    } catch (error) {
      console.error("Unhandled Exception: Unable to create or send LoginResponse", error);
    }
  }

  private broadcastMessageToAllConnectedClients(_message: Messages.ToClient): void {
    if (_message.messageType != Messages.MESSAGE_TYPE.SERVER_HEARTBEAT)
      console.info("Broadcast", _message);
    // TODO: appearently, websocketServer keeps its own list of clients. Examine if it makes sense to double this information in this.clients
    let clientArray: WebSocket[] = Array.from(this.socket.clients);
    let message: string = _message.serialize();
    clientArray.forEach(_client => {
      _client.send(message);
    });
  }

  private sendRtcOfferToRequestedClient(_wsConnection: WebSocket, _message: Messages.RtcOffer): void {
    console.log("Sending offer to: ", _message.idRemote);
    const client: Client | undefined = this.clients[_message.idRemote];

    if (client) {
      const offerMessage: Messages.RtcOffer = new Messages.RtcOffer(_message.idSource, client.id, _message.offer);
      let netMessage: Messages.NetMessage = { idSource: _message.idSource, idTarget: _message.idRemote, command: Messages.NET_COMMAND.RTC_OFFER, content: { offer: _message.offer } };

      try {
        client.socket?.send(offerMessage.serialize());
        this.dispatch(netMessage);
      } catch (error) {
        console.error("Unhandled Exception: Unable to relay Offer to Client", error);
      }
    } else { console.error("Server is not connected to client with this id", _message.idRemote); }
  }

  private answerRtcOfferOfClient(_wsConnection: WebSocket, _message: Messages.RtcAnswer): void {
    console.log("Sending answer to: ", _message.idTarget);
    const client: Client | undefined = this.clients[_message.idTarget];

    if (client) {
      // TODO Probable source of error, need to test
      if (client.socket != null)
        client.socket.send(_message.serialize());
      // TODO: with new messages, simply pass through
      let netMessage: Messages.NetMessage = { idTarget: _message.idTarget, command: Messages.NET_COMMAND.RTC_ANSWER, content: { answer: _message.answer } };
      this.dispatch(netMessage);
    }
  }

  private sendIceCandidatesToRelevantPeer(_wsConnection: WebSocket, _message: Messages.IceCandidate): void {
    const client: Client | undefined = this.clients[_message.idTarget];

    console.warn("Send Candidate", client, _message.candidate);
    if (client) {
      const candidateToSend: Messages.IceCandidate = new Messages.IceCandidate(_message.idSource, client.id, _message.candidate);
      client.socket?.send(candidateToSend.serialize());
      let netMessage: Messages.NetMessage = { idTarget: _message.idTarget, command: Messages.NET_COMMAND.ICE_CANDIDATE, content: { candidate: _message.candidate } };
      this.dispatch(netMessage);
    }
  }

  private createID = (): string => {
    // Math.random should be random enough because of its seed
    // convert to base 36 and pick the first few digits after comma
    return "_" + Math.random().toString(36).substr(2, 7);
  }

  private heartbeat = (): void => {
    process.stdout.write("♥");
    let clients: { [id: string]: object } = {};
    for (let id in this.clients)
      clients[id] = { name: this.clients[id].name, peers: this.clients[id].peers };
    // let message: Messages.ServerHeartbeat = new Messages.ServerHeartbeat(JSON.stringify(clients));
    // this.broadcastMessageToAllConnectedClients(message);
    let message: Messages.NetMessage = { command: Messages.NET_COMMAND.SERVER_HEARTBEAT, content: clients };
    this.broadcast(message);
  }
}