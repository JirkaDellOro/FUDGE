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
      // { urls: "stun:stun2.1.google.com:19302" }
      // { urls: "stun:stun.example.com" }
      { urls: "stun:stun.l.google.com:19302" }
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
      // {
      //   urls: "stun:stun.stunprotocol.org"
      // }
      // {
      //   urls: "turn:numb.viagenie.ca",
      //   credential: "muazkh",
      //   username: "webrtc@live.com"
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

  // TODO: use extension instead of decorator pattern
  export class Rtc extends RTCPeerConnection {
    public dataChannel: RTCDataChannel | undefined;
    // TODO: use mediaStream in the future? 
    public mediaStream: MediaStream | undefined;

    constructor() {
      super(configuration);
      this.addEventListener(
        "signalingstatechange", (_event: Event) => this.logState("Signaling state change", _event)
      );
      this.addEventListener(
        "connectionstatechange", (_event: Event) => this.logState("Connection state change", _event)
      );
    }

    public setupDataChannel = (_client: FudgeClient, _idRemote: string): void => {
      let newDataChannel: RTCDataChannel = this.createDataChannel(_client.id + "->" + _idRemote /* , { negotiated: true, id: 0 } */);
      console.warn("Created data channel");
      this.addDataChannel(_client, newDataChannel);
    }

    public addDataChannel = (_client: FudgeClient, _dataChannel: RTCDataChannel): void => {
      console.warn("AddDataChannel", _dataChannel.id, _dataChannel.label);
      this.dataChannel = _dataChannel;
      this.dataChannel.addEventListener(EVENT.CONNECTION_OPENED, dispatchRtcEvent);
      this.dataChannel.addEventListener(EVENT.CONNECTION_CLOSED, dispatchRtcEvent);
      this.dataChannel.addEventListener(EVENT.MESSAGE_RECEIVED, _client.hndMessage);

      function dispatchRtcEvent(this: RTCDataChannel, _event: Event): void {
        _client.dispatchEvent(new CustomEvent(EVENT.MESSAGE_RECEIVED, { detail: _event }));
      }
    }

    public send = (_message: string): void => {
      if (this.dataChannel && this.dataChannel.readyState == "open")
        this.dataChannel.send(_message);
      else {
        // console.warn(`Can't send message on ${this.dataChannel?.id}, status ${this.dataChannel?.readyState}, message ${_message}`);
      }
    }

    private logState = (_type: string, _event: Event): void => {
      let target: RTCPeerConnection = <RTCPeerConnection>_event.target;
      let state: Object = { type: _type, connection: target.connectionState, iceState: target.iceConnectionState, iceGather: target.iceGatheringState };
      console.table(state);
    }
  }
}