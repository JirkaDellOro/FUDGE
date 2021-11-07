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

    // public ownPeerConnection!: RTCPeerConnection;
    // public idRemote: string;
    // public ownPeerDataChannel: RTCDataChannel | undefined;
    // public remoteEventPeerDataChannel: RTCDataChannel | undefined;
    // public isInitiator: boolean;

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

    public sendToPeer = (_idRemote: string, _messageToSend: string) => {
      let messageObject: Messages.PeerSimpleText = new Messages.PeerSimpleText(this.id, _messageToSend, this.name);

      let stringifiedMessage: string = JSON.stringify(messageObject);
      ƒ.Debug.fudge(stringifiedMessage);

      let dataChannel: RTCDataChannel | undefined = this.peers[_idRemote].dataChannel;


      // if (this.isInitiator && this.ownPeerDataChannel) {
      //   this.ownPeerDataChannel.send(stringifiedMessage);
      // }
      // else if (!this.isInitiator && this.remoteEventPeerDataChannel && this.remoteEventPeerDataChannel.readyState === "open") {
      //   ƒ.Debug.fudge("Sending Message via received Datachannel");
      //   this.remoteEventPeerDataChannel.send(stringifiedMessage);
      // }
      if (dataChannel && dataChannel.readyState == "open")
        dataChannel.send(stringifiedMessage);
      else {
        console.error("Datachannel: Connection unexpectedly lost");
      }
    }

    // ----------------------


    private addWebSocketEventListeners = (): void => {
      try {
        this.wsServer.addEventListener("open", (_connOpen: Event) => {
          ƒ.Debug.fudge("Connected to the signaling server", _connOpen);
        });

        // this.wsServer.addEventListener("error", (_err: Event) => {
        // });

        this.wsServer.addEventListener("message", (_receivedMessage: MessageEvent) => {
          this.parseMessageAndHandleMessageType(_receivedMessage);
        });
      } catch (error) {
        ƒ.Debug.fudge("Unexpected Error: Adding websocket Eventlistener", error);
      }
    }

    private parseMessageAndHandleMessageType = (_receivedMessage: MessageEvent) => {
      // tslint:disable-next-line: typedef
      let message = Messages.MessageBase.deserialize(_receivedMessage.data);

      switch (message.messageType) {
        case Messages.MESSAGE_TYPE.ID_ASSIGNED:
          ƒ.Debug.fudge("ID received", (<Messages.IdAssigned>message).assignedId);
          this.assignIdAndSendConfirmation(<Messages.IdAssigned>message);
          break;

        case Messages.MESSAGE_TYPE.LOGIN_RESPONSE:
          this.loginValidAddUser(message.originatorId, (<Messages.LoginResponse>message).loginSuccess, (<Messages.LoginResponse>message).originatorUsername);
          break;

        case Messages.MESSAGE_TYPE.SERVER_HEARTBEAT:
          this.wsServer.dispatchEvent(new CustomEvent("receive", { detail: message }));
          break;

        case Messages.MESSAGE_TYPE.CLIENT_TO_SERVER:
          // ƒ.Debug.fudge("BroadcastMessage received, requires further handling", _receivedMessage);
          this.wsServer.dispatchEvent(new CustomEvent("receive", { detail: message }));
          break;

        case Messages.MESSAGE_TYPE.SERVER_TO_CLIENT:
          this.displayServerMessage(_receivedMessage.data);
          break;

        case Messages.MESSAGE_TYPE.RTC_OFFER:
          // ƒ.Debug.fudge("Received offer, current signaling state: ", this.connection.signalingState);
          this.receiveNegotiationOfferAndSetRemoteDescription(<Messages.RtcOffer>message);
          break;

        case Messages.MESSAGE_TYPE.RTC_ANSWER:
          // ƒ.Debug.fudge("Received answer, current signaling state: ", this.connection.signalingState);
          this.receiveAnswerAndSetRemoteDescription(message.originatorId, <Messages.RtcAnswer>message);
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
      } catch (error) {
        console.error("Unexpected Error: Creating Client Datachannel and adding Listeners", error);
      }

      let peerConnection: RTCPeerConnection = this.peers[_idRemote].peerConnection;
      peerConnection.addEventListener(
        "icecandidate", (_event: RTCPeerConnectionIceEvent) => this.sendIceCandidatesToPeer(_event.candidate, _idRemote)
      );

      peerConnection.createOffer()
        .then(async (offer) => {
          ƒ.Debug.fudge("Beginning of createOffer in InitiateConnection, Expected 'stable', got:  ", peerConnection.signalingState);
          return offer;
        })
        .then(async (offer) => {
          await peerConnection.setLocalDescription(offer);
          ƒ.Debug.fudge("Setting LocalDesc, Expected 'have-local-offer', got:  ", peerConnection.signalingState);
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
        ƒ.Debug.fudge("Sent offer to remote peer, Expected 'have-local-offer', got:  ", peerConnection.signalingState);
      } catch (error) {
        console.error("Unexpected Error: Creating Object and Sending RTC Offer", error);
      }
    }

    private receiveNegotiationOfferAndSetRemoteDescription = (_offerMessage: Messages.RtcOffer): void => {
      let peerConnection: RTCPeerConnection = this.peers[_offerMessage.originatorId]?.peerConnection;
      if (!peerConnection) {
        this.peers[_offerMessage.originatorId] = new RtcConnection();
        peerConnection = this.peers[_offerMessage.originatorId].peerConnection;
      }
      peerConnection.addEventListener("datachannel", this.receiveDataChannelAndEstablishConnection);
      // this.idRemote = _offerMessage.originatorId;

      let offerToSet: RTCSessionDescription | RTCSessionDescriptionInit | null | undefined = _offerMessage.offer;
      if (!offerToSet) {
        return;
      }

      peerConnection.setRemoteDescription(new RTCSessionDescription(offerToSet))
        .then(async () => {
          ƒ.Debug.fudge("Received Offer and Set Descripton, Expected 'have-remote-offer', got:  ", peerConnection.signalingState);
          this.answerNegotiationOffer(_offerMessage.originatorId);
        })
        .catch((error) => {
          console.error("Unexpected Error: Setting Remote Description and Creating Answer", error);
        });
      ƒ.Debug.fudge("End of Function Receive offer, Expected 'stable', got:  ", peerConnection.signalingState);
    }




    private answerNegotiationOffer = (_idRemote: string) => {
      let ultimateAnswer: RTCSessionDescription;
      let peerConnection: RTCPeerConnection = this.peers[_idRemote]?.peerConnection;

      // Signaling example from here https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/createAnswer
      peerConnection.createAnswer()
        .then(async (answer) => {
          ƒ.Debug.fudge("Create Answer before setting local desc: Expected 'have-remote-offer', got:  ", peerConnection.signalingState);
          ultimateAnswer = new RTCSessionDescription(answer);
          return await peerConnection.setLocalDescription(ultimateAnswer);
        }).then(async () => {
          ƒ.Debug.fudge("CreateAnswerFunction after setting local descp, Expected 'stable', got:  ", peerConnection.signalingState);

          const answerMessage: Messages.RtcAnswer =
            new Messages.RtcAnswer(this.id, _idRemote, ultimateAnswer);
          ƒ.Debug.fudge("AnswerObject: ", answerMessage);
          await this.sendToServer(answerMessage);
        })
        .catch((error) => {
          console.error("Unexpected error: Creating RTC Answer failed", error);
        });
    }

    // TODO: find the purpose of localhostId
    private receiveAnswerAndSetRemoteDescription = (_localhostId: string, _message: Messages.RtcAnswer) => {
      try {
        let descriptionAnswer: RTCSessionDescription = new RTCSessionDescription(_message.answer);
        this.peers[_message.originatorId].peerConnection.setRemoteDescription(descriptionAnswer);
      } catch (error) {
        console.error("Unexpected Error: Setting Remote Description from Answer", error);
      }
    }

    private sendIceCandidatesToPeer = (_candidate: RTCIceCandidate | null, _idRemote: string) => {
      if (!_candidate)
        return;
      try {
        ƒ.Debug.fudge("Sending ICECandidates from: ", this.id);
        let message: Messages.IceCandidate = new Messages.IceCandidate(this.id, _idRemote, _candidate);
        this.sendToServer(message);
      } catch (error) {
        console.error("Unexpected Error: Creating and Sending ICECandidates to Peer", error);
      }
    }

    private addReceivedCandidateToPeerConnection = async (_message: Messages.IceCandidate) => {
      if (_message.candidate) {
        try {
          await this.peers[_message.targetId].peerConnection.addIceCandidate(_message.candidate);
        } catch (error) {
          console.error("Unexpected Error: Adding Ice Candidate", error);
        }
      }
    }


    private receiveDataChannelAndEstablishConnection = (_event: { channel: RTCDataChannel }) => {
      console.log(_event.channel.id);
      // this.remoteEventPeerDataChannel = _event.channel;
      // if (this.remoteEventPeerDataChannel) {
      //   this.remoteEventPeerDataChannel.addEventListener("message", this.dataChannelMessageHandler);
      //   this.remoteEventPeerDataChannel.addEventListener("close", this.dataChannelStatusChangeHandler);
      // }
      // else {
      //   console.error("Unexpected Error: RemoteDatachannel");
      // }
    }

    //   public sendMessageToServerViaDataChannel = (_messageToSend: string) => {
    //     try {
    //       if (this.remoteEventPeerDataChannel) {
    //         this.remoteEventPeerDataChannel.send(_messageToSend);
    //       }
    //     } catch (error) {
    //       console.error("Error occured when stringifying PeerMessage");
    //       console.error(error);
    //     }
    //   }

    //   public getLocalClientId(): string {
    //     return this.localClientID;
    //   }

    //   public getLocalUserName(): string {
    //     return this.localUserName == "" || undefined ? "Kein Username vergeben" : this.localUserName;
    //   }
    private displayServerMessage(_messageToDisplay: Messages.MessageBase): void {
      // TODO: this must be handled by creator
      // let parsedObject: Messages.ToClient = this.parseReceivedMessageAndReturnObject(_messageToDisplay);
    }

    private loginValidAddUser = (_assignedId: string, _loginSuccess: boolean, _originatorUserName: string): void => {
      if (_loginSuccess) {
        this.setOwnUserName(_originatorUserName);
        ƒ.Debug.fudge("Logged in to server as: " + this.name, this.id);
      } else {
        ƒ.Debug.fudge("Login failed, username taken", this.name, this.id);
      }
    }

    private assignIdAndSendConfirmation = (_message: Messages.IdAssigned) => {
      try {
        this.setOwnClientId(_message.assignedId);
        this.sendToServer(new Messages.IdAssigned(this.id));
      } catch (error) {
        ƒ.Debug.fudge("Unexpected Error: Sending ID Confirmation", error);
      }
    }

    private stringifyObjectForNetworkSending = (_objectToStringify: Object): string => {
      let stringifiedObject: string = "";
      try {
        stringifiedObject = JSON.stringify(_objectToStringify);
      } catch (error) {
        ƒ.Debug.fudge("JSON Parse failed", error);
      }
      return stringifiedObject;
    }


    private setOwnClientId(_id: string): void {
      this.id = _id;
    }

    private setOwnUserName(_name: string): void {
      this.name = _name;
    }


    private dataChannelStatusChangeHandler = (event: Event) => {
      //TODO Reconnection logic
      ƒ.Debug.fudge("Channel Event happened", event);
    }
  }
}