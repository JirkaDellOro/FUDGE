import * as FudgeNetwork from "../ModuleCollector";
import WebSocket from "ws";

export interface WSServer {
    websocketServer: WebSocket.Server;
    connectedClientsCollection: FudgeNetwork.ClientDataType[];

    createID(): string;
    parseMessageToJson(_messageToParse: string): FudgeNetwork.NetworkMessageMessageBase;
    startUpServer(serverPort?: number): void;
    closeDownServer(): void;
    addServerEventHandling(): void;
    serverDistributeMessageToAppropriateMethod(_message: string, _websocketClient: WebSocket): void;
}
export interface SignalingServer extends WSServer {
    sendRtcOfferToRequestedClient(_websocketClient: WebSocket, _messageData: FudgeNetwork.NetworkMessageRtcOffer): void;
    answerRtcOfferOfClient(_websocketClient: WebSocket, _messageData: FudgeNetwork.NetworkMessageRtcAnswer): void;
    sendIceCandidatesToRelevantPeer(_websocketClient: WebSocket, _messageData: FudgeNetwork.NetworkMessageIceCandidate): void;
}

export interface MeshNetworkSignalingServer extends SignalingServer {
    setClientReadyFlag(_clientId: string): void;
    checkIfAllClientsReady(): boolean;
    sendClientListToClient(): void;


}