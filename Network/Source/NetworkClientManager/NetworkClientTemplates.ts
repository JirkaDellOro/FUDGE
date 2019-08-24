import * as FudgeNetwork from "../ModuleCollector";
export interface ClientTemplate {
    ownUserName?: string;

    getOwnClientId(): string;
    getOwnUserName(): string;
}

export interface WebSocketClientTemplate extends ClientTemplate {
    signalingServerConnectionUrl: string;
    webSocketConnectionToSignalingServer: WebSocket;

    addWsEventListeners(): void;
    connectToSpecifiedSignalingServer(): void;
    parseMessageAndCallCorrespondingMessageHandler(_receivedMessage: MessageEvent): void;
    sendMessage(_message: Object): void;

}

export interface MeshNetworkPeerConnection extends WebSocketClientTemplate {
    localPeerConnectionCollection: RTCPeerConnection[];


}
export interface PeerConnectionClientTemplate extends WebSocketClientTemplate {
    // More info from here https://developer.mozilla.org/en-US/docs/Web/API/RTCConfiguration
    readonly configuration: Object;
    ownPeerConnection: RTCPeerConnection;
    ownPeerDataChannel: RTCDataChannel | undefined;
    remoteEventPeerDataChannel: RTCDataChannel | undefined;
    isInitiator: boolean;

    sendMessageViaDirectPeerConnection(_messageToSend: string): void;
    sendDisconnectRequest(): void;
    createRTCPeerConnectionAndAddListeners(): void;
    initiateConnectionByCreatingDataChannelAndPreparingOffer(_userNameForOffer: string): void;
    createOfferMessageAndSendToRemote(_userNameForOffer: string): void;
    createAnswerAndSendToRemote(_remoteIdToAnswerTo: string): void;
    sendNewIceCandidatesToPeer(_candidate: Object): void;
    receiveOfferAndSetRemoteDescriptionThenCreateAndSendAnswer(_offerMessage: FudgeNetwork.NetworkMessageRtcOffer): void;
    receiveAnswerAndSetRemoteDescription(_localhostId: string, _answer: RTCSessionDescriptionInit): void;
    handleReceivedCandidate(_receivedIceMessage: FudgeNetwork.NetworkMessageIceCandidate): void;
    receiveDataChannel(_event: any): void;
    sendPeerMessageToServer(_messageToSend: string): void;
    dataChannelMessageHandler(_messageEvent: MessageEvent): void;
}