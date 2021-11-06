export class ClientDataType {
  public clientConnection: WebSocket | null;
  public id: string;
  public userName: string;
  // TODO: figure out if it makes sense to create all these connections... RTCPeerConnection is undefined.
  public rtcPeerConnection: RTCPeerConnection | undefined;
  public rtcDataChannel: RTCDataChannel | undefined;
  public isPeerMeshReady: boolean;
  rtcMediaStream: MediaStream | undefined;

  constructor(websocketConnection?: WebSocket, _remoteId?: string, _rtcPeerConnection?: RTCPeerConnection, _rtcDataChannel?: RTCDataChannel, _rtcMediaStream?: MediaStream, _userName?: string) {
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
