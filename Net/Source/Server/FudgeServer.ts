import { hostname } from "os";
import WebSocket from "ws";
import { FudgeNet } from "./Message.js";

/**
 * Keeps information about the connected clients
 */
export interface Client {
  id: string;
  name?: string;
  socket?: WebSocket;
  peers: string[];
}

/**
 * Manages the websocket connections to FudgeClients, their ids and login names
 * and keeps track of the peer to peer connections between them. Processes messages 
 * from the clients in the format {@link FudgeNet.Message} according to the controlling
 * fields {@link FudgeNet.ROUTE} and {@link FudgeNet.COMMAND}.  
 * @author Falco Böhnke, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2021
 * TODOs: 
 * - finalize the tracking of peers, deleted clients may not be removed from peers-array
 * - pass messages through the server to other clients to have them use the safe websocket connection
 */
export class FudgeServer {
  public socket!: WebSocket.Server;
  public clients: { [id: string]: Client } = {};
  public idHost: string | undefined;

  /**
   * Starts the server on the given port, installs the appropriate event-listeners and starts the heartbeat
   */
  public startUp = (_port: number = 8080) => {
    console.log(_port);
    this.socket = new WebSocket.Server({ port: _port });
    this.addEventListeners();
    setInterval(this.heartbeat, 1000);
  }

  /**
   * Close the websocket of this server
   */
  public closeDown = () => {
    this.socket.close();
  }

  /**
   * Dispatch a FudgeNet.Message to the client with the id given as `idTarget`
   */
  public dispatch(_message: FudgeNet.Message): void {
    _message.timeServer = Date.now();
    let message: string = JSON.stringify(_message);
    if (_message.idTarget)
      this.clients[_message.idTarget].socket?.send(message);
  }

  /**
   * Broadcast a FudgeMet.Message to all clients known to the server.
   */
  public broadcast(_message: FudgeNet.Message): void {
    _message.timeServer = Date.now();
    let message: string = JSON.stringify(_message);
    for (let id in this.clients)
      // TODO: examine, if idTarget should be tweaked...
      this.clients[id].socket?.send(message);
  }

  /**
   * Logs the net-message with some additional text as prefix
   */
  public logMessage(_text: string, _message: FudgeNet.Message): void {
    console.log(_text, `command: ${_message.command}, route: ${_message.route}, idTarget: ${_message.idTarget}, idSource: ${_message.idSource}`);
  }

  /**
   * Log the list of known clients
   */
  public logClients(): void {
    let ids: string[] = <string[]>Reflect.ownKeys(this.clients);
    // TODO: also display known peer-connections?

    console.log("Connected clients", ids);
  }

  private addEventListeners = (): void => {
    this.socket.on("connection", (_socket: WebSocket) => {
      console.log("Connection attempt");

      try {
        const id: string = this.createID();
        const client: Client = { socket: _socket, id: id, peers: [] };
        this.clients[id] = client;
        this.logClients();
        let netMessage: FudgeNet.Message = { idTarget: id, command: FudgeNet.COMMAND.ASSIGN_ID };
        this.dispatch(netMessage);
      } catch (error) {
        console.error("Unhandled Exception", error);
      }

      _socket.on("message", (_message: string) => {
        this.handleMessage(_message, _socket);
      });

      _socket.addEventListener("close", () => {
        console.log("Connection closed");
        for (let id in this.clients) {
          if (this.clients[id].socket == _socket) {
            console.log("Deleting from known clients: ", id);
            delete this.clients[id];
          }
        }
        this.logClients();
      });
    });
  }

  private async handleMessage(_message: string, _wsConnection: WebSocket): Promise<void> {
    let message: FudgeNet.Message = JSON.parse(_message);
    this.logMessage("Received", message);

    switch (message.command) {
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
        switch (message.route) {
          case FudgeNet.ROUTE.VIA_SERVER_HOST:
            message.idTarget = this.idHost;
            this.logMessage("Forward to host", message);
            this.dispatch(message);
            break;
          case FudgeNet.ROUTE.VIA_SERVER:
            if (message.idTarget) {
              this.logMessage("Pass to target", message);
              this.dispatch(message);
            } else {
              this.logMessage("Broadcast to all", message);
              this.broadcast(message);
            }
            break;
        }
        break;
    }
  }

  private async createMesh(_message: FudgeNet.Message): Promise<void> {
    let ids: string[] = <string[]>Reflect.ownKeys(this.clients);
    while (ids.length > 1) {
      let id: string = <string>ids.pop();
      let message: FudgeNet.Message = {
        command: FudgeNet.COMMAND.CONNECT_PEERS, idTarget: id, content: { peers: ids }
      };
      await new Promise((resolve) => { setTimeout(resolve, 500); });
      this.dispatch(message);
    }
    this.idHost = undefined;
  }

  private async connectHost(_message: FudgeNet.Message): Promise<void> {
    if (!_message.idSource)
      return;
    let ids: string[] = <string[]>Reflect.ownKeys(this.clients);
    let message: FudgeNet.Message = {
      command: FudgeNet.COMMAND.CONNECT_PEERS, idTarget: _message.idSource, content: { peers: ids }
    };
    console.log("Connect Host", _message.idSource, ids);
    this.idHost = _message.idSource;
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
          let netMessage: FudgeNet.Message = { idTarget: id, command: FudgeNet.COMMAND.ASSIGN_ID, content: { success: true } };
          this.dispatch(netMessage);
          return;
        }
      }
    } catch (error) {
      console.error("Unhandled Exception: Unable to create or send LoginResponse", error);
    }
  }

  private sendRtcOfferToRequestedClient(_wsConnection: WebSocket, _message: FudgeNet.Message): void {
    try {
      if (!_message.idTarget || !_message.content)
        throw (new Error("Message lacks idTarget or content."));

      // console.log("Sending offer to: ", _message.idTarget);
      const client: Client | undefined = this.clients[_message.idTarget];
      if (!client)
        throw (new Error(`No client found with id ${_message.idTarget}`));

      let netMessage: FudgeNet.Message = {
        idSource: _message.idSource, idTarget: _message.idTarget, command: FudgeNet.COMMAND.RTC_OFFER, content: { offer: _message.content.offer }
      };

      this.dispatch(netMessage);
    } catch (error) {
      console.error("Unhandled Exception: Unable to relay Offer to Client", error);
    }
  }

  private answerRtcOfferOfClient(_wsConnection: WebSocket, _message: FudgeNet.Message): void {
    if (!_message.idTarget)
      throw (new Error("Message lacks target"));

    // console.log("Sending answer to: ", _message.idTarget);
    const client: Client | undefined = this.clients[_message.idTarget];

    if (client && client.socket && _message.content) {
      this.dispatch(_message);
    } else
      throw (new Error("Client or its socket not found or message lacks content."));
  }

  private sendIceCandidatesToRelevantPeer(_wsConnection: WebSocket, _message: FudgeNet.Message): void {
    if (!_message.idTarget || !_message.idSource)
      throw (new Error("Message lacks target or source."));
    const client: Client | undefined = this.clients[_message.idTarget];

    if (client && _message.content) {
      // console.warn("Send Candidate", client, _message.content.candidate);
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
      clients[id] = { name: this.clients[id].name, peers: this.clients[id].peers, isHost: this.idHost == id };
    let message: FudgeNet.Message = { command: FudgeNet.COMMAND.SERVER_HEARTBEAT, content: clients };
    this.broadcast(message);
  }
}