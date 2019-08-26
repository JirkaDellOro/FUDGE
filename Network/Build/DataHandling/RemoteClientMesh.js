"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class RemoteClientMesh {
    constructor(_remoteId, _rtcPeerConnection, _rtcDataChannel, _rtcMediaStream) {
        this.remoteId = _remoteId || "";
        this.rtcPeerConnection = _rtcPeerConnection || new RTCPeerConnection();
        this.rtcDataChannel = _rtcDataChannel || this.rtcPeerConnection.createDataChannel("error");
        this.rtcMediaStream = _rtcMediaStream;
    }
}
exports.RemoteClientMesh = RemoteClientMesh;
