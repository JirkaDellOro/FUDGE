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
    dispatch(_message: Messages.NetMessage): void;
    private addEventListeners;
    private handleMessage;
    private receive;
    private addUserOnValidLoginRequest;
    private broadcastMessageToAllConnectedClients;
    private sendRtcOfferToRequestedClient;
    private answerRtcOfferOfClient;
    private sendIceCandidatesToRelevantPeer;
    private createID;
    private heartbeat;
}
