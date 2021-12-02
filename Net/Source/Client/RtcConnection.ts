namespace FudgeNet {
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
      // { urls: "stun:stun.l.google.com:19302" },
      // { urls: "turn:0.peerjs.com:3478", username: "peerjs", credential: "peerjsp" }
      // {
      //   urls: "turn:192.158.29.39:3478?transport=udp",
      //   credential: "JZEOEt2V3Qb0y27GRntt2u2PAYA=",
      //   username: "28224511:1379330808"
      // }
      // { urls: "stun:relay.backups.cz" },
      // {
      //   urls: "turn:relay.backups.cz",
      //   credential: "webrtc",
      //   username: "webrtc"
      // },
      // {
      //   urls: "turn:relay.backups.cz?transport=tcp",
      //   credential: "webrtc",
      //   username: "webrtc"
      // }
    ]

  };

  /**
   * Manages a single rtc peer-to-peer connection with multiple channels.  
   * {@link FudgeNet.Message}s are passed on from the client using this connection
   * for further processing by some observer. Instances of this class are
   * used internally by the {@link FudgeClient} and should not be used otherwise.
   * @author Jirka Dell'Oro-Friedl, HFU, 2021
   */
  export class Rtc {
    public peerConnection: RTCPeerConnection;
    public dataChannel: RTCDataChannel | undefined;
    // TODO: use mediaStream in the future? 
    public mediaStream: MediaStream | undefined;

    constructor() {
      this.peerConnection = new RTCPeerConnection(configuration);
      this.peerConnection.addEventListener(
        "signalingstatechange", (_event: Event) => this.logState("Signaling state change", _event)
      );
      this.peerConnection.addEventListener(
        "connectionstatechange", (_event: Event) => this.logState("Connection state change", _event)
      );
    }

    public createDataChannel(_client: FudgeClient, _idRemote: string): void {
      this.addDataChannel(_client, this.peerConnection.createDataChannel(_client.id + "->" + _idRemote, { negotiated: true, id: 0 }));
    }

    public addDataChannel(_client: FudgeClient, _dataChannel: RTCDataChannel): void {
      this.dataChannel = _dataChannel;
      this.dataChannel.addEventListener(EVENT.CONNECTION_OPENED, dispatchRtcEvent);
      this.dataChannel.addEventListener(EVENT.CONNECTION_CLOSED, dispatchRtcEvent);
      this.dataChannel.addEventListener(EVENT.MESSAGE_RECEIVED, _client.hndMessage);

      function dispatchRtcEvent(this: RTCDataChannel, _event: Event): void {
        _client.dispatchEvent(new CustomEvent(EVENT.MESSAGE_RECEIVED, { detail: _event }));
      }
    }

    private logState(_type: string, _event: Event): void {
      let target: RTCPeerConnection = <RTCPeerConnection>_event.target;
      let state: Object = { type: _type, connection: target.connectionState, iceState: target.iceConnectionState, iceGather: target.iceGatheringState };
      console.table(state);
    }
  }
}