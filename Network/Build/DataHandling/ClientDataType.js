export class ClientDataType {
    clientConnection;
    id;
    userName;
    // TODO: figure out if it makes sense to create all these connections... RTCPeerConnection is undefined.
    rtcPeerConnection;
    rtcDataChannel;
    isPeerMeshReady;
    rtcMediaStream;
    constructor(websocketConnection, _remoteId, _rtcPeerConnection, _rtcDataChannel, _rtcMediaStream, _userName) {
        this.id = _remoteId || "";
        this.userName = _userName || "";
        this.rtcPeerConnection = _rtcPeerConnection /*  || new RTCPeerConnection() */;
        this.rtcDataChannel = _rtcDataChannel /* || this.rtcPeerConnection.createDataChannel("error") */;
        this.rtcMediaStream = _rtcMediaStream;
        this.clientConnection = websocketConnection || null;
        this.isPeerMeshReady = false;
        // this.connectedRoom = connectedToRoom || null;
    }
}
