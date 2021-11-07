namespace FudgeClient {
  export class RtcConnection {
    public idRemote: string = "";
    // TODO: figure out if it makes sense to create all these connections... RTCPeerConnection is undefined.
    public dataChannel: RTCDataChannel | undefined;
    public peerConnection: RTCPeerConnection | undefined;
    public mediaStream: MediaStream | undefined;
  }
}