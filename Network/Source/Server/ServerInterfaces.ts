import * as FudgeNetwork from "./../ModuleCollector";
import WebSocket from "ws";

export interface SignalingServer {
    websocketServer: WebSocket.Server;
    connectedClientsCollection: FudgeNetwork.Client[];

    startUpServer(serverPort?: number): void;
    closeDownServer(): void;
    addServerEventHandling(): void;
    serverDistributeMessageToAppropriateMethod(_message: string, _websocketClient: WebSocket): void;

    sendRtcOfferToRequestedClient(_websocketClient: WebSocket, _messageData: FudgeNetwork.NetworkMessageRtcOffer): void;
    answerRtcOfferOfClient(_websocketClient: WebSocket, _messageData: FudgeNetwork.NetworkMessageRtcAnswer): void;
    sendIceCandidatesToRelevantPeers(_websocketClient: WebSocket, _messageData: FudgeNetwork.NetworkMessageIceCandidate): void;

}