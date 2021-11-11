import WebSocket from "ws";
import { FudgeNet } from "../../Build/Message.js";

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

  public dispatch(_message: FudgeNet.Message): void {
    _message.timeServer = Date.now();
    let message: string = JSON.stringify(_message);
    if (_message.idTarget)
      this.clients[_message.idTarget].socket?.send(message);
  }

  public broadcast(_message: FudgeNet.Message): void {
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
        let netMessage: FudgeNet.Message = { idTarget: id, command: FudgeNet.COMMAND.ASSIGN_ID };
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
    let message: FudgeNet.Message = JSON.parse(_message);
    console.log("Message received", message);

    switch (message.command) {
      case FudgeNet.COMMAND.ASSIGN_ID:
        console.log("Id confirmation received for client: " + message.idSource);
        break;
      case FudgeNet.COMMAND.LOGIN_REQUEST:
        this.addUserOnValidLoginRequest(_wsConnection, message);
        break;
      case FudgeNet.COMMAND.RTC_OFFER:
        this.sendRtcOfferToRequestedClient(_wsConnection, message);
        break;

      case FudgeNet.COMMAND.RTC_ANSWER:
        this.answerRtcOfferOfClient(_wsConnection, message);
        break;

      case FudgeNet.COMMAND.ICE_CANDIDATE:
        this.sendIceCandidatesToRelevantPeer(_wsConnection, message);
        break;

      case FudgeNet.COMMAND.CREATE_MESH:
        this.createMesh(message);
        break;

      case FudgeNet.COMMAND.CONNECT_HOST:
        this.connectHost(message);
        break;
      default:
        console.log("WebSocket: Message type not recognized");
        break;
    }
  }

  private async createMesh(_message: FudgeNet.Message): Promise<void> {
    let ids: string[] = <string[]>Reflect.ownKeys(this.clients);
    while (ids.length > 1) {
      let id: string = <string>ids.pop();
      // let message: Messages.ToClient = new Messages.ToClient(JSON.stringify({ [Messages.SERVER_COMMAND.CONNECT_PEERS]: ids }));
      let message: FudgeNet.Message = {
        command: FudgeNet.COMMAND.CONNECT_PEERS, idTarget: id, content: { peers: ids }
      };
      // new Messages.ToClient(JSON.stringify({ [Messages.SERVER_COMMAND.CONNECT_PEERS]: ids }));
      await new Promise((resolve) => { setTimeout(resolve, 200); });
      this.dispatch(message);
    }
  }

  private async connectHost(_message: FudgeNet.Message): Promise<void> {
    let ids: string[] = <string[]>Reflect.ownKeys(this.clients);
    let message: FudgeNet.Message = {
      command: FudgeNet.COMMAND.CONNECT_PEERS, idTarget: _message.idSource, content: { peers: ids }
    };
    // new Messages.ToClient(JSON.stringify({ [Messages.SERVER_COMMAND.CONNECT_PEERS]: Reflect.ownKeys(this.clients) }));
    this.dispatch(message);
  }

  private addUserOnValidLoginRequest(_wsConnection: WebSocket, _message: FudgeNet.Message): void {
    let name: string = _message.content?.name;
    for (let id in this.clients) {
      if (this.clients[id].name == name) {
        console.log("UsernameTaken", name);
        let netMessage: FudgeNet.Message = { idTarget: id, command: FudgeNet.COMMAND.LOGIN_RESPONSE, content: { success: false } };
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

          let netMessage: FudgeNet.Message = { idTarget: id, command: FudgeNet.COMMAND.ASSIGN_ID, content: { success: true } };
          this.dispatch(netMessage);
          return;
        }
      }
    } catch (error) {
      console.error("Unhandled Exception: Unable to create or send LoginResponse", error);
    }
  }

  // private broadcastMessageToAllConnectedClients(_message: Messages.ToClient): void {
  //   if (_message.messageType != Messages.MESSAGE_TYPE.SERVER_HEARTBEAT)
  //     console.info("Broadcast", _message);
  //   // TODO: appearently, websocketServer keeps its own list of clients. Examine if it makes sense to double this information in this.clients
  //   let clientArray: WebSocket[] = Array.from(this.socket.clients);
  //   let message: string = _message.serialize();
  //   clientArray.forEach(_client => {
  //     _client.send(message);
  //   });
  // }

  private sendRtcOfferToRequestedClient(_wsConnection: WebSocket, _message: FudgeNet.Message): void {
    try {
      if (!_message.idTarget || !_message.content)
        throw (new Error("Message lacks idTarget or content."));

      console.log("Sending offer to: ", _message.idTarget);
      const client: Client | undefined = this.clients[_message.idTarget];
      if (!client)
        throw (new Error(`No client found with id ${_message.idTarget}`));

      let netMessage: FudgeNet.Message = {
        idSource: _message.idSource, idTarget: _message.idTarget, command: FudgeNet.COMMAND.RTC_OFFER, content: { offer: _message.content.offer }
      };

      // client.socket?.send(_message.serialize());
      this.dispatch(netMessage);
    } catch (error) {
      console.error("Unhandled Exception: Unable to relay Offer to Client", error);
    }
  }

  private answerRtcOfferOfClient(_wsConnection: WebSocket, _message: FudgeNet.Message): void {
    if (!_message.idTarget)
      throw (new Error("Message lacks target"));

    console.log("Sending answer to: ", _message.idTarget);
    const client: Client | undefined = this.clients[_message.idTarget];

    if (client && client.socket && _message.content) {
      // client.socket.send(_message.serialize());
      // TODO: with new messages, simply pass through
      // let netMessage: FudgeNet.Message = {
      //   idTarget: _message.idTarget, command: FudgeNet.COMMAND.RTC_ANSWER, content: { answer: _message.content.answer }
      // };
      this.dispatch(_message);
    } else
      throw (new Error("Client or its socket not found or message lacks content."));
  }

  private sendIceCandidatesToRelevantPeer(_wsConnection: WebSocket, _message: FudgeNet.Message): void {
    if (!_message.idTarget || !_message.idSource)
      throw (new Error("Message lacks target or source."));
    const client: Client | undefined = this.clients[_message.idTarget];

    if (client && _message.content) {
      console.warn("Send Candidate", client, _message.content.candidate);
      // let netMessage: FudgeNet.Message = {
      //   idTarget: _message.idTarget, command: FudgeNet.COMMAND.ICE_CANDIDATE, content: _message.content
      // };
      this.dispatch(_message);
    } else
      throw (new Error("Client not found or message lacks content."));
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
    // console.log(clients);
    // let message: Messages.ServerHeartbeat = new Messages.ServerHeartbeat(JSON.stringify(clients));
    // this.broadcastMessageToAllConnectedClients(message);
    let message: FudgeNet.Message = { command: FudgeNet.COMMAND.SERVER_HEARTBEAT, content: clients };
    this.broadcast(message);
  }
}