import * as FudgeNetwork from "../ModuleCollector";
export interface ClientTemplate {
    localUserName?: string;
    localClientID: string;

    getLocalClientId(): string;
    getLocalUserName(): string;
}

export interface WebSocketClientManager extends ClientTemplate {
    signalingServerConnectionUrl: string;
    webSocketConnectionToSignalingServer: WebSocket;

    addWebSocketEventListeners(): void;
    connectToSignalingServer(): void;
    parseMessageAndHandleMessageType(_receivedMessage: MessageEvent): void;
    sendMessageToSignalingServer(_message: Object): void;

}

export interface MeshNetworkPeerConnectionManager extends WebSocketClientManager {
    localPeerConnectionCollection: RTCPeerConnection[];

    readonly configuration: Object;
    peerConnectionCollection: RTCPeerConnection[];
    isInitiator: boolean;

    sendMessageToSingularPeer(_messageToSend: string, _peerId: string): void;
    sendDisconnectRequest(): void;
    createRTCPeerConnectionAndAddEventListeners(): void;
    beginPeerConnectionNegotiation(_userNameForOffer: string): void;
    createNegotiationOfferAndSendToPeer(_userNameForOffer: string): void;
    answerNegotiationOffer(_remoteIdToAnswerTo: string): void;
    sendIceCandidatesToPeer(_candidate: Object): void;
    receiveNegotiationOfferAndSetRemoteDescription(_offerMessage: FudgeNetwork.NetworkMessageRtcOffer): void;
    receiveAnswerAndSetRemoteDescription(_localhostId: string, _answer: RTCSessionDescriptionInit): void;
    addReceivedCandidateToPeerConnection(_receivedIceMessage: FudgeNetwork.NetworkMessageIceCandidate): void;
    receiveDataChannelAndEstablishConnection(_event: any): void;
    sendMessageToServerViaDataChannel(_messageToSend: string): void;
    dataChannelMessageHandler(_messageEvent: MessageEvent): void;
}
export interface SinglePeerConnectionClientManager extends WebSocketClientManager {
    // More info from here https://developer.mozilla.org/en-US/docs/Web/API/RTCConfiguration
    readonly configuration: Object;
    ownPeerConnection: RTCPeerConnection;
    ownPeerDataChannel: RTCDataChannel | undefined;
    remoteEventPeerDataChannel: RTCDataChannel | undefined;
    isInitiator: boolean;

    sendMessageToSingularPeer(_messageToSend: string): void;
    sendDisconnectRequest(): void;
    createRTCPeerConnectionAndAddEventListeners(): void;
    beginPeerConnectionNegotiation(_userNameForOffer: string): void;
    createNegotiationOfferAndSendToPeer(_userNameForOffer: string): void;
    answerNegotiationOffer(_remoteIdToAnswerTo: string): void;
    sendIceCandidatesToPeer(_candidate: Object): void;
    receiveNegotiationOfferAndSetRemoteDescription(_offerMessage: FudgeNetwork.NetworkMessageRtcOffer): void;
    receiveAnswerAndSetRemoteDescription(_localhostId: string, _answer: RTCSessionDescriptionInit): void;
    addReceivedCandidateToPeerConnection(_receivedIceMessage: FudgeNetwork.NetworkMessageIceCandidate): void;
    receiveDataChannelAndEstablishConnection(_event: any): void;
    sendMessageToServerViaDataChannel(_messageToSend: string): void;
    dataChannelMessageHandler(_messageEvent: MessageEvent): void;
}
