import WebSocket from "ws";
import {Messages} from "../../Build/Messages.js";

console.log("Messages", Messages);

enum CONNECTION {
  TCP, RTC
}

export interface Client {
  id: string;
  name?: string;
  connection: WebSocket;
  peers: { [id: string]: CONNECTION[] };
}

export class FudgeServer {
  public wsServer!: WebSocket.Server;
  public clients: Client[] = [];

  public startUp = (_port: number = 8080) => {
    console.log(_port);
    this.wsServer = new WebSocket.Server({ port: _port });
    this.addEventListeners();
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
        const client: Client = { connection: _wsConnection, id: id, peers: {} };
        this.clients.push(client);
      } catch (error) {
        console.error("Unhandled Exception SERVER: Sending ID to ClientDataType", error);
      }

      _wsConnection.on("message", (_message: string) => {
        this.handleMessage(_message, _wsConnection);
      });

      _wsConnection.addEventListener("close", () => {
        console.error("Error at connection");
        for (let i: number = 0; i < this.clients.length; i++) {
          if (this.clients[i].connection === _wsConnection) {
            console.log("Client connection found, deleting");
            this.clients.splice(i, 1);
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
  public handleMessage(_message: string, _wsConnection: WebSocket): void {
    let message: Messages.MessageBase = Messages.MessageBase.deserialize(_message);
    if (!message || !message.messageType) {
      console.error("Unhandled Exception: Invalid Message Object received. Does it implement MessageBase?");
      return;
    }
    console.log("Message received", message);

    switch (message.messageType) {
      case Messages.MESSAGE_TYPE.ID_ASSIGNED:
        console.log("Id confirmation received for client: " + message.originatorId);
        break;

      case Messages.MESSAGE_TYPE.LOGIN_REQUEST:
        this.addUserOnValidLoginRequest(_wsConnection, <Messages.LoginRequest>message);
        break;

      case Messages.MESSAGE_TYPE.CLIENT_TO_SERVER_MESSAGE:
        this.broadcastMessageToAllConnectedClients(<Messages.ToClient>message);
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

  public addUserOnValidLoginRequest(_wsConnection: WebSocket, _message: Messages.LoginRequest): void {
    let usernameTaken: Client | undefined = this.clients.find(_client => _client.name == _message.loginUserName);
    try {
      if (!usernameTaken) {
        const clientBeingLoggedIn: Client | undefined = this.clients.find(_client => _client.connection == _wsConnection);

        if (clientBeingLoggedIn) {
          clientBeingLoggedIn.name = _message.loginUserName;
          _wsConnection.send(new Messages.LoginResponse(true, clientBeingLoggedIn.id, clientBeingLoggedIn.name).serialize());
        }
      } else {
        _wsConnection.send(new Messages.LoginResponse(false, "", "").serialize());
        console.log("UsernameTaken");
      }
    } catch (error) {
      console.error("Unhandled Exception: Unable to create or send LoginResponse", error);
    }
  }

  public broadcastMessageToAllConnectedClients(_message: Messages.ToClient): void {
    console.log("Broadcast", _message);
    // TODO: appearently, websocketServer keeps its own list of clients. Examine if it makes sense to double this information in this.clients
    let clientArray: WebSocket[] = Array.from(this.wsServer.clients);

    clientArray.forEach(_client => {
      _client.send(_message.serialize());
    });
  }

  public sendRtcOfferToRequestedClient(_wsConnection: WebSocket, _message: Messages.RtcOffer): void {
    console.log("Sending offer to: ", _message.userNameToConnectTo);
    const client: Client | undefined = this.clients.find(_client => _client.name == _message.userNameToConnectTo);

    if (client) {
      const offerMessage: Messages.RtcOffer = new Messages.RtcOffer(_message.originatorId, <string>client.name, _message.offer);
      try {
        client.connection.send(offerMessage.serialize());
      } catch (error) {
        console.error("Unhandled Exception: Unable to relay Offer to Client", error);
      }
    } else { console.error("User to connect to doesn't exist under that Name"); }
  }

  public answerRtcOfferOfClient(_wsConnection: WebSocket, _message: Messages.RtcAnswer): void {
    console.log("Sending answer to: ", _message.targetId);
    const client: Client | undefined = this.clients.find(_client => _client.id == _message.targetId);

    if (client) {
      // TODO Probable source of error, need to test
      if (client.connection != null)
        client.connection.send(_message.serialize());
    }
  }

  public sendIceCandidatesToRelevantPeer(_wsConnection: WebSocket, _message: Messages.IceCandidate): void {
    const client: Client | undefined = this.clients.find(_client => _client.id == _message.targetId);

    if (client) {
      const candidateToSend: Messages.IceCandidate = new Messages.IceCandidate(_message.originatorId, client.id, _message.candidate);
      client.connection.send(candidateToSend.serialize());
    }
  }

  public createID = (): string => {
    // Math.random should be random enough because of its seed
    // convert to base 36 and pick the first few digits after comma
    return "_" + Math.random().toString(36).substr(2, 7);
  }
}