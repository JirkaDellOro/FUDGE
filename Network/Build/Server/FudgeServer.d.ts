import WebSocket from "ws";
import { FudgeNet } from "../../Build/Message.js";
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
    dispatch(_message: FudgeNet.Message): void;
    broadcast(_message: FudgeNet.Message): void;
    private addEventListeners;
    private handleMessage;
    private createMesh;
    private connectHost;
    private addUserOnValidLoginRequest;
    private sendRtcOfferToRequestedClient;
    private answerRtcOfferOfClient;
    private sendIceCandidatesToRelevantPeer;
    private createID;
    private heartbeat;
}
