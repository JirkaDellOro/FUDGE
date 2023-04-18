///<reference path="../Message.ts"/>
///<reference path="./RtcConnection.ts"/>
///<reference path="../../../Core/Build/FudgeCore.d.ts"/>
namespace FudgeNet {
  import ƒ = FudgeCore;
  let idRoom: string = "abc";

  /**
   * Manages a websocket connection to a FudgeServer and multiple rtc-connections to other FudgeClients.  
   * Processes messages from in the format {@link FudgeNet.Message} according to the controlling
   * fields {@link FudgeNet.ROUTE} and {@link FudgeNet.COMMAND}.  
   * @author Falco Böhnke, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2021-2022
   */
  export class FudgeClient extends EventTarget {
    public id!: string;
    public name!: string;
    public urlServer!: string;
    public socket!: WebSocket;
    public peers: { [id: string]: Rtc } = {};
    // TODO: examine, if server should know about connected peers and send this information also
    public clientsInfoFromServer: { [id: string]: { name?: string, isHost?: boolean } } = {};
    public idHost!: string;
    // start is the servers lobby
    public idRoom: string = "Lobby";

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
          idRoom: idRoom, command: FudgeNet.COMMAND.LOGIN_REQUEST, route: FudgeNet.ROUTE.SERVER, content: { name: _name }
        };
        this.dispatch(message);
      } catch (error) {
        console.info("Unexpected error: Sending Login Request", error);
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
        this.cRstartNegotiation(_idPeer);
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
      let peer: Rtc = this.peers[_idRemote];
      if (!peer)
        return;
      peer.close();
      delete this.peers[_idRemote];
      console.log("Deleted peer", _idRemote, "remaining", this.peers);
    }

    /**
     * Disconnect all peers
     */
    public disconnectPeers(_ids?: string[]): void {
      if (_ids) {
        for (let id of _ids)
          this.disconnectPeer(id);
        return;
      }
      // no ids specified, disconnect all
      for (let id in this.peers)
        this.peers[id].close();
      this.peers = {};
    }

    /** 
     * Dispatches a {@link FudgeNet.Message} to the server, a specific client or all  
     * according to {@link FudgeNet.ROUTE} and `idTarget` 
     */
    public dispatch(_message: FudgeNet.Message): void {
      _message.timeSender = Date.now();
      _message.idSource = this.id;
      _message.idRoom = this.idRoom;
      let message: string = JSON.stringify(_message);
      try {
        if (_message.route == FudgeNet.ROUTE.HOST) {
          // to host via rtc
          this.sendToPeer(this.idHost, message);
        }
        else if (_message.route) {
          // other routes go via or to the server
          this.socket.send(message);
        }
        else {
          // send via RTC to specific peer (if idTarget set) or all peers (if not set)
          if (_message.idTarget)
            this.sendToPeer(_message.idTarget, message);
          else
            this.sendToAllPeers(message);
        }
      } catch (_error) {
        console.log(_error);
      }
    }

    /**
     * Sends out a disconnect message to all peers, disconnects from all peers and sends a CREATE_MESH-command to the server,
     * to establish RTC-peer-connections between all clients
     */
    public createMesh(): void {
      // TODO: add idRoom in dispatch method
      this.dispatch({ idRoom: idRoom, command: FudgeNet.COMMAND.DISCONNECT_PEERS });
      this.disconnectPeers();
      this.dispatch({ idRoom: idRoom, command: FudgeNet.COMMAND.CREATE_MESH, route: FudgeNet.ROUTE.SERVER });
    }
    /**
     * Sends out a disconnect message to all peers, disconnects from all peers and sends a CONNECT_HOST-command to the server,
     * to establish RTC-peer-connections between this client and all others, making this the host
     */
    public becomeHost(): void {
      this.dispatch({ idRoom: idRoom, command: FudgeNet.COMMAND.DISCONNECT_PEERS });
      this.disconnectPeers();
      console.log("createHost", this.id);
      this.dispatch({ idRoom: idRoom, command: FudgeNet.COMMAND.CONNECT_HOST, route: FudgeNet.ROUTE.SERVER });
    }

    public hndMessage = (_event: MessageEvent): void => {
      let message: FudgeNet.Message = JSON.parse(_event.data);
      // if (message.command != FudgeNet.COMMAND.SERVER_HEARTBEAT && message.command != FudgeNet.COMMAND.CLIENT_HEARTBEAT)
      // console.log(_event.timeStamp, message);

      //tslint:disable-next-line: no-any
      switch (message.command) {
        case FudgeNet.COMMAND.ASSIGN_ID:
          console.info("ID received", (message.idTarget));
          this.assignIdAndSendConfirmation(message.idTarget);
          break;
        case FudgeNet.COMMAND.LOGIN_RESPONSE:
          this.loginValidAddUser(<string>message.idSource, message.content?.success, message.content?.name);
          break;

        case FudgeNet.COMMAND.RTC_OFFER:
          this.cEreceiveOffer(message);
          break;

        case FudgeNet.COMMAND.RTC_ANSWER:
          this.cRreceiveAnswer(message);
          break;

        case FudgeNet.COMMAND.ICE_CANDIDATE:
          this.cEaddIceCandidate(_event, message);
          break;
        case FudgeNet.COMMAND.CONNECT_PEERS:
          this.connectPeers(message.content?.peers);
          break;
        case FudgeNet.COMMAND.DISCONNECT_PEERS:
          let ids: string[] = message.content?.peers;
          this.disconnectPeers(ids);
          break;
        case FudgeNet.COMMAND.ROOM_ENTER:
          this.idRoom = message.idRoom!;
          break;
        case FudgeNet.COMMAND.SERVER_HEARTBEAT:
          //@ts-ignore
          this.clientsInfoFromServer = message.content;
          let host!: string;
          for (let id in this.clientsInfoFromServer)
            if (this.clientsInfoFromServer[id].isHost)
              host = id;
          if (host != this.idHost) {
            this.idHost = host;
            console.log("New host", host);
          }
          break;
      }

      // Dispatch a new event with the same information a programm using this client can react to
      this.dispatchEvent(new MessageEvent(_event.type, <MessageEventInit<unknown>><unknown>_event));
    }

    // ----------------------

    private sendToPeer = (_idPeer: string, _message: string) => {
      this.peers[_idPeer].send(_message);
    }

    private sendToAllPeers = (_message: string) => {
      for (let idPeer in this.peers) {
        this.sendToPeer(idPeer, _message);
      }
    }

    private addWebSocketEventListeners = (): void => {
      try {
        this.socket.addEventListener(EVENT.CONNECTION_OPENED, (_connOpen: Event) => {
          console.info("Connected to the signaling server", _connOpen);
        });

        this.socket.addEventListener(EVENT.ERROR, (_err: Event) => {
          console.error(_err);
        });

        this.socket.addEventListener(EVENT.MESSAGE_RECEIVED, (_receivedMessage: MessageEvent) => {
          this.hndMessage(_receivedMessage);
        });
      } catch (error) {
        console.info("Unexpected Error: Adding websocket Eventlistener", error);
      }
    }


    private loginValidAddUser = (_assignedId: string, _success: boolean, _name: string): void => {
      if (_success) {
        this.name = _name;
        console.info("Logged in to server as: " + this.name, this.id);
      } else {
        console.info("Login failed, username taken", this.name, this.id);
      }
    }

    private assignIdAndSendConfirmation = (_id: string | undefined) => {
      try {
        if (!_id)
          throw (new Error("id undefined"));
        this.id = _id;
        // this.sendToServer(new Messages.IdAssigned(_id));
        let message: FudgeNet.Message = { idRoom: idRoom, command: FudgeNet.COMMAND.ASSIGN_ID, route: FudgeNet.ROUTE.SERVER };
        this.dispatch(message);
      } catch (error) {
        console.info("Unexpected Error: Sending ID Confirmation", error);
      }
    }

    //#region RTC-Negotiation
    // cR = caller
    /**
     * Create a new Rtc-Object, install listeners to it and create a data channel
     */
    private cRstartNegotiation = async (_idRemote: string): Promise<void> => {
      let rtc: Rtc = new Rtc();
      this.peers[_idRemote] = rtc;

      rtc.addEventListener(
        "negotiationneeded", async (_event: Event) => this.cRsendOffer(_idRemote)
      );
      rtc.addEventListener(
        "icecandidate", (_event: RTCPeerConnectionIceEvent) => this.cRsendIceCandidates(_event, _idRemote)
      );

      rtc.addEventListener(
        "icegatheringstatechange", (_event: Event) => {
          console.log("ICE-state", rtc.iceGatheringState);
        }
      );

      // fires the negotiationneeded-event
      rtc.setupDataChannel(this, _idRemote);
      // this.cRsendOffer(_idRemote);
      // rtc.restartIce();
    }

    /**
     * Start negotiation by sending an offer with the local description of the connection via the signalling server
     */
    private cRsendOffer = async (_idRemote: string) => {
      let rtc: RTCPeerConnection = this.peers[_idRemote];
      let localDescription: RTCSessionDescriptionInit = await rtc.createOffer({ iceRestart: true });
      await rtc.setLocalDescription(localDescription);
      const offerMessage: FudgeNet.Message = {
        idRoom: idRoom, route: FudgeNet.ROUTE.SERVER, command: FudgeNet.COMMAND.RTC_OFFER, idTarget: _idRemote, content: { offer: rtc.localDescription }
      };
      this.dispatch(offerMessage);
      console.info("Caller: send offer, expected 'have-local-offer', got:  ", this.peers[_idRemote].signalingState);
    }

    // cE = callee
    /**
     * Callee receives offer, creates a peerConnection on its side, sets the remote description and its own local description,
     * installs a datachannel-event on the connection and sends its local description back to the caller as answer to the offer via the server
     */
    private cEreceiveOffer = async (_message: FudgeNet.Message): Promise<void> => {
      console.info("Callee: offer received, create connection", _message);

      let rtc: Rtc = /* this.peers[_message.idSource!] || */ (this.peers[_message.idSource!] = new Rtc());
      rtc.addEventListener(
        "datachannel", (_event: RTCDataChannelEvent) => this.cEestablishConnection(_event, this.peers[_message.idSource!])
      );
      await rtc.setRemoteDescription(new RTCSessionDescription(_message.content?.offer));
      await rtc.setLocalDescription();
      // rtc.setupDataChannel(this, _message.idSource!);

      const answerMessage: FudgeNet.Message = {
        idRoom: idRoom, route: FudgeNet.ROUTE.SERVER, command: FudgeNet.COMMAND.RTC_ANSWER, idTarget: _message.idSource, content: { answer: rtc.localDescription }
      };
      console.info("Callee: send answer to server ", answerMessage);
      this.dispatch(answerMessage);
      console.info("Callee: remote description set, expected 'stable', got:  ", rtc.signalingState);
    }

    /**
     * Caller receives the answer and sets the remote description on its side. The first part of the negotiation is done.
     */
    private cRreceiveAnswer = async (_message: FudgeNet.Message) => {
      console.info("Caller: received answer, create data channel ", _message);
      let rtc: Rtc = this.peers[_message.idSource!];
      await rtc.setRemoteDescription(_message.content?.answer);
      // if (!rtc.dataChannel)
      //   rtc.setupDataChannel(this, _message.idSource!);
      // else
      // console.warn("Datachannel reuse: ", rtc.dataChannel!.id, rtc.dataChannel!.label);
    }


    /**
     * Caller starts collecting ICE-candidates and calls this function for each candidate found, 
     * which sends the candidate info to callee via the server
     */
    private cRsendIceCandidates = async (_event: RTCPeerConnectionIceEvent, _idRemote: string) => {
      if (!_event.candidate)
        return;

      let pc: RTCPeerConnection = <RTCPeerConnection>_event.currentTarget;
      console.info("Caller: send ICECandidates to server", _event.candidate);
      let message: FudgeNet.Message = {
        idRoom: idRoom, route: FudgeNet.ROUTE.SERVER, command: FudgeNet.COMMAND.ICE_CANDIDATE, idTarget: _idRemote, content: { candidate: _event.candidate, states: [pc.connectionState, pc.iceConnectionState, pc.iceGatheringState] }
      };
      this.dispatch(message);
    }

    /**
     * Callee receives the info about the ice-candidate and adds it to the connection
     */
    private cEaddIceCandidate = async (_event: MessageEvent, _message: FudgeNet.Message) => {
      console.info("Callee: try to add candidate to peer connection", _message.content?.candidate);
      await this.peers[_message.idSource!].addIceCandidate(_message.content?.candidate);
    }

    private cEestablishConnection = (_event: RTCDataChannelEvent, _peer: Rtc) => {
      console.info("Callee: establish channel on connection", _event.channel);
      if (_event.channel) {
        _peer.addDataChannel(this, _event.channel);
      }
      else {
        console.error("Unexpected Error: RemoteDatachannel");
      }
    }
  }
}