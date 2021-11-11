///<reference path="../Messages.ts"/>
///<reference path="../../../Core/Build/FudgeCore.d.ts"/>
namespace FudgeClient {
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
        // const loginMessage: Messages.LoginRequest = new Messages.LoginRequest(this.id, _name);
        // this.sendToServer(loginMessage);
        let message: Messages.NetMessage = {
          command: Messages.NET_COMMAND.LOGIN_REQUEST, route: Messages.NET_ROUTE.SERVER, content: { name: _name }
        };
        this.dispatch(message);
      } catch (error) {
        ƒ.Debug.fudge("Unexpected error: Sending Login Request", error);
      }
    }

    public dispatch(_message: Messages.NetMessage): void {
      _message.timeSender = Date.now();
      let message: string = JSON.stringify(_message);
      try {
        if (!_message.route || _message.route == Messages.NET_ROUTE.HOST) {
          // send via RTC to specific peer (if idTarget set), all peers (if not set) or host (if route set to host)
        } else {
          _message.idSource = this.id;
          this.socket.send(message);
        }
      } catch (_error) {
        console.log(_error);
      }
    }

    // public broadcast(_message: Messages.NetMessage): void {
    //   _message.timeServer = Date.now();
    //   let message: string = JSON.stringify(_message);
    //   for (let id in this.clients)
    //     // TODO: examine, if idTarget should be tweaked...
    //     this.clients[id].socket?.send(message);
    // }

    // public sendToServer = (_message: Messages.MessageBase): void => {
    //   let stringifiedMessage: string = _message.serialize();
    //   if (this.socket.readyState == 1) {
    //     this.socket.send(stringifiedMessage);
    //   }
    //   else {
    //     ƒ.Debug.fudge("Websocket Connection closed unexpectedly");
    //   }
    // }

    public connectToPeer = (_idRemote: string): void => {
      if (this.peers[_idRemote])
        ƒ.Debug.warn("Peers already connected, ignoring request", this.id, _idRemote);
      else
        // this.idRemote = _idRemote;
        this.beginPeerConnectionNegotiation(_idRemote);
    }

    // public sendToPeer = (_idRemote: string, _message: object) => {
    //   let message: Messages.PeerToPeer = new Messages.PeerToPeer(this.id, JSON.stringify(_message));
    //   let dataChannel: RTCDataChannel | undefined = this.peers[_idRemote].dataChannel;

    //   if (dataChannel && dataChannel.readyState == "open")
    //     dataChannel.send(message.serialize());
    //   else {
    //     console.error("Datachannel: Connection unexpectedly lost");
    //   }
    // }

    // public sendToAllPeers = (_message: object) => {
    //   for (let idPeer in this.peers) {
    //     this.sendToPeer(idPeer, _message);
    //   }
    // }
    // ----------------------


    private addWebSocketEventListeners = (): void => {
      try {
        this.socket.addEventListener(EVENT.CONNECTION_OPENED, (_connOpen: Event) => {
          ƒ.Debug.fudge("Connected to the signaling server", _connOpen);
        });

        // this.wsServer.addEventListener(EVENT.ERROR, (_err: Event) => {
        // });

        this.socket.addEventListener(EVENT.MESSAGE_RECEIVED, (_receivedMessage: MessageEvent) => {
          // this.parseMessageAndHandleMessageType(_receivedMessage);
          this.hndMessage(_receivedMessage);
        });
      } catch (error) {
        ƒ.Debug.fudge("Unexpected Error: Adding websocket Eventlistener", error);
      }
    }

    private hndMessage = (_event: MessageEvent): void => {
      let message: Messages.NetMessage = JSON.parse(_event.data);

      //tslint:disable-next-line: no-any
      // let content: any = message.content ? JSON.parse(message.content) : null;
      switch (message.command) {
        case Messages.NET_COMMAND.ASSIGN_ID:
          ƒ.Debug.fudge("ID received", (message.idTarget));
          this.assignIdAndSendConfirmation(message.idTarget);
          break;
        case Messages.NET_COMMAND.LOGIN_RESPONSE:
          this.loginValidAddUser(<string>message.idSource, message.content?.success, message.content?.name);
          break;

        case Messages.NET_COMMAND.RTC_OFFER:
          // ƒ.Debug.fudge("Received offer, current signaling state: ", this.connection.signalingState);
          this.receiveNegotiationOfferAndSetRemoteDescription(message);
          break;

        case Messages.NET_COMMAND.RTC_ANSWER:
          // ƒ.Debug.fudge("Received answer, current signaling state: ", this.connection.signalingState);
          this.receiveAnswerAndSetRemoteDescription(message);
          break;

        case Messages.NET_COMMAND.ICE_CANDIDATE:
          // ƒ.Debug.fudge("Received candidate, current signaling state: ", this.connection.signalingState);
          this.addReceivedCandidateToPeerConnection(message);
          break;
      }
      if (message.command != Messages.NET_COMMAND.SERVER_HEARTBEAT)
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
        const offerMessage: Messages.NetMessage = {
          command: Messages.NET_COMMAND.RTC_OFFER, idTarget: _idRemote, content: { peerConnection: peerConnection.localDescription }
        };
        // this.sendToServer(offerMessage);
        this.dispatch(offerMessage);
        ƒ.Debug.fudge("Local: send offer, expected 'have-local-offer', got:  ", peerConnection.signalingState);
      } catch (error) {
        console.error("Unexpected Error: Creating Object and Sending RTC Offer", error);
      }
    }

    private receiveNegotiationOfferAndSetRemoteDescription = (_message: Messages.NetMessage): void => {
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

          // const answerMessage: Messages.RtcAnswer = new Messages.RtcAnswer(this.id, _idRemote, ultimateAnswer);
          const answerMessage: Messages.NetMessage = {
            command: Messages.NET_COMMAND.RTC_ANSWER, idTarget: _idRemote, content: { answer: ultimateAnswer }
          };
          ƒ.Debug.fudge("Remote: send answer to server ", answerMessage);
          this.dispatch(answerMessage);
        })
        .catch((error) => {
          console.error("Unexpected error: Creating RTC Answer failed", error);
        });
    }

    private receiveAnswerAndSetRemoteDescription = (_message: Messages.NetMessage) => {
      try {
        ƒ.Debug.fudge("Local: received answer, create data channel ", _message);
        if (!_message.idSource || !_message.content)
          throw (new Error("message lacks source or content."));
        let descriptionAnswer: RTCSessionDescription = new RTCSessionDescription(_message.content?.answer);
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
        // let message: Messages.IceCandidate = new Messages.IceCandidate(this.id, _idRemote, _candidate);
        let message: Messages.NetMessage = {
          command: Messages.NET_COMMAND.ICE_CANDIDATE, idTarget: _idRemote, content: { candidate: _candidate }
        };
        this.dispatch(message);
      } catch (error) {
        console.error("Unexpected Error: Creating and Sending ICECandidates to Peer", error);
      }
    }

    private addReceivedCandidateToPeerConnection = async (_message: Messages.NetMessage) => {
      ƒ.Debug.fudge("Remote: try to add candidate to peer connection");
      if (_message.content?.candidate) {
        try {
          if (!_message.idSource || !_message.content)
            throw (new Error("message lacks source or content."));
          await this.peers[_message.idSource].peerConnection.addIceCandidate(_message.content?.candidate);
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
        let message: Messages.NetMessage = { command: Messages.NET_COMMAND.ASSIGN_ID, route: Messages.NET_ROUTE.SERVER };
        this.dispatch(message);
      } catch (error) {
        ƒ.Debug.fudge("Unexpected Error: Sending ID Confirmation", error);
      }
    }
  }
}