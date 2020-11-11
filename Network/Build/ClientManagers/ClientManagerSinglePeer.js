"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientManagerSinglePeer = void 0;
const FudgeNetwork = __importStar(require("../ModuleCollector"));
class ClientManagerSinglePeer {
    constructor() {
        this.signalingServerConnectionUrl = "ws://localhost:8080";
        // More info from here https://developer.mozilla.org/en-US/docs/Web/API/RTCConfiguration
        // tslint:disable-next-line: typedef
        this.configuration = {
            iceServers: [
                { urls: "stun:stun2.1.google.com:19302" },
                { urls: "stun:stun.example.com" }
            ]
        };
        // public startUpSignalingServerFile = (_serverFileUri: string): void => {
        //     // TODO You can start the signaling server inside  the componente, so it can be toggled/clicked to make it happen
        //     let server_test = require("./Server/ServerMain");
        // }
        this.connectToSignalingServer = () => {
            try {
                this.webSocketConnectionToSignalingServer = new WebSocket(this.signalingServerConnectionUrl);
                this.addWebSocketEventListeners();
            }
            catch (error) {
                console.log("Websocket Generation gescheitert");
            }
        };
        this.addWebSocketEventListeners = () => {
            try {
                this.webSocketConnectionToSignalingServer.addEventListener("open", (_connOpen) => {
                    console.log("Conneced to the signaling server", _connOpen);
                });
                this.webSocketConnectionToSignalingServer.addEventListener("error", (_err) => {
                    console.error(_err);
                });
                this.webSocketConnectionToSignalingServer.addEventListener("message", (_receivedMessage) => {
                    this.parseMessageAndHandleMessageType(_receivedMessage);
                });
            }
            catch (error) {
                console.error("Unexpected Error: Adding websocket Eventlistener", error);
            }
        };
        this.parseMessageAndHandleMessageType = (_receivedMessage) => {
            // tslint:disable-next-line: typedef
            let objectifiedMessage = this.parseReceivedMessageAndReturnObject(_receivedMessage);
            switch (objectifiedMessage.messageType) {
                case FudgeNetwork.MESSAGE_TYPE.ID_ASSIGNED:
                    console.log("ID received, assigning to self");
                    this.assignIdAndSendConfirmation(objectifiedMessage);
                    break;
                case FudgeNetwork.MESSAGE_TYPE.LOGIN_RESPONSE:
                    this.loginValidAddUser(objectifiedMessage.originatorId, objectifiedMessage.loginSuccess, objectifiedMessage.originatorUsername);
                    break;
                case FudgeNetwork.MESSAGE_TYPE.RTC_OFFER:
                    // console.log("Received offer, current signaling state: ", this.connection.signalingState);
                    this.receiveNegotiationOfferAndSetRemoteDescription(objectifiedMessage);
                    break;
                case FudgeNetwork.MESSAGE_TYPE.RTC_ANSWER:
                    // console.log("Received answer, current signaling state: ", this.connection.signalingState);
                    this.receiveAnswerAndSetRemoteDescription(objectifiedMessage.clientId, objectifiedMessage.answer);
                    break;
                case FudgeNetwork.MESSAGE_TYPE.ICE_CANDIDATE:
                    // console.log("Received candidate, current signaling state: ", this.connection.signalingState);
                    this.addReceivedCandidateToPeerConnection(objectifiedMessage);
                    break;
            }
        };
        this.checkChosenUsernameAndCreateLoginRequest = (_loginName) => {
            if (_loginName.length <= 0) {
                console.log("Please enter username");
                return;
            }
            this.createLoginRequestAndSendToServer(_loginName);
        };
        this.createLoginRequestAndSendToServer = (_requestingUsername) => {
            try {
                const loginMessage = new FudgeNetwork.NetworkMessageLoginRequest(this.localClientID, _requestingUsername);
                this.sendMessageToSignalingServer(loginMessage);
            }
            catch (error) {
                console.error("Unexpected error: Sending Login Request", error);
            }
        };
        this.loginValidAddUser = (_assignedId, _loginSuccess, _originatorUserName) => {
            if (_loginSuccess) {
                this.setOwnUserName(_originatorUserName);
                console.log("Local Username: " + this.localUserName);
            }
            else {
                console.log("Login failed, username taken");
            }
        };
        this.checkUsernameToConnectToAndInitiateConnection = (_chosenUserNameToConnectTo) => {
            if (_chosenUserNameToConnectTo.length === 0) {
                console.error("Enter a username 😉");
                return;
            }
            this.remoteClientId = _chosenUserNameToConnectTo;
            this.beginPeerConnectionNegotiation(this.remoteClientId);
        };
        this.createRTCPeerConnectionAndAddEventListeners = () => {
            console.log("Creating RTC Connection");
            try {
                this.ownPeerConnection = new RTCPeerConnection(this.configuration);
                this.ownPeerConnection.addEventListener("icecandidate", this.sendIceCandidatesToPeer);
            }
            catch (error) {
                console.error("Unexpecte Error: Creating Client Peerconnection", error);
            }
        };
        this.assignIdAndSendConfirmation = (_message) => {
            try {
                this.setOwnClientId(_message.assignedId);
                this.sendMessageToSignalingServer(new FudgeNetwork.NetworkMessageIdAssigned(this.localClientID));
            }
            catch (error) {
                console.error("Unexpected Error: Sending ID Confirmation", error);
            }
        };
        this.beginPeerConnectionNegotiation = (_userNameForOffer) => {
            // Initiator is important for direct p2p connections
            this.isInitiator = true;
            try {
                this.ownPeerDataChannel = this.ownPeerConnection.createDataChannel("localDataChannel");
                this.ownPeerDataChannel.addEventListener("open", this.dataChannelStatusChangeHandler);
                this.ownPeerDataChannel.addEventListener("close", this.dataChannelStatusChangeHandler);
                this.ownPeerDataChannel.addEventListener("message", this.dataChannelMessageHandler);
                console.log(this.ownPeerConnection.getSenders);
            }
            catch (error) {
                console.error("Unexpected Error: Creating Client Datachannel and adding Listeners", error);
            }
            this.ownPeerConnection.createOffer()
                .then(async (offer) => {
                console.log("Beginning of createOffer in InitiateConnection, Expected 'stable', got:  ", this.ownPeerConnection.signalingState);
                return offer;
            })
                .then(async (offer) => {
                await this.ownPeerConnection.setLocalDescription(offer);
                console.log("Setting LocalDesc, Expected 'have-local-offer', got:  ", this.ownPeerConnection.signalingState);
            })
                .then(() => {
                this.createNegotiationOfferAndSendToPeer(_userNameForOffer);
            })
                .catch((error) => {
                console.error("Unexpected Error: Creating RTCOffer", error);
            });
        };
        this.createNegotiationOfferAndSendToPeer = (_userNameForOffer) => {
            try {
                const offerMessage = new FudgeNetwork.NetworkMessageRtcOffer(this.localClientID, _userNameForOffer, this.ownPeerConnection.localDescription);
                this.sendMessageToSignalingServer(offerMessage);
                console.log("Sent offer to remote peer, Expected 'have-local-offer', got:  ", this.ownPeerConnection.signalingState);
            }
            catch (error) {
                console.error("Unexpected Error: Creating Object and Sending RTC Offer", error);
            }
        };
        this.receiveNegotiationOfferAndSetRemoteDescription = (_offerMessage) => {
            if (!this.ownPeerConnection) {
                console.error("Unexpected Error: OwnPeerConnection error");
                return;
            }
            this.ownPeerConnection.addEventListener("datachannel", this.receiveDataChannelAndEstablishConnection);
            this.remoteClientId = _offerMessage.originatorId;
            let offerToSet = _offerMessage.offer;
            if (!offerToSet) {
                return;
            }
            this.ownPeerConnection.setRemoteDescription(new RTCSessionDescription(offerToSet))
                .then(async () => {
                console.log("Received Offer and Set Descirpton, Expected 'have-remote-offer', got:  ", this.ownPeerConnection.signalingState);
                await this.answerNegotiationOffer(_offerMessage.originatorId);
            })
                .catch((error) => {
                console.error("Unexpected Error: Setting Remote Description and Creating Answer", error);
            });
            console.log("End of Function Receive offer, Expected 'stable', got:  ", this.ownPeerConnection.signalingState);
        };
        this.answerNegotiationOffer = (_remoteIdToAnswerTo) => {
            let ultimateAnswer;
            // Signaling example from here https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/createAnswer
            this.ownPeerConnection.createAnswer()
                .then(async (answer) => {
                console.log("Create Answer before settign local desc: Expected 'have-remote-offer', got:  ", this.ownPeerConnection.signalingState);
                ultimateAnswer = new RTCSessionDescription(answer);
                return await this.ownPeerConnection.setLocalDescription(ultimateAnswer);
            }).then(async () => {
                console.log("CreateAnswerFunction after setting local descp, Expected 'stable', got:  ", this.ownPeerConnection.signalingState);
                const answerMessage = new FudgeNetwork.NetworkMessageRtcAnswer(this.localClientID, _remoteIdToAnswerTo, "", ultimateAnswer);
                console.log("AnswerObject: ", answerMessage);
                await this.sendMessageToSignalingServer(answerMessage);
            })
                .catch((error) => {
                console.error("Unexpected error: Creating RTC Answer failed", error);
            });
        };
        this.receiveAnswerAndSetRemoteDescription = (_localhostId, _answer) => {
            try {
                let descriptionAnswer = new RTCSessionDescription(_answer);
                this.ownPeerConnection.setRemoteDescription(descriptionAnswer);
            }
            catch (error) {
                console.error("Unexpected Error: Setting Remote Description from Answer", error);
            }
        };
        // tslint:disable-next-line: no-any
        this.sendIceCandidatesToPeer = ({ candidate }) => {
            try {
                console.log("Sending ICECandidates from: ", this.localClientID);
                let message = new FudgeNetwork.NetworkMessageIceCandidate(this.localClientID, this.remoteClientId, candidate);
                this.sendMessageToSignalingServer(message);
            }
            catch (error) {
                console.error("Unexpected Error: Creating and Sending ICECandidates to Peer", error);
            }
        };
        this.addReceivedCandidateToPeerConnection = async (_receivedIceMessage) => {
            if (_receivedIceMessage.candidate) {
                try {
                    await this.ownPeerConnection.addIceCandidate(_receivedIceMessage.candidate);
                }
                catch (error) {
                    console.error("Unexpected Error: Adding Ice Candidate", error);
                }
            }
        };
        this.receiveDataChannelAndEstablishConnection = (_event) => {
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
        this.stringifyObjectForNetworkSending = (_objectToStringify) => {
            let stringifiedObject = "";
            try {
                stringifiedObject = JSON.stringify(_objectToStringify);
            }
            catch (error) {
                console.error("JSON Parse failed", error);
            }
            return stringifiedObject;
        };
        this.sendMessageToSignalingServer = (_message) => {
            let stringifiedMessage = this.stringifyObjectForNetworkSending(_message);
            if (this.webSocketConnectionToSignalingServer.readyState == 1) {
                this.webSocketConnectionToSignalingServer.send(stringifiedMessage);
            }
            else {
                console.error("Websocket Connection closed unexpectedly");
            }
        };
        this.sendMessageToServerViaDataChannel = (_messageToSend) => {
            try {
                if (this.remoteEventPeerDataChannel) {
                    this.remoteEventPeerDataChannel.send(_messageToSend);
                }
            }
            catch (error) {
                console.error("Error occured when stringifying PeerMessage");
                console.error(error);
            }
        };
        this.sendMessageToSingularPeer = (_messageToSend) => {
            let messageObject = new FudgeNetwork.PeerMessageSimpleText(this.localClientID, _messageToSend, this.localUserName);
            let stringifiedMessage = this.stringifyObjectForNetworkSending(messageObject);
            console.log(stringifiedMessage);
            if (this.isInitiator && this.ownPeerDataChannel) {
                this.ownPeerDataChannel.send(stringifiedMessage);
            }
            else if (!this.isInitiator && this.remoteEventPeerDataChannel && this.remoteEventPeerDataChannel.readyState === "open") {
                console.log("Sending Message via received Datachannel");
                this.remoteEventPeerDataChannel.send(stringifiedMessage);
            }
            else {
                console.error("Datachannel: Connection unexpectedly lost");
            }
        };
        // tslint:disable-next-line: no-any
        this.parseReceivedMessageAndReturnObject = (_receivedMessage) => {
            // tslint:disable-next-line: no-any
            let objectifiedMessage;
            try {
                console.log("RECEIVED: ", _receivedMessage);
                objectifiedMessage = JSON.parse(_receivedMessage.data);
            }
            catch (error) {
                console.error("Invalid JSON", error);
            }
            return objectifiedMessage;
        };
        this.dataChannelMessageHandler = (_messageEvent) => {
            if (_messageEvent) {
                // tslint:disable-next-line: no-any
                console.log(_messageEvent);
                let parsedObject = this.parseReceivedMessageAndReturnObject(_messageEvent);
                FudgeNetwork.UiElementHandler.chatbox.innerHTML += "\n" + parsedObject.originatorUserName + ": " + parsedObject.messageData;
                FudgeNetwork.UiElementHandler.chatbox.scrollTop = FudgeNetwork.UiElementHandler.chatbox.scrollHeight;
            }
        };
        this.dataChannelStatusChangeHandler = (event) => {
            //TODO Reconnection logic
            console.log("Channel Event happened", event);
        };
        this.localUserName = "";
        this.localClientID = "undefined";
        this.remoteClientId = "";
        this.isInitiator = false;
        this.remoteEventPeerDataChannel = undefined;
        this.createRTCPeerConnectionAndAddEventListeners();
    }
    setOwnClientId(_id) {
        this.localClientID = _id;
    }
    getLocalClientId() {
        return this.localClientID;
    }
    setOwnUserName(_name) {
        this.localUserName = _name;
    }
    getLocalUserName() {
        return this.localUserName == "" || undefined ? "Kein Username vergeben" : this.localUserName;
    }
}
exports.ClientManagerSinglePeer = ClientManagerSinglePeer;
