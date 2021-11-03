/// <reference path="Messages.d.ts" />
import WebSocket from "ws";
import { Messages } from "../../Build/Messages.js";
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
    addUserOnValidLoginRequest(_wsConnection: WebSocket, _message: Messages.LoginRequest): void;
    broadcastMessageToAllConnectedClients(_message: Messages.ToClient): void;
    sendRtcOfferToRequestedClient(_wsConnection: WebSocket, _message: Messages.RtcOffer): void;
    answerRtcOfferOfClient(_wsConnection: WebSocket, _message: Messages.RtcAnswer): void;
    sendIceCandidatesToRelevantPeer(_wsConnection: WebSocket, _message: Messages.IceCandidate): void;
    createID: () => string;
}
export {};
