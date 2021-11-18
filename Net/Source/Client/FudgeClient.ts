///<reference path="../Message.ts"/>
///<reference path="./RtcConnection.ts"/>
///<reference path="../../../Core/Build/FudgeCore.d.ts"/>
namespace FudgeNet {
  import ƒ = FudgeCore;

  /**
   * Manages a websocket connection to a FudgeServer and multiple rtc-connections to other FudgeClients.  
   * Processes messages from in the format {@link FudgeNet.Message} according to the controlling
   * fields {@link FudgeNet.ROUTE} and {@link FudgeNet.COMMAND}.  
   * @author Falco Böhnke, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2021
   */
  export class FudgeClient extends EventTarget {
    public id!: string;
    public name!: string;
    public urlServer!: string;
    public socket!: WebSocket;
    public peers: { [id: string]: RtcConnection } = {};
    // TODO: examine, if server should know about connected peers and send this information also
    public clientsInfoFromServer: { [id: string]: { name?: string, isHost?: boolean } } = {};
    public idHost!: string;

    constructor() {
      super();
    }

    /** 
     * Tries to connect to the server at the given url and installs the appropriate listeners
     */
    public connectToServer = (_uri: string = "ws://localhost:8080") => {
      this.urlServer = _uri;
      this.socket = new WebSocket(_uri);
      this.addWebSocketEventListeners();
    }

    /** 
     * Tries to publish a human readable name for this client. Identification still solely by `id` 
     */
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

    /** 
     * Tries to connect to another client with the given id via rtc
     */
    public connectToPeer = (_idPeer: string): void => {
      if (_idPeer == this.id || this.peers[_idPeer]) // don't connect to self or already connected peers
        return;
      if (this.peers[_idPeer])
        ƒ.Debug.warn("Peers already connected, ignoring request", this.id, _idPeer);
      else
        this.beginPeerConnectionNegotiation(_idPeer);
    }

    public connectPeers(_ids: string[]): void {
      for (let id of _ids) {
        this.connectToPeer(id);
      }
    }

    /** 
     * Tries to disconnect the peer given with id
     */
    public disconnectPeer(_idRemote: string): void {
      let peer: RtcConnection = this.peers[_idRemote];
      if (!peer)
        return;
      peer.peerConnection.close();
      delete this.peers[_idRemote];
      console.log("Deleted peer", _idRemote, "remaining", this.peers);
    }

    /**
     * Disconnect all peers
     */
    public disconnectPeers(_ids?: string[]): void {
      if (_ids)
        for (let id of _ids) {
          this.disconnectPeer(id);
          return;
        }
      // no ids specified, disconnect all
      for (let id in this.peers)
        this.peers[id].peerConnection.close();
      this.peers = {};
    }

    /** 
     * Dispatches a {@link FudgeNet.Message} to the server, a specific client or all  
     * according to {@link FudgeNet.ROUTE} and `idTarget` 
     */
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

    public createMesh(): void {
      this.dispatch({ command: FudgeNet.COMMAND.DISCONNECT_PEERS });
      this.disconnectPeers();
      this.dispatch({ command: FudgeNet.COMMAND.CREATE_MESH, route: FudgeNet.ROUTE.SERVER });
    }
    public becomeHost(): void {
      this.dispatch({ command: FudgeNet.COMMAND.DISCONNECT_PEERS });
      this.disconnectPeers();
      console.log("createHost", this.id);
      this.dispatch({ command: FudgeNet.COMMAND.CONNECT_HOST, route: FudgeNet.ROUTE.SERVER });
    }

    public hndMessage = (_event: MessageEvent): void => {
      let message: FudgeNet.Message = JSON.parse(_event.data);
      if (message.command != FudgeNet.COMMAND.SERVER_HEARTBEAT && message.command != FudgeNet.COMMAND.CLIENT_HEARTBEAT)
        console.log(_event.timeStamp, message);

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
        case FudgeNet.COMMAND.CONNECT_PEERS:
          this.connectPeers(message.content?.peers);
          break;
        case FudgeNet.COMMAND.DISCONNECT_PEERS:
          let ids: string[] = message.content?.peers;
          this.disconnectPeers(ids);
          break;
        case FudgeNet.COMMAND.SERVER_HEARTBEAT:
          //@ts-ignore
          this.clientsInfoFromServer = message.content;
          let host!: string;
          for (let id in this.clientsInfoFromServer)
            if (this.clientsInfoFromServer[id].isHost)
              host = id;
          if (host != this.idHost) {
            this.idHost = host
            console.log("New host", host);
          }
          break;
      }
      // if (message.command != FudgeNet.COMMAND.SERVER_HEARTBEAT)
      //   console.log(_event.timeStamp, message);
      this.dispatchEvent(new MessageEvent(_event.type, <MessageEventInit<unknown>><unknown>_event));
    }

    // ----------------------

    private sendToPeer = (_idPeer: string, _message: string) => {
      let dataChannel: RTCDataChannel | undefined = this.peers[_idPeer].dataChannel;
      if (dataChannel && dataChannel.readyState == "open")
        dataChannel.send(_message);
      else {
        console.error("Datachannel disconnected, ready state: ", dataChannel?.readyState);
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

    private beginPeerConnectionNegotiation = (_idRemote: string): void => {
      try {
        this.peers[_idRemote] = new RtcConnection();
        // this.peers[_idRemote].createDataChannel(this, _idRemote);
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