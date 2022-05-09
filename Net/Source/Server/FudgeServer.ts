import { getuid } from "process";
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

interface Room {
  id: string; // needed?
  clients: { [id: string]: Client };
  idHost: string | undefined;
}

type Clients = { [id: string]: Client; };
type Rooms = { [id: string]: Room; };

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
  public rooms: Rooms = {};
  private idLobby: string = "Lobby";

  /**
   * Starts the server on the given port, installs the appropriate event-listeners and starts the heartbeat
   */
  public startUp = (_port: number = 8080) => {
    this.rooms[this.idLobby] = { id: this.idLobby, clients: {}, idHost: undefined }; // create lobby to collect newly connected clients
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
    let clients: Clients = this.rooms[_message.idRoom!].clients;
    if (_message.idTarget)
      clients[_message.idTarget].socket?.send(message);
  }

  /**
   * Broadcast a FudgeMet.Message to all clients known to the server.
   */
  public broadcast(_message: FudgeNet.Message): void {
    _message.timeServer = Date.now();
    let message: string = JSON.stringify(_message);
    let clients: Clients = this.rooms[_message.idRoom!].clients;
    for (let id in clients)
      // TODO: examine, if idTarget should be tweaked...
      clients[id].socket?.send(message);
  }

  /**
   * Logs the net-message with some additional text as prefix
   */
  public logMessage(_text: string, _message: FudgeNet.Message): void {
    console.log(_text, `room: ${_message.idRoom}, command: ${_message.command}, route: ${_message.route}, idTarget: ${_message.idTarget}, idSource: ${_message.idSource}`);
  }

  /**
   * Log the list of known clients
   */
  public logClients(_room: Room): void {
    let ids: string[] = <string[]>Reflect.ownKeys(_room.clients);
    // TODO: also display known peer-connections?

    console.log("Connected clients", ids);
  }

  protected async handleMessage(_message: string, _wsConnection: WebSocket): Promise<void> {
    let message: FudgeNet.Message = JSON.parse(_message);
    this.logMessage("Received", message);
    // this.dispatchEvent(new MessageEvent( EVENT.MESSAGE_RECEIVED message); TODO: send event to whoever listens

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

      case FudgeNet.COMMAND.ROOM_GET_IDS:
        this.getRoomIds(message);
        break;

      case FudgeNet.COMMAND.ROOM_CREATE:
        this.createRoom(message);
        break;

      case FudgeNet.COMMAND.ROOM_ENTER:
        this.enterRoom(message);
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
            let room: Room = this.rooms[message.idRoom!];
            message.idTarget = room.idHost;
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

  private addEventListeners = (): void => {
    this.socket.on("connection", (_socket: WebSocket) => {
      console.log("Connection attempt");

      try {
        const id: string = this.createID();
        const client: Client = { socket: _socket, id: id, peers: [] };
        // TODO: client connects -> send a list of available roomss
        console.log(this.rooms[this.idLobby]);
        this.rooms[this.idLobby].clients[id] = client;
        this.logClients(this.rooms[this.idLobby]);
        let netMessage: FudgeNet.Message = { idRoom: this.idLobby, idTarget: id, command: FudgeNet.COMMAND.ASSIGN_ID };
        this.dispatch(netMessage);
      } catch (error) {
        console.error("Unhandled Exception", error);
      }

      _socket.on("message", (_message: string) => {
        this.handleMessage(_message, _socket);
      });

      _socket.addEventListener("close", () => {
        console.log("Connection closed");
        for (let idRoom in this.rooms) {
          let clients: Clients = this.rooms[idRoom].clients;
          for (let id in clients) {
            if (clients[id].socket == _socket) {
              console.log("Deleting from known clients: ", id);
              delete clients[id];
              this.logClients(this.rooms[idRoom]);
            }
          }
        }
      });
    });
  }


  private enterRoom(_message: FudgeNet.Message): void {
    if (!_message.idRoom || !_message.idSource || !_message.content)
      throw (new Error("Message lacks idSource, idRoom or content."));
    if (!this.rooms[_message.idRoom])
      throw (new Error(`Room unavailable ${_message.idRoom}`));

    let client: Client = this.rooms[_message.idRoom].clients[_message.idSource];
    let room: Room = this.rooms[_message.content.room];
    delete this.rooms[_message.idRoom].clients[_message.idSource];
    room.clients[_message.idSource] = client;

    let message: FudgeNet.Message = {
      idRoom: _message.content.room, command: FudgeNet.COMMAND.ROOM_ENTER, content: { client: _message.idSource }
    };
    this.broadcast(message);
  }

  private createRoom(_message: FudgeNet.Message): void {
    let idRoom: string = this.createID();
    this.rooms[idRoom] = { id: idRoom, clients: {}, idHost: undefined };
    let message: FudgeNet.Message = {
      idRoom: this.idLobby, command: FudgeNet.COMMAND.ROOM_CREATE, idTarget: _message.idSource, content: { room: idRoom }
    };
    this.dispatch(message);
  }

  private getRoomIds(_message: FudgeNet.Message): void {
    let message: FudgeNet.Message = {
      idRoom: _message.idRoom, command: FudgeNet.COMMAND.ROOM_GET_IDS, idTarget: _message.idSource, content: { rooms: Object.keys(this.rooms) }
    };
    this.dispatch(message);
  }

  private async createMesh(_message: FudgeNet.Message): Promise<void> {
    let room: Room = this.rooms[_message.idRoom!];
    let ids: string[] = <string[]>Reflect.ownKeys(room.clients);
    while (ids.length > 1) {
      let id: string = <string>ids.pop();
      let message: FudgeNet.Message = {
        idRoom: _message.idRoom, command: FudgeNet.COMMAND.CONNECT_PEERS, idTarget: id, content: { peers: ids }
      };
      await new Promise((resolve) => { setTimeout(resolve, 500); });
      this.dispatch(message);
    }
    room.idHost = undefined;
  }

  private async connectHost(_message: FudgeNet.Message): Promise<void> {
    if (!_message.idSource || !_message.idRoom)
      return;
    let room: Room = this.rooms[_message.idRoom];
    let ids: string[] = <string[]>Reflect.ownKeys(room.clients);
    let message: FudgeNet.Message = {
      idRoom: _message.idRoom, command: FudgeNet.COMMAND.CONNECT_PEERS, idTarget: _message.idSource, content: { peers: ids }
    };
    console.log("Connect Host", _message.idSource, ids);
    room.idHost = _message.idSource;
    this.dispatch(message);
  }

  private addUserOnValidLoginRequest(_wsConnection: WebSocket, _message: FudgeNet.Message): void {
    let rooms: Room = this.rooms[this.idLobby];
    let name: string = _message.content?.name;
    for (let id in rooms.clients) {
      if (rooms.clients[id].name == name) {
        console.log("UsernameTaken", name);
        let netMessage: FudgeNet.Message = { idRoom: this.idLobby, idTarget: id, command: FudgeNet.COMMAND.LOGIN_RESPONSE, content: { success: false } };
        this.dispatch(netMessage);
        return;
      }
    }
    try {
      for (let id in rooms.clients) {
        let client: Client = rooms.clients[id];
        if (client.socket == _wsConnection) {
          client.name = name;
          let netMessage: FudgeNet.Message = { idRoom: this.idLobby, idTarget: id, command: FudgeNet.COMMAND.ASSIGN_ID, content: { success: true } };
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
      if (!_message.idTarget || !_message.content || !_message.idRoom)
        throw (new Error("Message lacks idTarget, idRoom or content."));
      let room: Room = this.rooms[_message.idRoom];

      // console.log("Sending offer to: ", _message.idTarget);
      const client: Client | undefined = room.clients[_message.idTarget];
      if (!client)
        throw (new Error(`No client found with id ${_message.idTarget}`));

      let netMessage: FudgeNet.Message = {
        idRoom: _message.idRoom, idSource: _message.idSource, idTarget: _message.idTarget, command: FudgeNet.COMMAND.RTC_OFFER, content: { offer: _message.content.offer }
      };

      this.dispatch(netMessage);
    } catch (error) {
      console.error("Unhandled Exception: Unable to relay Offer to Client", error);
    }
  }

  private answerRtcOfferOfClient(_wsConnection: WebSocket, _message: FudgeNet.Message): void {
    if (!_message.idTarget || !_message.idRoom)
      throw (new Error("Message lacks target"));
    let room: Room = this.rooms[_message.idRoom];

    // console.log("Sending answer to: ", _message.idTarget);
    const client: Client | undefined = room.clients[_message.idTarget];

    if (client && client.socket && _message.content) {
      this.dispatch(_message);
    } else
      throw (new Error("Client or its socket not found or message lacks content."));
  }

  private sendIceCandidatesToRelevantPeer(_wsConnection: WebSocket, _message: FudgeNet.Message): void {
    if (!_message.idTarget || !_message.idSource || !_message.idRoom)
      throw (new Error("Message lacks target-, source- or room-id."));
    let room: Room = this.rooms[_message.idRoom];
    const client: Client | undefined = room.clients[_message.idTarget];

    if (client && _message.content) {
      // console.warn("Send Candidate", client, _message.content.candidate);
      this.dispatch(_message);
    } else
      throw (new Error("Client not found or message lacks content."));
  }

  private createID = (): string => {
    // Math.random should be random enough because of its seed
    // convert to base 36 and pick the first few digits after comma
    // return "_" + process.getuid().toString(36);
    return "_" + Math.random().toString(36).slice(2, 7);
  }

  private heartbeat = (): void => {
    process.stdout.write("♥");
    for (let idRoom in this.rooms) {
      let room: Room = this.rooms[idRoom];
      let clients: Clients = {};
      for (let id in room.clients)
        //@ts-ignore
        clients[id] = { name: room.clients[id].name, peers: room.clients[id].peers, isHost: room.idHost == id };
      let message: FudgeNet.Message = { idRoom: idRoom, command: FudgeNet.COMMAND.SERVER_HEARTBEAT, content: clients };
      this.broadcast(message);
    }
  }
}