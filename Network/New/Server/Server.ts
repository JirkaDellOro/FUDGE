import WebSocket from "ws";
import * as Message from "./Messages.js";

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
  public websocketServer!: WebSocket.Server;
  public clients: Client[] = [];

  public startUpServer = (_serverPort: number = 8080) => {
    console.log(_serverPort);
    this.websocketServer = new WebSocket.Server({ port: _serverPort });
    this.addServerEventHandling();
  }

  public closeDownServer = () => {
    this.websocketServer.close();
  }
  public addServerEventHandling = (): void => {
    // tslint:disable-next-line: no-any
    this.websocketServer.on("connection", (_websocketClient: WebSocket) => {
      console.log("User connected to FudgeServer");

      try {
        const uniqueIdOnConnection: string = this.createID();
        // this.sendTo(_websocketClient, new Message.IdAssigned(uniqueIdOnConnection));
        _websocketClient.send(new Message.IdAssigned(uniqueIdOnConnection));
        const freshlyConnectedClient: Client = { connection: _websocketClient, id: uniqueIdOnConnection, peers: {} };
        this.clients.push(freshlyConnectedClient);
      } catch (error) {
        console.error("Unhandled Exception SERVER: Sending ID to ClientDataType", error);
      }


      _websocketClient.on("message", (_message: string) => {
        this.serverDistributeMessageToAppropriateMethod(_message, _websocketClient);
      });

      _websocketClient.addEventListener("close", () => {
        console.error("Error at connection");
        for (let i: number = 0; i < this.clients.length; i++) {
          if (this.clients[i].connection === _websocketClient) {
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

  public parseMessageAndReturnObject = (_stringifiedMessage: string): Object => {
    let parsedMessage: Message.MessageBase = { originatorId: " ", messageType: Message.MESSAGE_TYPE.UNDEFINED };
    try {
      parsedMessage = JSON.parse(_stringifiedMessage);
      return parsedMessage;

    } catch (error) {
      console.error("Invalid JSON", error);
    }
    return parsedMessage;
  }

  // TODO Check if event.type can be used for identification instead => It cannot
  public serverDistributeMessageToAppropriateMethod(_message: string, _websocketClient: WebSocket): void {
    let objectifiedMessage: Message.MessageBase = <Message.MessageBase>this.parseMessageAndReturnObject(_message);
    if (!objectifiedMessage.messageType) {
      console.error("Unhandled Exception: Invalid Message Object received. Does it implement MessageBase?");
      return;
    }
    console.log(objectifiedMessage, _message);
    if (objectifiedMessage != null) {
      switch (objectifiedMessage.messageType) {
        case Message.MESSAGE_TYPE.ID_ASSIGNED:
          console.log("Id confirmation received for client: " + objectifiedMessage.originatorId);
          break;

        case Message.MESSAGE_TYPE.LOGIN_REQUEST:
          this.addUserOnValidLoginRequest(_websocketClient, <Message.LoginRequest>objectifiedMessage);
          break;

        case Message.MESSAGE_TYPE.CLIENT_TO_SERVER_MESSAGE:
          this.broadcastMessageToAllConnectedClients(<Message.ToClient>objectifiedMessage);
          break;

        default:
          console.log("WebSocket: Message type not recognized");
          break;

      }
    }
  }

  //#region MessageHandler
  public addUserOnValidLoginRequest(_websocketConnection: WebSocket, _messageData: Message.LoginRequest): void {
    let usernameTaken: boolean = true;
    usernameTaken = this.searchUserByUserNameAndReturnUser(_messageData.loginUserName, this.clients) != null;
    try {
      if (!usernameTaken) {
        const clientBeingLoggedIn: Client = this.searchUserByWebsocketConnectionAndReturnUser(_websocketConnection, this.clients);

        if (clientBeingLoggedIn != null) {
          clientBeingLoggedIn.name = _messageData.loginUserName;
          this.sendTo(_websocketConnection, new Message.LoginResponse(true, clientBeingLoggedIn.id, clientBeingLoggedIn.name));
        }
      } else {
        this.sendTo(_websocketConnection, new Message.LoginResponse(false, "", ""));
        usernameTaken = true;
        console.log("UsernameTaken");
      }
    } catch (error) {
      console.error("Unhandled Exception: Unable to create or send LoginResponse", error);
    }
  }

  public broadcastMessageToAllConnectedClients(_messageToBroadcast: Message.ToClient): void {
    let clientArray: WebSocket[] = Array.from(this.websocketServer.clients);

    clientArray.forEach(_client => {
      this.sendTo(_client, _messageToBroadcast);
    });
  }


  public searchForClientWithId(_idToFind: string): Client {
    return this.searchForPropertyValueInCollection(_idToFind, "id", this.clients);
  }

  public createID = (): string => {
    // Math.random should be random enough because of it's seed
    // convert to base 36 and pick the first few digits after comma
    return "_" + Math.random().toString(36).substr(2, 7);
  }
  //#endregion


  public parseMessageToJson(_messageToParse: string): Message.MessageBase {
    let parsedMessage: Message.MessageBase = { originatorId: " ", messageType: Message.MESSAGE_TYPE.UNDEFINED };

    try {
      parsedMessage = JSON.parse(_messageToParse);
    } catch (error) {
      console.error("Invalid JSON", error);
    }
    return parsedMessage;
  }

  public stringifyObjectToString = (_objectToStringify: Object): string => {
    return JSON.stringify(_objectToStringify);
  }


  public sendTo = (_connection: WebSocket, _message: Object) => {
    _connection.send(JSON.stringify(_message));
  }

  // Helper function for searching through a collection, finding objects by key and value, returning
  // Object that has that value
  // tslint:disable-next-line: no-any
  private searchForPropertyValueInCollection = (propertyValue: any, key: string, collectionToSearch: any[]) => {
    for (const propertyObject in collectionToSearch) {
      if (this.clients.hasOwnProperty(propertyObject)) {
        // tslint:disable-next-line: typedef
        const objectToSearchThrough = collectionToSearch[propertyObject];
        if (objectToSearchThrough[key] === propertyValue) {
          return objectToSearchThrough;
        }
      }
    }
    return null;
  }

  private searchUserByUserNameAndReturnUser = (_userNameToSearchFor: string, _collectionToSearch: Client[]): Client => {
    return this.searchForPropertyValueInCollection(_userNameToSearchFor, "userName", _collectionToSearch);
  }
  private searchUserByUserIdAndReturnUser = (_userIdToSearchFor: string, _collectionToSearch: Client[]): Client => {
    return this.searchForPropertyValueInCollection(_userIdToSearchFor, "id", _collectionToSearch);
  }

  private searchUserByWebsocketConnectionAndReturnUser = (_websocketConnectionToSearchFor: WebSocket, _collectionToSearch: Client[]) => {
    return this.searchForPropertyValueInCollection(_websocketConnectionToSearchFor, "clientConnection", _collectionToSearch);
  }
}