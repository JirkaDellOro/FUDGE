"use strict";
var Messages;
(function (Messages) {
    let MESSAGE_TYPE;
    (function (MESSAGE_TYPE) {
        MESSAGE_TYPE["UNDEFINED"] = "undefined";
        MESSAGE_TYPE["ERROR"] = "error";
        MESSAGE_TYPE["ID_ASSIGNED"] = "id_assigned";
        MESSAGE_TYPE["LOGIN_REQUEST"] = "login_request";
        MESSAGE_TYPE["LOGIN_RESPONSE"] = "login_response";
        MESSAGE_TYPE["RTC_OFFER"] = "offer";
        MESSAGE_TYPE["RTC_ANSWER"] = "answer";
        MESSAGE_TYPE["ICE_CANDIDATE"] = "candidate";
        MESSAGE_TYPE["SERVER_ASSIGNMENT_REQUEST"] = "server_assignment_request";
        MESSAGE_TYPE["CLIENT_TO_SERVER_MESSAGE"] = "client_to_server_message";
        MESSAGE_TYPE["CLIENT_READY_FOR_MESH_CONNECTION"] = "client_ready_for_mesh_connection";
        MESSAGE_TYPE["CLIENT_MESH_CONNECTED"] = "client_mesh_connected";
        MESSAGE_TYPE["SERVER_SEND_MESH_CANDIDATES_TO_CLIENT"] = "server_send_mesh_candidates_to_client";
        MESSAGE_TYPE["SERVER_TO_CLIENT_MESSAGE"] = "server_to_client_message";
        MESSAGE_TYPE["PEER_TO_SERVER_COMMAND"] = "server_command";
        MESSAGE_TYPE["PEER_TEXT_MESSAGE"] = "peer_text_message";
        MESSAGE_TYPE["SERVER_TO_PEER_MESSAGE"] = "server_to_peer_message";
        MESSAGE_TYPE["SERVER_HEARTBEAT"] = "server_heartbeat";
        MESSAGE_TYPE["CLIENT_HEARTBEAT"] = "client_heartbeat";
    })(MESSAGE_TYPE = Messages.MESSAGE_TYPE || (Messages.MESSAGE_TYPE = {}));
    let SERVER_COMMAND;
    (function (SERVER_COMMAND) {
        SERVER_COMMAND["UNDEFINED"] = "undefined";
        SERVER_COMMAND["DISCONNECT_CLIENT"] = "disconnect_client";
        SERVER_COMMAND["SPAWN_OBJECT"] = "spawn_object";
        SERVER_COMMAND["ASSIGN_OBJECT_TO_CLIENT"] = "assign_object_to_client";
        SERVER_COMMAND["DESTROY_OBJECT"] = "destroy_object";
        SERVER_COMMAND["KEYS_INPUT"] = "keys_input";
        SERVER_COMMAND["MOVEMENT_VALUE"] = "movement_value";
        //
        SERVER_COMMAND["CREATE_MESH"] = "createMesh";
    })(SERVER_COMMAND = Messages.SERVER_COMMAND || (Messages.SERVER_COMMAND = {}));
    class MessageBase {
        messageType;
        originatorId;
        constructor(messageType, originatorId) {
            this.messageType = messageType;
            this.originatorId = originatorId;
        }
        static deserialize(_message) {
            let parsed = JSON.parse(_message);
            let message = new MessageBase(parsed.messageType, parsed.originatorId);
            Object.assign(message, parsed);
            return message;
        }
        serialize() {
            return JSON.stringify(this);
        }
    }
    Messages.MessageBase = MessageBase;
    class IdAssigned extends MessageBase {
        assignedId;
        constructor(assignedId) {
            super(MESSAGE_TYPE.ID_ASSIGNED, "Server");
            this.assignedId = assignedId;
        }
    }
    Messages.IdAssigned = IdAssigned;
    class LoginRequest extends MessageBase {
        loginUserName;
        constructor(_originatorId, loginUserName = "") {
            super(MESSAGE_TYPE.LOGIN_REQUEST, _originatorId);
            this.loginUserName = loginUserName;
        }
    }
    Messages.LoginRequest = LoginRequest;
    class LoginResponse extends MessageBase {
        loginSuccess;
        originatorUsername;
        constructor(loginSuccess, _assignedId, originatorUsername) {
            super(MESSAGE_TYPE.LOGIN_RESPONSE, _assignedId);
            this.loginSuccess = loginSuccess;
            this.originatorUsername = originatorUsername;
        }
    }
    Messages.LoginResponse = LoginResponse;
    class RtcOffer extends MessageBase {
        idRemote;
        offer;
        constructor(_originatorId, idRemote, offer) {
            super(MESSAGE_TYPE.RTC_OFFER, _originatorId);
            this.idRemote = idRemote;
            this.offer = offer;
        }
    }
    Messages.RtcOffer = RtcOffer;
    class RtcAnswer extends MessageBase {
        targetId;
        answer;
        constructor(_originatorId, targetId, answer) {
            super(MESSAGE_TYPE.RTC_ANSWER, _originatorId);
            this.targetId = targetId;
            this.answer = answer;
        }
    }
    Messages.RtcAnswer = RtcAnswer;
    class IceCandidate extends MessageBase {
        targetId;
        candidate;
        constructor(_originatorId, targetId, candidate) {
            super(MESSAGE_TYPE.ICE_CANDIDATE, _originatorId);
            this.targetId = targetId;
            this.candidate = candidate;
        }
    }
    Messages.IceCandidate = IceCandidate;
    class ToServer extends MessageBase {
        messageData;
        originatorUserName;
        constructor(_originatorId, messageData, originatorUserName) {
            super(MESSAGE_TYPE.CLIENT_TO_SERVER_MESSAGE, _originatorId);
            this.messageData = messageData;
            this.originatorUserName = originatorUserName;
        }
    }
    Messages.ToServer = ToServer;
    class ToClient extends MessageBase {
        messageData;
        constructor(messageData) {
            super(MESSAGE_TYPE.SERVER_TO_CLIENT_MESSAGE, "SERVER");
            this.messageData = messageData;
        }
    }
    Messages.ToClient = ToClient;
    class ClientReady extends MessageBase {
        constructor(_originatorId) {
            super(MESSAGE_TYPE.CLIENT_READY_FOR_MESH_CONNECTION, _originatorId);
        }
    }
    Messages.ClientReady = ClientReady;
    // export class ServerSendMeshClientArray extends MessageBase {
    //   constructor(public candidateArray: Client[]) {
    //     super(MESSAGE_TYPE.SERVER_SEND_MESH_CANDIDATES_TO_CLIENT, "SERVER");
    //   }
    // }
    class ClientMeshReady extends MessageBase {
        constructor(_originatorId) {
            super(MESSAGE_TYPE.CLIENT_READY_FOR_MESH_CONNECTION, _originatorId);
        }
    }
    Messages.ClientMeshReady = ClientMeshReady;
    class ClientIsMeshConnected extends MessageBase {
        constructor(_originatorId) {
            super(MESSAGE_TYPE.CLIENT_MESH_CONNECTED, _originatorId);
        }
    }
    Messages.ClientIsMeshConnected = ClientIsMeshConnected;
    class PeerTemplate {
        messageType;
        originatorId;
        commandType;
        constructor(messageType, originatorId, commandType) {
            this.messageType = messageType;
            this.originatorId = originatorId;
            this.commandType = commandType;
        }
    }
    Messages.PeerTemplate = PeerTemplate;
    class PeerSimpleText extends PeerTemplate {
        messageData;
        originatorUserName;
        constructor(_originatorId, messageData, originatorUserName) {
            super(MESSAGE_TYPE.PEER_TEXT_MESSAGE, _originatorId, SERVER_COMMAND.UNDEFINED);
            this.messageData = messageData;
            this.originatorUserName = originatorUserName;
        }
    }
    Messages.PeerSimpleText = PeerSimpleText;
    class PeerDisconnectClient extends PeerTemplate {
        constructor(_originatorId) {
            super(MESSAGE_TYPE.PEER_TO_SERVER_COMMAND, _originatorId, SERVER_COMMAND.DISCONNECT_CLIENT);
        }
    }
    Messages.PeerDisconnectClient = PeerDisconnectClient;
    class ServerHeartbeat extends MessageBase {
        messageData;
        constructor(messageData) {
            super(MESSAGE_TYPE.SERVER_HEARTBEAT, "SERVER");
            this.messageData = messageData;
        }
    }
    Messages.ServerHeartbeat = ServerHeartbeat;
    class ClientHeartbeat extends MessageBase {
        messageData;
        constructor(_originatorId, messageData) {
            super(MESSAGE_TYPE.CLIENT_HEARTBEAT, _originatorId);
            this.messageData = messageData;
        }
    }
    Messages.ClientHeartbeat = ClientHeartbeat;
})(Messages || (Messages = {}));
///<reference path="../Messages.ts"/>
///<reference path="../../../Core/Build/FudgeCore.d.ts"/>
var FudgeClient;
///<reference path="../Messages.ts"/>
///<reference path="../../../Core/Build/FudgeCore.d.ts"/>
(function (FudgeClient_1) {
    var ƒ = FudgeCore;
    class FudgeClient extends EventTarget {
        id;
        name;
        wsServerUrl = undefined;
        wsServer;
        peers = {};
        ownPeerConnection;
        idRemote;
        ownPeerDataChannel;
        remoteEventPeerDataChannel;
        isInitiator;
        // More info from here https://developer.mozilla.org/en-US/docs/Web/API/RTCConfiguration
        // tslint:disable-next-line: typedef
        configuration = {
            iceServers: [
                { urls: "stun:stun2.1.google.com:19302" },
                { urls: "stun:stun.example.com" }
            ]
        };
        constructor() {
            super();
            this.name = "";
            this.id = "undefined";
            this.idRemote = "";
            this.isInitiator = false;
            this.remoteEventPeerDataChannel = undefined;
            this.createRTCPeerConnectionAndAddEventListeners();
        }
        connectToServer = (_uri = "ws://localhost:8080") => {
            this.wsServerUrl = _uri;
            this.wsServer = new WebSocket(_uri);
            this.addWebSocketEventListeners();
        };
        loginToServer = (_requestingUsername) => {
            try {
                const loginMessage = new Messages.LoginRequest(this.id, _requestingUsername);
                this.sendToServer(loginMessage);
            }
            catch (error) {
                ƒ.Debug.fudge("Unexpected error: Sending Login Request", error);
            }
        };
        sendToServer = (_message) => {
            let stringifiedMessage = _message.serialize();
            if (this.wsServer.readyState == 1) {
                this.wsServer.send(stringifiedMessage);
            }
            else {
                ƒ.Debug.fudge("Websocket Connection closed unexpectedly");
            }
        };
        connectToPeer = (_idRemote) => {
            this.idRemote = _idRemote;
            this.beginPeerConnectionNegotiation(this.idRemote);
        };
        sendToPeer = (_messageToSend) => {
            let messageObject = new Messages.PeerSimpleText(this.id, _messageToSend, this.name);
            let stringifiedMessage = JSON.stringify(messageObject);
            ƒ.Debug.fudge(stringifiedMessage);
            if (this.isInitiator && this.ownPeerDataChannel) {
                this.ownPeerDataChannel.send(stringifiedMessage);
            }
            else if (!this.isInitiator && this.remoteEventPeerDataChannel && this.remoteEventPeerDataChannel.readyState === "open") {
                ƒ.Debug.fudge("Sending Message via received Datachannel");
                this.remoteEventPeerDataChannel.send(stringifiedMessage);
            }
            else {
                console.error("Datachannel: Connection unexpectedly lost");
            }
        };
        // ----------------------
        createRTCPeerConnectionAndAddEventListeners = () => {
            ƒ.Debug.fudge("Creating RTC Connection");
            try {
                this.ownPeerConnection = new RTCPeerConnection(this.configuration);
                this.ownPeerConnection.addEventListener("icecandidate", this.sendIceCandidatesToPeer);
            }
            catch (error) {
                console.error("Unexpecte Error: Creating Client Peerconnection", error);
            }
        };
        addWebSocketEventListeners = () => {
            try {
                this.wsServer.addEventListener("open", (_connOpen) => {
                    ƒ.Debug.fudge("Connected to the signaling server", _connOpen);
                });
                // this.wsServer.addEventListener("error", (_err: Event) => {
                // });
                this.wsServer.addEventListener("message", (_receivedMessage) => {
                    this.parseMessageAndHandleMessageType(_receivedMessage);
                });
            }
            catch (error) {
                ƒ.Debug.fudge("Unexpected Error: Adding websocket Eventlistener", error);
            }
        };
        parseMessageAndHandleMessageType = (_receivedMessage) => {
            // tslint:disable-next-line: typedef
            let message = Messages.MessageBase.deserialize(_receivedMessage.data);
            switch (message.messageType) {
                case Messages.MESSAGE_TYPE.ID_ASSIGNED:
                    ƒ.Debug.fudge("ID received", message.assignedId);
                    this.assignIdAndSendConfirmation(message);
                    break;
                case Messages.MESSAGE_TYPE.LOGIN_RESPONSE:
                    this.loginValidAddUser(message.originatorId, message.loginSuccess, message.originatorUsername);
                    break;
                case Messages.MESSAGE_TYPE.SERVER_HEARTBEAT:
                    this.wsServer.dispatchEvent(new CustomEvent("receive", { detail: message }));
                    break;
                case Messages.MESSAGE_TYPE.CLIENT_TO_SERVER_MESSAGE:
                    // ƒ.Debug.fudge("BroadcastMessage received, requires further handling", _receivedMessage);
                    this.wsServer.dispatchEvent(new CustomEvent("receive", { detail: message }));
                    break;
                case Messages.MESSAGE_TYPE.SERVER_TO_CLIENT_MESSAGE:
                    this.displayServerMessage(_receivedMessage.data);
                    break;
                case Messages.MESSAGE_TYPE.RTC_OFFER:
                    // ƒ.Debug.fudge("Received offer, current signaling state: ", this.connection.signalingState);
                    this.receiveNegotiationOfferAndSetRemoteDescription(message);
                    break;
                case Messages.MESSAGE_TYPE.RTC_ANSWER:
                    // ƒ.Debug.fudge("Received answer, current signaling state: ", this.connection.signalingState);
                    this.receiveAnswerAndSetRemoteDescription(message.originatorId, message.answer);
                    break;
                case Messages.MESSAGE_TYPE.ICE_CANDIDATE:
                    // ƒ.Debug.fudge("Received candidate, current signaling state: ", this.connection.signalingState);
                    this.addReceivedCandidateToPeerConnection(message);
                    break;
            }
        };
        beginPeerConnectionNegotiation = (_idRemote) => {
            // Initiator is important for direct p2p connections
            this.isInitiator = true;
            try {
                this.ownPeerDataChannel = this.ownPeerConnection.createDataChannel("localDataChannel");
                this.ownPeerDataChannel.addEventListener("open", this.dataChannelStatusChangeHandler);
                this.ownPeerDataChannel.addEventListener("close", this.dataChannelStatusChangeHandler);
                this.ownPeerDataChannel.addEventListener("message", this.dataChannelMessageHandler);
                ƒ.Debug.fudge("Senders", this.ownPeerConnection.getSenders());
            }
            catch (error) {
                console.error("Unexpected Error: Creating Client Datachannel and adding Listeners", error);
            }
            this.ownPeerConnection.createOffer()
                .then(async (offer) => {
                ƒ.Debug.fudge("Beginning of createOffer in InitiateConnection, Expected 'stable', got:  ", this.ownPeerConnection.signalingState);
                return offer;
            })
                .then(async (offer) => {
                await this.ownPeerConnection.setLocalDescription(offer);
                ƒ.Debug.fudge("Setting LocalDesc, Expected 'have-local-offer', got:  ", this.ownPeerConnection.signalingState);
            })
                .then(() => {
                this.createNegotiationOfferAndSendToPeer(_idRemote);
            })
                .catch((error) => {
                console.error("Unexpected Error: Creating RTCOffer", error);
            });
        };
        createNegotiationOfferAndSendToPeer = (_idRemote) => {
            try {
                const offerMessage = new Messages.RtcOffer(this.id, _idRemote, this.ownPeerConnection.localDescription);
                this.sendToServer(offerMessage);
                ƒ.Debug.fudge("Sent offer to remote peer, Expected 'have-local-offer', got:  ", this.ownPeerConnection.signalingState);
            }
            catch (error) {
                console.error("Unexpected Error: Creating Object and Sending RTC Offer", error);
            }
        };
        receiveNegotiationOfferAndSetRemoteDescription = (_offerMessage) => {
            if (!this.ownPeerConnection) {
                console.error("Unexpected Error: OwnPeerConnection error");
                return;
            }
            this.ownPeerConnection.addEventListener("datachannel", this.receiveDataChannelAndEstablishConnection);
            this.idRemote = _offerMessage.originatorId;
            let offerToSet = _offerMessage.offer;
            if (!offerToSet) {
                return;
            }
            this.ownPeerConnection.setRemoteDescription(new RTCSessionDescription(offerToSet))
                .then(async () => {
                ƒ.Debug.fudge("Received Offer and Set Descripton, Expected 'have-remote-offer', got:  ", this.ownPeerConnection.signalingState);
                this.answerNegotiationOffer(_offerMessage.originatorId);
            })
                .catch((error) => {
                console.error("Unexpected Error: Setting Remote Description and Creating Answer", error);
            });
            ƒ.Debug.fudge("End of Function Receive offer, Expected 'stable', got:  ", this.ownPeerConnection.signalingState);
        };
        answerNegotiationOffer = (_idRemote) => {
            let ultimateAnswer;
            // Signaling example from here https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/createAnswer
            this.ownPeerConnection.createAnswer()
                .then(async (answer) => {
                ƒ.Debug.fudge("Create Answer before setting local desc: Expected 'have-remote-offer', got:  ", this.ownPeerConnection.signalingState);
                ultimateAnswer = new RTCSessionDescription(answer);
                return await this.ownPeerConnection.setLocalDescription(ultimateAnswer);
            }).then(async () => {
                ƒ.Debug.fudge("CreateAnswerFunction after setting local descp, Expected 'stable', got:  ", this.ownPeerConnection.signalingState);
                const answerMessage = new Messages.RtcAnswer(this.id, _idRemote, ultimateAnswer);
                ƒ.Debug.fudge("AnswerObject: ", answerMessage);
                await this.sendToServer(answerMessage);
            })
                .catch((error) => {
                console.error("Unexpected error: Creating RTC Answer failed", error);
            });
        };
        // TODO: find the purpose of localhostId
        receiveAnswerAndSetRemoteDescription = (_localhostId, _answer) => {
            try {
                let descriptionAnswer = new RTCSessionDescription(_answer);
                this.ownPeerConnection.setRemoteDescription(descriptionAnswer);
            }
            catch (error) {
                console.error("Unexpected Error: Setting Remote Description from Answer", error);
            }
        };
        // tslint:disable-next-line: no-any
        sendIceCandidatesToPeer = ({ candidate }) => {
            try {
                ƒ.Debug.fudge("Sending ICECandidates from: ", this.id);
                let message = new Messages.IceCandidate(this.id, this.idRemote, candidate);
                this.sendToServer(message);
            }
            catch (error) {
                console.error("Unexpected Error: Creating and Sending ICECandidates to Peer", error);
            }
        };
        addReceivedCandidateToPeerConnection = async (_receivedIceMessage) => {
            if (_receivedIceMessage.candidate) {
                try {
                    await this.ownPeerConnection.addIceCandidate(_receivedIceMessage.candidate);
                }
                catch (error) {
                    console.error("Unexpected Error: Adding Ice Candidate", error);
                }
            }
        };
        receiveDataChannelAndEstablishConnection = (_event) => {
            this.remoteEventPeerDataChannel = _event.channel;
            if (this.remoteEventPeerDataChannel) {
                this.remoteEventPeerDataChannel.addEventListener("message", this.dataChannelMessageHandler);
                // this.remoteEventPeerDataChannel.addEventListener("open", this.enableKeyboardPressesForSending);
                this.remoteEventPeerDataChannel.addEventListener("close", this.dataChannelStatusChangeHandler);
            }
            else {
                console.error("Unexpected Error: RemoteDatachannel");
            }
        };
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
        dataChannelMessageHandler = (_messageEvent) => {
            if (_messageEvent) {
                // tslint:disable-next-line: no-any
                let parsedObject = JSON.parse(_messageEvent.data);
                ƒ.Debug.fudge(_messageEvent.type, parsedObject);
                // FudgeNetwork.UiElementHandler.chatbox.innerHTML += "\n" + parsedObject.originatorUserName + ": " + parsedObject.messageData;
                // FudgeNetwork.UiElementHandler.chatbox.scrollTop = FudgeNetwork.UiElementHandler.chatbox.scrollHeight;
                // this.ownPeerConnection.dispatchEvent(new CustomEvent("receive", { detail: parsedObject }));
                // this.remoteEventPeerDataChannel?.dispatchEvent(new CustomEvent("receive", { detail: parsedObject }));
                this.dispatchEvent(new CustomEvent("receive", { detail: parsedObject }));
            }
        };
        //   public getLocalClientId(): string {
        //     return this.localClientID;
        //   }
        //   public getLocalUserName(): string {
        //     return this.localUserName == "" || undefined ? "Kein Username vergeben" : this.localUserName;
        //   }
        displayServerMessage(_messageToDisplay) {
            // TODO: this must be handled by creator
            // let parsedObject: Messages.ToClient = this.parseReceivedMessageAndReturnObject(_messageToDisplay);
        }
        loginValidAddUser = (_assignedId, _loginSuccess, _originatorUserName) => {
            if (_loginSuccess) {
                this.setOwnUserName(_originatorUserName);
                ƒ.Debug.fudge("Logged in to server as: " + this.name, this.id);
            }
            else {
                ƒ.Debug.fudge("Login failed, username taken", this.name, this.id);
            }
        };
        assignIdAndSendConfirmation = (_message) => {
            try {
                this.setOwnClientId(_message.assignedId);
                this.sendToServer(new Messages.IdAssigned(this.id));
            }
            catch (error) {
                ƒ.Debug.fudge("Unexpected Error: Sending ID Confirmation", error);
            }
        };
        stringifyObjectForNetworkSending = (_objectToStringify) => {
            let stringifiedObject = "";
            try {
                stringifiedObject = JSON.stringify(_objectToStringify);
            }
            catch (error) {
                ƒ.Debug.fudge("JSON Parse failed", error);
            }
            return stringifiedObject;
        };
        setOwnClientId(_id) {
            this.id = _id;
        }
        setOwnUserName(_name) {
            this.name = _name;
        }
        dataChannelStatusChangeHandler = (event) => {
            //TODO Reconnection logic
            ƒ.Debug.fudge("Channel Event happened", event);
        };
    }
    FudgeClient_1.FudgeClient = FudgeClient;
})(FudgeClient || (FudgeClient = {}));
var FudgeClient;
(function (FudgeClient) {
    class RtcConnection {
        idRemote = "";
        // TODO: figure out if it makes sense to create all these connections... RTCPeerConnection is undefined.
        dataChannel;
        peerConnection;
        mediaStream;
    }
    FudgeClient.RtcConnection = RtcConnection;
})(FudgeClient || (FudgeClient = {}));
//# sourceMappingURL=FudgeClient.js.map