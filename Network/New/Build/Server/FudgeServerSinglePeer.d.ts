import WebSocket from "ws";
import * as FudgeNetwork from "../ModuleCollectorServer.js";
export declare class FudgeServerSinglePeer implements FudgeNetwork.SignalingServer {
    websocketServer: WebSocket.Server;
    connectedClientsCollection: FudgeNetwork.ClientDataType[];
    startUpServer: (_serverPort?: number) => void;
    closeDownServer: () => void;
    addServerEventHandling: () => void;
    parseMessageAndReturnObject: (_stringifiedMessage: string) => Object;
    serverDistributeMessageToAppropriateMethod(_message: string, _websocketClient: WebSocket): void;
    addUserOnValidLoginRequest(_websocketConnection: WebSocket, _messageData: FudgeNetwork.NetworkMessageLoginRequest): void;
    sendRtcOfferToRequestedClient(_websocketClient: WebSocket, _messageData: FudgeNetwork.NetworkMessageRtcOffer): void;
    answerRtcOfferOfClient(_websocketClient: WebSocket, _messageData: FudgeNetwork.NetworkMessageRtcAnswer): void;
    sendIceCandidatesToRelevantPeer(_websocketClient: WebSocket, _messageData: FudgeNetwork.NetworkMessageIceCandidate): void;
    searchForClientWithId(_idToFind: string): FudgeNetwork.ClientDataType;
    createID: () => string;
    parseMessageToJson(_messageToParse: string): FudgeNetwork.NetworkMessageMessageBase;
    sendTo: (_connection: any, _message: Object) => void;
    private searchForPropertyValueInCollection;
    private searchUserByUserNameAndReturnUser;
    private searchUserByUserIdAndReturnUser;
    private searchUserByWebsocketConnectionAndReturnUser;
}
