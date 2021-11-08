///<reference path="../Messages.ts"/>
///<reference path="../../../Core/Build/FudgeCore.d.ts"/>
namespace FudgeClient {
  import ƒ = FudgeCore;

  export class FudgeClient extends EventTarget {
    public id: string;
    public name: string;
    public wsServerUrl: string | undefined = undefined;
    public wsServer!: WebSocket;
    public peers: { [id: string]: RtcConnection } = {};

    constructor() {
      super();
      this.name = "";
      this.id = "undefined";
    }

    public connectToServer = (_uri: string = "ws://localhost:8080") => {
      this.wsServerUrl = _uri;
      this.wsServer = new WebSocket(_uri);
      this.addWebSocketEventListeners();
    }

    public loginToServer = (_requestingUsername: string): void => {
      try {
        const loginMessage: Messages.LoginRequest = new Messages.LoginRequest(this.id, _requestingUsername);
        this.sendToServer(loginMessage);
      } catch (error) {
        ƒ.Debug.fudge("Unexpected error: Sending Login Request", error);
      }
    }

    public sendToServer = (_message: Messages.MessageBase): void => {
      let stringifiedMessage: string = _message.serialize();
      if (this.wsServer.readyState == 1) {
        this.wsServer.send(stringifiedMessage);
      }
      else {
        ƒ.Debug.fudge("Websocket Connection closed unexpectedly");
      }
    }

    public connectToPeer = (_idRemote: string): void => {
      if (this.peers[_idRemote])
        ƒ.Debug.warn("Peers already connected, ignoring request", this.id, _idRemote);
      else
        // this.idRemote = _idRemote;
        this.beginPeerConnectionNegotiation(_idRemote);
    }

    public sendToPeer = (_idRemote: string, _message: object) => {
      let message: Messages.PeerToPeer = new Messages.PeerToPeer(this.id, JSON.stringify(_message));
      let dataChannel: RTCDataChannel | undefined = this.peers[_idRemote].dataChannel;

      if (dataChannel && dataChannel.readyState == "open")
        dataChannel.send(message.serialize());
      else {
        console.error("Datachannel: Connection unexpectedly lost");
      }
    }

    public sendToAllPeers = (_message: object) => {
      for (let idPeer in this.peers) {
        this.sendToPeer(idPeer, _message);
      }
    }
    // ----------------------


    private addWebSocketEventListeners = (): void => {
      try {
        this.wsServer.addEventListener(EVENT.CONNECTION_OPENED, (_connOpen: Event) => {
          ƒ.Debug.fudge("Connected to the signaling server", _connOpen);
        });

        // this.wsServer.addEventListener("error", (_err: Event) => {
        // });

        this.wsServer.addEventListener(EVENT.MESSAGE_RECEIVED, (_receivedMessage: MessageEvent) => {
          this.parseMessageAndHandleMessageType(_receivedMessage);
        });
      } catch (error) {
        ƒ.Debug.fudge("Unexpected Error: Adding websocket Eventlistener", error);
      }
    }

    private parseMessageAndHandleMessageType = (_receivedMessage: MessageEvent) => {
      let message: Messages.MessageBase = Messages.MessageBase.deserialize(_receivedMessage.data);

      switch (message.messageType) {
        case Messages.MESSAGE_TYPE.ID_ASSIGNED:
          ƒ.Debug.fudge("ID received", (<Messages.IdAssigned>message).assignedId);
          this.assignIdAndSendConfirmation(<Messages.IdAssigned>message);
          break;

        case Messages.MESSAGE_TYPE.LOGIN_RESPONSE:
          this.loginValidAddUser(message.idSource, (<Messages.LoginResponse>message).loginSuccess, (<Messages.LoginResponse>message).originatorUsername);
          break;

        case Messages.MESSAGE_TYPE.SERVER_HEARTBEAT:
          this.dispatchEvent(new CustomEvent(EVENT.MESSAGE_RECEIVED, { detail: message }));
          break;

        case Messages.MESSAGE_TYPE.CLIENT_TO_SERVER:
        case Messages.MESSAGE_TYPE.SERVER_TO_CLIENT:
          this.dispatchEvent(new CustomEvent(EVENT.MESSAGE_RECEIVED, { detail: message }));
          break;

        case Messages.MESSAGE_TYPE.RTC_OFFER:
          // ƒ.Debug.fudge("Received offer, current signaling state: ", this.connection.signalingState);
          this.receiveNegotiationOfferAndSetRemoteDescription(<Messages.RtcOffer>message);
          break;

        case Messages.MESSAGE_TYPE.RTC_ANSWER:
          // ƒ.Debug.fudge("Received answer, current signaling state: ", this.connection.signalingState);
          this.receiveAnswerAndSetRemoteDescription(<Messages.RtcAnswer>message);
          break;

        case Messages.MESSAGE_TYPE.ICE_CANDIDATE:
          // ƒ.Debug.fudge("Received candidate, current signaling state: ", this.connection.signalingState);
          this.addReceivedCandidateToPeerConnection(<Messages.IceCandidate>message);
          break;
      }
    }

    private beginPeerConnectionNegotiation = (_idRemote: string): void => {
      try {
        this.peers[_idRemote] = new RtcConnection();
        this.peers[_idRemote].createDataChannel(this, _idRemote);
      } catch (error) {
        console.error("Unexpected Error: Creating Client Datachannel and adding Listeners", error);
      }

      let peerConnection: RTCPeerConnection = this.peers[_idRemote].peerConnection;
      peerConnection.addEventListener(
        "icecandidate", (_event: RTCPeerConnectionIceEvent) => this.sendIceCandidatesToPeer(_event.candidate, _idRemote)
      );

      peerConnection.createOffer()
        .then(async (offer) => {
          ƒ.Debug.fudge("Local: createOffer, expected 'stable', got:  ", peerConnection.signalingState);
          return offer;
        })
        .then(async (offer) => {
          await peerConnection.setLocalDescription(offer);
          ƒ.Debug.fudge("Local: setDescription, expected 'have-local-offer', got:  ", peerConnection.signalingState);
        })
        .then(() => {
          this.createNegotiationOfferAndSendToPeer(_idRemote);
        })
        .catch((error) => {
          console.error("Unexpected Error: Creating RTCOffer", error);
        });

    }


    private createNegotiationOfferAndSendToPeer = (_idRemote: string) => {
      try {
        let peerConnection: RTCPeerConnection = this.peers[_idRemote].peerConnection;
        const offerMessage: Messages.RtcOffer = new Messages.RtcOffer(this.id, _idRemote, peerConnection.localDescription);
        this.sendToServer(offerMessage);
        ƒ.Debug.fudge("Local: send offer, expected 'have-local-offer', got:  ", peerConnection.signalingState);
      } catch (error) {
        console.error("Unexpected Error: Creating Object and Sending RTC Offer", error);
      }
    }

    private receiveNegotiationOfferAndSetRemoteDescription = (_offerMessage: Messages.RtcOffer): void => {
      ƒ.Debug.fudge("Remote: offer received, create connection", _offerMessage);
      let peer: RtcConnection = this.peers[_offerMessage.idSource] || (this.peers[_offerMessage.idSource] = new RtcConnection());
      let peerConnection: RTCPeerConnection = peer.peerConnection;
      peerConnection.addEventListener(
        "datachannel", (_event: RTCDataChannelEvent) => this.receiveDataChannelAndEstablishConnection(_event, peer)
      );

      let offerToSet: RTCSessionDescription | RTCSessionDescriptionInit | null | undefined = _offerMessage.offer;
      if (!offerToSet) {
        return;
      }

      peerConnection.setRemoteDescription(new RTCSessionDescription(offerToSet))
        .then(async () => {
          ƒ.Debug.fudge("Remote: set remote descripton, expected 'have-remote-offer', got:  ", peerConnection.signalingState);
          this.answerNegotiationOffer(_offerMessage.idSource);
        })
        .catch((error) => {
          console.error("Unexpected Error: Setting Remote Description and Creating Answer", error);
        });
      ƒ.Debug.fudge("Remote: remote description set, expected 'stable', got:  ", peerConnection.signalingState);
    }




    private answerNegotiationOffer = (_idRemote: string) => {
      let ultimateAnswer: RTCSessionDescription;
      let peerConnection: RTCPeerConnection = this.peers[_idRemote]?.peerConnection;

      // Signaling example from here https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/createAnswer
      peerConnection.createAnswer()
        .then(async (answer) => {
          ƒ.Debug.fudge("Remote: create answer, expected 'have-remote-offer', got:  ", peerConnection.signalingState);
          ultimateAnswer = new RTCSessionDescription(answer);
          return await peerConnection.setLocalDescription(ultimateAnswer);
        }).then(async () => {
          ƒ.Debug.fudge("Remote: create answer function, expected 'stable', got:  ", peerConnection.signalingState);

          const answerMessage: Messages.RtcAnswer = new Messages.RtcAnswer(this.id, _idRemote, ultimateAnswer);
          ƒ.Debug.fudge("Remote: send answer to server ", answerMessage);
          this.sendToServer(answerMessage);
        })
        .catch((error) => {
          console.error("Unexpected error: Creating RTC Answer failed", error);
        });
    }

    private receiveAnswerAndSetRemoteDescription = (_message: Messages.RtcAnswer) => {
      try {
        ƒ.Debug.fudge("Local: received answer, create data channel ", _message);
        let descriptionAnswer: RTCSessionDescription = new RTCSessionDescription(_message.answer);
        this.peers[_message.idSource].peerConnection.setRemoteDescription(descriptionAnswer);
        this.peers[_message.idSource].createDataChannel(this, _message.idSource);
      } catch (error) {
        console.error("Unexpected Error: Setting Remote Description from Answer", error);
      }
    }

    private sendIceCandidatesToPeer = (_candidate: RTCIceCandidate | null, _idRemote: string) => {
      if (!_candidate)
        return;
      try {
        ƒ.Debug.fudge("Local: send ICECandidates to server");
        let message: Messages.IceCandidate = new Messages.IceCandidate(this.id, _idRemote, _candidate);
        this.sendToServer(message);
      } catch (error) {
        console.error("Unexpected Error: Creating and Sending ICECandidates to Peer", error);
      }
    }

    private addReceivedCandidateToPeerConnection = async (_message: Messages.IceCandidate) => {
      ƒ.Debug.fudge("Remote: try to add candidate to peer connection");
      if (_message.candidate) {
        try {
          await this.peers[_message.idSource].peerConnection.addIceCandidate(_message.candidate);
        } catch (error) {
          console.error("Unexpected Error: Adding Ice Candidate", error);
        }
      }
    }


    private receiveDataChannelAndEstablishConnection = (_event: RTCDataChannelEvent, _peer: RtcConnection) => {
      ƒ.Debug.fudge("Remote: establish channel on connection", _event.channel);
      if (_event.channel) {
        _peer.addDataChannel(this, _event.channel);
      }
      else {
        console.error("Unexpected Error: RemoteDatachannel");
      }
    }

    private loginValidAddUser = (_assignedId: string, _loginSuccess: boolean, _originatorUserName: string): void => {
      if (_loginSuccess) {
        this.name = _originatorUserName;
        ƒ.Debug.fudge("Logged in to server as: " + this.name, this.id);
      } else {
        ƒ.Debug.fudge("Login failed, username taken", this.name, this.id);
      }
    }

    private assignIdAndSendConfirmation = (_message: Messages.IdAssigned) => {
      try {
        this.id = _message.assignedId;
        this.sendToServer(new Messages.IdAssigned(this.id));
      } catch (error) {
        ƒ.Debug.fudge("Unexpected Error: Sending ID Confirmation", error);
      }
    }
  }
}