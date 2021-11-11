namespace FudgeClient {
  import ƒ = FudgeCore;

  export enum EVENT {
    CONNECTION_OPENED = "open",
    CONNECTION_CLOSED = "close",
    ERROR = "error",
    MESSAGE_RECEIVED = "message"
  }

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
      this.addDataChannel(_client, this.peerConnection.createDataChannel(_client.id + "->" + _idRemote));
    }

    public addDataChannel(_client: FudgeClient, _dataChannel: RTCDataChannel): void {
      this.dataChannel = _dataChannel;
      this.dataChannel.addEventListener(EVENT.CONNECTION_OPENED, dispatchRtcEvent);
      this.dataChannel.addEventListener(EVENT.CONNECTION_CLOSED, dispatchRtcEvent);
      this.dataChannel.addEventListener(EVENT.MESSAGE_RECEIVED, dispatchMessage);

      function dispatchRtcEvent(this: RTCDataChannel, _event: Event): void {
        _client.dispatchEvent(new CustomEvent(EVENT.MESSAGE_RECEIVED, { detail: _event }));
      }

      function dispatchMessage(_event: MessageEvent): void {
        _client.dispatchEvent(new MessageEvent(_event.type, <MessageEventInit<unknown>><unknown>_event));
        // let message: Messages.NetMessage = JSON.parse(_messageEvent.data);
        // ƒ.Debug.fudge("Received message from peer ", message.idSource);
        // //TODO: dispatch copy of this event or have user register listener herself
        // _client.dispatchEvent(new CustomEvent(EVENT.MESSAGE_RECEIVED, { detail: message }));
      }
    }
  }
}