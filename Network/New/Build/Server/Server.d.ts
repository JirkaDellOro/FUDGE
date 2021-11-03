import WebSocket from "ws";
import * as Message from "./Messages.js";
declare enum CONNECTION {
    TCP = 0,
    RTC = 1
}
export interface Client {
    id: string;
    name?: string;
    connection: WebSocket;
    peers: {
        [id: string]: CONNECTION[];
    };
}
export declare class FudgeServer {
    websocketServer: WebSocket.Server;
    clients: Client[];
    startUpServer: (_serverPort?: number) => void;
    closeDownServer: () => void;
    addServerEventHandling: () => void;
    serverDistributeMessageToAppropriateMethod(_message: string, _websocketClient: WebSocket): void;
    addUserOnValidLoginRequest(_websocketConnection: WebSocket, _messageData: Message.LoginRequest): void;
    broadcastMessageToAllConnectedClients(_messageToBroadcast: Message.ToClient): void;
    searchForClientWithId(_idToFind: string): Client;
    createID: () => string;
    parseMessageToJson(_messageToParse: string): Message.MessageBase;
    stringifyObjectToString: (_objectToStringify: Object) => string;
    sendTo: (_connection: WebSocket, _message: Object) => void;
    private searchForPropertyValueInCollection;
    private searchUserByUserNameAndReturnUser;
    private searchUserByUserIdAndReturnUser;
    private searchUserByWebsocketConnectionAndReturnUser;
}
export {};
