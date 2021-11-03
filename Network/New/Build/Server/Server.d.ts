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
    wsServer: WebSocket.Server;
    clients: Client[];
    startUp: (_port?: number) => void;
    closeDown: () => void;
    addEventListeners: () => void;
    handleMessage(_message: string, _wsConnection: WebSocket): void;
    addUserOnValidLoginRequest(_wsConnection: WebSocket, _message: Message.LoginRequest): void;
    broadcastMessageToAllConnectedClients(_message: Message.ToClient): void;
    sendRtcOfferToRequestedClient(_wsConnection: WebSocket, _message: Message.RtcOffer): void;
    answerRtcOfferOfClient(_wsConnection: WebSocket, _message: Message.RtcAnswer): void;
    sendIceCandidatesToRelevantPeer(_wsConnection: WebSocket, _message: Message.IceCandidate): void;
    createID: () => string;
}
export {};
