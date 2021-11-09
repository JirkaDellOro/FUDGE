import WebSocket from "ws";
import { Messages } from "../../Build/Messages.js";
export interface Client {
    id: string;
    name?: string;
    socket?: WebSocket;
    peers: string[];
}
export declare class FudgeServer {
    socket: WebSocket.Server;
    clients: {
        [id: string]: Client;
    };
    startUp: (_port?: number) => void;
    closeDown: () => void;
    addEventListeners: () => void;
    handleMessage(_message: string, _wsConnection: WebSocket): Promise<void>;
    receive(_message: Messages.ToServer): Promise<void>;
    addUserOnValidLoginRequest(_wsConnection: WebSocket, _message: Messages.LoginRequest): void;
    broadcastMessageToAllConnectedClients(_message: Messages.ToClient): void;
    sendRtcOfferToRequestedClient(_wsConnection: WebSocket, _message: Messages.RtcOffer): void;
    answerRtcOfferOfClient(_wsConnection: WebSocket, _message: Messages.RtcAnswer): void;
    sendIceCandidatesToRelevantPeer(_wsConnection: WebSocket, _message: Messages.IceCandidate): void;
    createID: () => string;
    private heartbeat;
}
