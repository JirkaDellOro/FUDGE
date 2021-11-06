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
        // TODO: cleanup Node workaround... the server doesn't know RTC
        this.rtcPeerConnection = _rtcPeerConnection || (typeof process == "undefined" ? new RTCPeerConnection() : undefined);
        this.rtcDataChannel = _rtcDataChannel || (typeof process == "undefined" ? this.rtcPeerConnection?.createDataChannel("error") : undefined);
        this.rtcMediaStream = _rtcMediaStream;
        this.clientConnection = websocketConnection || null;
        this.isPeerMeshReady = false;
        // this.connectedRoom = connectedToRoom || null;
    }
}
