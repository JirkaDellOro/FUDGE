namespace FudgeClient {
  import ƒ = FudgeCore;
  // More info from here https://developer.mozilla.org/en-US/docs/Web/API/RTCConfiguration
  // tslint:disable-next-line: typedef
  export let configuration = {
    iceServers: [
      { urls: "stun:stun2.1.google.com:19302" },
      { urls: "stun:stun.example.com" }
    ]
  };

  export class RtcConnection {
    // TODO: figure out if it makes sense to create all these connections... RTCPeerConnection is undefined.
    public peerConnection: RTCPeerConnection;
    public dataChannel: RTCDataChannel | undefined;
    public mediaStream: MediaStream | undefined;

    constructor() {
      this.peerConnection = new RTCPeerConnection(configuration);
    }

    public createDataChannel(_client: FudgeClient, _idRemote: string): void {
      this.dataChannel = this.peerConnection.createDataChannel(_client.id + "->" + _idRemote);

      this.dataChannel.addEventListener("open", dispatchRtcEvent);
      this.dataChannel.addEventListener("close", dispatchRtcEvent);
      this.dataChannel.addEventListener("message", dispatchMessage);

      function dispatchRtcEvent(this: RTCDataChannel, _event: Event): void {
        _client.dispatchEvent(new CustomEvent("receive", { detail: _event }));
      }

      function dispatchMessage(_messageEvent: MessageEvent): void {
        let message: Messages.PeerSimpleText = JSON.parse(_messageEvent.data);
        ƒ.Debug.fudge("Received", _messageEvent.type, message);
        _client.dispatchEvent(new CustomEvent("receive", { detail: message }));
      }
    }
  }
}