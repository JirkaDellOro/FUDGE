///<reference path="../Message.ts"/>
///<reference path="../../../Core/Build/FudgeCore.d.ts"/>
namespace FudgeNet {
  import ƒ = FudgeCore;

  export class FudgeClient extends EventTarget {
    public id: string;
    public name: string;
    public urlServer: string | undefined = undefined;
    public socket!: WebSocket;
    public peers: { [id: string]: RtcConnection } = {};

    constructor() {
      super();
      this.name = "";
      this.id = "undefined";
    }

    public connectToServer = (_uri: string = "ws://localhost:8080") => {
      this.urlServer = _uri;
      this.socket = new WebSocket(_uri);
      this.addWebSocketEventListeners();
    }

    public loginToServer = (_name: string): void => {
      try {
        let message: FudgeNet.Message = {
          command: FudgeNet.COMMAND.LOGIN_REQUEST, route: FudgeNet.ROUTE.SERVER, content: { name: _name }
        };
        this.dispatch(message);
      } catch (error) {
        ƒ.Debug.fudge("Unexpected error: Sending Login Request", error);
      }
    }

    public connectToPeer = (_idRemote: string): void => {
      if (this.peers[_idRemote])
        ƒ.Debug.warn("Peers already connected, ignoring request", this.id, _idRemote);
      else
        this.beginPeerConnectionNegotiation(_idRemote);
    }

    public dispatch(_message: FudgeNet.Message): void {
      _message.timeSender = Date.now();
      _message.idSource = this.id;
      let message: string = JSON.stringify(_message);
      try {
        if (!_message.route || _message.route == FudgeNet.ROUTE.HOST) {
          // send via RTC to specific peer (if idTarget set), all peers (if not set) or host (if route set to host)
          if (_message.idTarget)
            this.sendToPeer(_message.idTarget, message);
          else
            this.sendToAllPeers(message);
        } else {
          this.socket.send(message);
        }
      } catch (_error) {
        console.log(_error);
      }
    }
    // ----------------------

    private sendToPeer = (_idPeer: string, _message: string) => {
      let dataChannel: RTCDataChannel | undefined = this.peers[_idPeer].dataChannel;
      if (dataChannel && dataChannel.readyState == "open")
        dataChannel.send(_message);
      else {
        console.error("Datachannel: Connection unexpectedly lost");
      }
    }

    private sendToAllPeers = (_message: string) => {
      for (let idPeer in this.peers) {
        this.sendToPeer(idPeer, _message);
      }
    }

    private addWebSocketEventListeners = (): void => {
      try {
        this.socket.addEventListener(EVENT.CONNECTION_OPENED, (_connOpen: Event) => {
          ƒ.Debug.fudge("Connected to the signaling server", _connOpen);
        });

        // this.wsServer.addEventListener(EVENT.ERROR, (_err: Event) => {
        // });

        this.socket.addEventListener(EVENT.MESSAGE_RECEIVED, (_receivedMessage: MessageEvent) => {
          this.hndMessage(_receivedMessage);
        });
      } catch (error) {
        ƒ.Debug.fudge("Unexpected Error: Adding websocket Eventlistener", error);
      }
    }

    private hndMessage = (_event: MessageEvent): void => {
      let message: FudgeNet.Message = JSON.parse(_event.data);

      //tslint:disable-next-line: no-any
      switch (message.command) {
        case FudgeNet.COMMAND.ASSIGN_ID:
          ƒ.Debug.fudge("ID received", (message.idTarget));
          this.assignIdAndSendConfirmation(message.idTarget);
          break;
        case FudgeNet.COMMAND.LOGIN_RESPONSE:
          this.loginValidAddUser(<string>message.idSource, message.content?.success, message.content?.name);
          break;

        case FudgeNet.COMMAND.RTC_OFFER:
          this.receiveNegotiationOfferAndSetRemoteDescription(message);
          break;

        case FudgeNet.COMMAND.RTC_ANSWER:
          this.receiveAnswerAndSetRemoteDescription(message);
          break;

        case FudgeNet.COMMAND.ICE_CANDIDATE:
          this.addReceivedCandidateToPeerConnection(message);
          break;
      }
      if (message.command != FudgeNet.COMMAND.SERVER_HEARTBEAT)
        console.log(_event.timeStamp, message);
      this.dispatchEvent(new MessageEvent(_event.type, <MessageEventInit<unknown>><unknown>_event));
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
        const offerMessage: FudgeNet.Message = {
          route: FudgeNet.ROUTE.SERVER, command: FudgeNet.COMMAND.RTC_OFFER, idTarget: _idRemote, content: { offer: peerConnection.localDescription }
        };
        // this.sendToServer(offerMessage);
        this.dispatch(offerMessage);
        ƒ.Debug.fudge("Local: send offer, expected 'have-local-offer', got:  ", peerConnection.signalingState);
      } catch (error) {
        console.error("Unexpected Error: Creating Object and Sending RTC Offer", error);
      }
    }

    private receiveNegotiationOfferAndSetRemoteDescription = (_message: FudgeNet.Message): void => {
      ƒ.Debug.fudge("Remote: offer received, create connection", _message);
      if (!_message.idSource)
        throw (new Error("message lacks source."));
      let peer: RtcConnection = this.peers[_message.idSource] || (this.peers[_message.idSource] = new RtcConnection());
      let peerConnection: RTCPeerConnection = peer.peerConnection;
      peerConnection.addEventListener(
        "datachannel", (_event: RTCDataChannelEvent) => this.receiveDataChannelAndEstablishConnection(_event, peer)
      );

      let offerToSet: RTCSessionDescription | RTCSessionDescriptionInit = _message.content?.offer;
      if (!offerToSet) {
        return;
      }

      peerConnection.setRemoteDescription(new RTCSessionDescription(offerToSet))
        .then(async () => {
          ƒ.Debug.fudge("Remote: set remote descripton, expected 'have-remote-offer', got:  ", peerConnection.signalingState);
          if (!_message.idSource)
            throw (new Error("message lacks source"));
          this.answerNegotiationOffer(_message.idSource);
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

          const answerMessage: FudgeNet.Message = {
            route: FudgeNet.ROUTE.SERVER, command: FudgeNet.COMMAND.RTC_ANSWER, idTarget: _idRemote, content: { answer: ultimateAnswer }
          };
          ƒ.Debug.fudge("Remote: send answer to server ", answerMessage);
          this.dispatch(answerMessage);
        })
        .catch((error) => {
          console.error("Unexpected error: Creating RTC Answer failed", error);
        });
    }

    private receiveAnswerAndSetRemoteDescription = (_message: FudgeNet.Message) => {
      try {
        ƒ.Debug.fudge("Local: received answer, create data channel ", _message);
        if (!_message.idSource || !_message.content)
          throw (new Error("message lacks source or content."));
        let descriptionAnswer: RTCSessionDescription = new RTCSessionDescription(_message.content.answer);
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
        let message: FudgeNet.Message = {
          route: FudgeNet.ROUTE.SERVER, command: FudgeNet.COMMAND.ICE_CANDIDATE, idTarget: _idRemote, content: { candidate: _candidate }
        };
        this.dispatch(message);
      } catch (error) {
        console.error("Unexpected Error: Creating and Sending ICECandidates to Peer", error);
      }
    }

    private addReceivedCandidateToPeerConnection = async (_message: FudgeNet.Message) => {
      ƒ.Debug.fudge("Remote: try to add candidate to peer connection");
      try {
        if (!_message.idSource || !_message.content)
          throw (new Error("message lacks source or content."));
        await this.peers[_message.idSource].peerConnection.addIceCandidate(_message.content.candidate);
      } catch (error) {
        console.error("Unexpected Error: Adding Ice Candidate", error);
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

    private loginValidAddUser = (_assignedId: string, _success: boolean, _name: string): void => {
      if (_success) {
        this.name = _name;
        ƒ.Debug.fudge("Logged in to server as: " + this.name, this.id);
      } else {
        ƒ.Debug.fudge("Login failed, username taken", this.name, this.id);
      }
    }

    private assignIdAndSendConfirmation = (_id: string | undefined) => {
      try {
        if (!_id)
          throw (new Error("id undefined"));
        this.id = _id;
        // this.sendToServer(new Messages.IdAssigned(_id));
        let message: FudgeNet.Message = { command: FudgeNet.COMMAND.ASSIGN_ID, route: FudgeNet.ROUTE.SERVER };
        this.dispatch(message);
      } catch (error) {
        ƒ.Debug.fudge("Unexpected Error: Sending ID Confirmation", error);
      }
    }
  }
}