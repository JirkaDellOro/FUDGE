export class ClientDataType {

    public clientConnection: WebSocket | null;
    public id: string;
    public userName: string;
    public rtcPeerConnection: RTCPeerConnection;
    public rtcDataChannel: RTCDataChannel;
    public isPeerMeshReady: boolean;
    rtcMediaStream: MediaStream | undefined;

    constructor(websocketConnection?: WebSocket, _remoteId?: string, _rtcPeerConnection?: RTCPeerConnection, _rtcDataChannel?: RTCDataChannel, _rtcMediaStream?: MediaStream, _userName?: string) {
        this.id = _remoteId || "";
        this.userName = _userName || "";
        this.rtcPeerConnection = _rtcPeerConnection || new RTCPeerConnection();
        this.rtcDataChannel = _rtcDataChannel || this.rtcPeerConnection.createDataChannel("error");
        this.rtcMediaStream = _rtcMediaStream;
        this.clientConnection = websocketConnection || null;
        this.isPeerMeshReady = false;
        // this.connectedRoom = connectedToRoom || null;
    }
}
