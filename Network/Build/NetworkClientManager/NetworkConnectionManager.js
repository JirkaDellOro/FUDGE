"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const FudgeNetwork = __importStar(require("./../ModuleCollector"));
class NetworkConnectionManager {
    constructor() {
        this.signalingServerUrl = "ws://localhost:8080";
        // More info from here https://developer.mozilla.org/en-US/docs/Web/API/RTCConfiguration
        // tslint:disable-next-line: typedef
        this.configuration = {
            iceServers: [
                { urls: "stun:stun2.1.google.com:19302" },
                { urls: "stun:stun.example.com" }
            ]
        };
        this.connectToSpecifiedSignalingServer = () => {
            try {
                this.webSocketConnectionToSignalingServer = new WebSocket(this.signalingServerUrl);
                this.addWsEventListeners();
            }
            catch (error) {
                console.log("Websocket Generation gescheitert");
            }
        };
        this.sendMessage = (_message) => {
            let stringifiedMessage = this.stringifyObjectForNetworkSending(_message);
            if (this.webSocketConnectionToSignalingServer.readyState == 1) {
                this.webSocketConnectionToSignalingServer.send(stringifiedMessage);
            }
            else {
                console.error("Websocket Connection closed unexpectedly");
            }
        };
        this.sendMessageViaDirectPeerConnection = (_messageToSend) => {
            let messageObject = new FudgeNetwork.PeerMessageSimpleText(this.ownClientId, _messageToSend);
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
        this.checkChosenUsernameAndCreateLoginRequest = (_loginName) => {
            if (_loginName.length <= 0) {
                console.log("Please enter username");
                return;
            }
            this.createLoginRequestAndSendToServer(_loginName);
        };
        this.checkUsernameToConnectToAndInitiateConnection = (_chosenUserNameToConnectTo) => {
            if (_chosenUserNameToConnectTo.length === 0) {
                console.error("Enter a username 😉");
                return;
            }
            this.remoteClientId = _chosenUserNameToConnectTo;
            this.initiateConnectionByCreatingDataChannelAndCreatingOffer(this.remoteClientId);
        };
        this.sendDisconnectRequest = () => {
            try {
                let dcRequest = new FudgeNetwork.PeerMessageDisconnectClient(this.ownClientId);
                let stringifiedObject = this.stringifyObjectForNetworkSending(dcRequest);
                this.sendPeerMessageToServer(stringifiedObject);
            }
            catch (error) {
                console.error("Unexpected Error: Disconnect Request", error);
            }
        };
        this.sendKeyPress = (_keyCode) => {
            try {
                if (this.remoteEventPeerDataChannel != undefined) {
                    let keyPressMessage = new FudgeNetwork.PeerMessageKeysInput(this.ownClientId, _keyCode);
                    let stringifiedObject = this.stringifyObjectForNetworkSending(keyPressMessage);
                    this.sendPeerMessageToServer(stringifiedObject);
                }
            }
            catch (error) {
                console.error("Unexpected Error: Send Key Press", error);
            }
        };
        this.enableKeyboardPressesForSending = (_keyCode) => {
            if (_keyCode == 27) {
                this.sendDisconnectRequest();
            }
            else {
                this.sendKeyPress(_keyCode);
            }
        };
        this.createLoginRequestAndSendToServer = (_requestingUsername) => {
            try {
                const loginMessage = new FudgeNetwork.NetworkMessageLoginRequest(this.ownClientId, _requestingUsername);
                this.sendMessage(loginMessage);
            }
            catch (error) {
                console.error("Unexpected error: Sending Login Request", error);
            }
        };
        this.addWsEventListeners = () => {
            try {
                this.webSocketConnectionToSignalingServer.addEventListener("open", (_connOpen) => {
                    console.log("Conneced to the signaling server", _connOpen);
                });
                this.webSocketConnectionToSignalingServer.addEventListener("error", (_err) => {
                    console.error(_err);
                });
                this.webSocketConnectionToSignalingServer.addEventListener("message", (_receivedMessage) => {
                    this.parseMessageAndCallCorrespondingMessageHandler(_receivedMessage);
                });
            }
            catch (error) {
                console.error("Unexpected Error: Adding websocket Eventlistener", error);
            }
        };
        this.parseMessageAndCallCorrespondingMessageHandler = (_receivedMessage) => {
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
                    this.receiveOfferAndSetRemoteDescriptionThenCreateAndSendAnswer(objectifiedMessage);
                    break;
                case FudgeNetwork.MESSAGE_TYPE.RTC_ANSWER:
                    // console.log("Received answer, current signaling state: ", this.connection.signalingState);
                    this.receiveAnswerAndSetRemoteDescription(objectifiedMessage.clientId, objectifiedMessage.answer);
                    break;
                case FudgeNetwork.MESSAGE_TYPE.ICE_CANDIDATE:
                    // console.log("Received candidate, current signaling state: ", this.connection.signalingState);
                    this.handleCandidate(objectifiedMessage);
                    break;
            }
        };
        this.createRTCPeerConnectionAndAddListeners = () => {
            console.log("Creating RTC Connection");
            try {
                this.ownPeerConnection = new RTCPeerConnection(this.configuration);
                this.ownPeerConnection.addEventListener("icecandidate", this.sendNewIceCandidatesToPeer);
            }
            catch (error) {
                console.error("Unexpecte Error: Creating Client Peerconnection", error);
            }
        };
        this.assignIdAndSendConfirmation = (_message) => {
            try {
                this.ownClientId = _message.assignedId;
                this.sendMessage(new FudgeNetwork.NetworkMessageIdAssigned(this.ownClientId));
            }
            catch (error) {
                console.error("Unexpected Error: Sending ID Confirmation", error);
            }
        };
        this.initiateConnectionByCreatingDataChannelAndCreatingOffer = (_userNameForOffer) => {
            // Initiator is important for direct p2p connections
            this.isInitiator = true;
            try {
                this.ownPeerDataChannel = this.ownPeerConnection.createDataChannel("localDataChannel");
                this.ownPeerDataChannel.addEventListener("open", this.dataChannelStatusChangeHandler);
                this.ownPeerDataChannel.addEventListener("close", this.dataChannelStatusChangeHandler);
                this.ownPeerDataChannel.addEventListener("message", this.dataChannelMessageHandler);
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
                this.createOfferMessageAndSendToRemote(_userNameForOffer);
            })
                .catch((error) => {
                console.error("Unexpected Error: Creating RTCOffer", error);
            });
        };
        this.createOfferMessageAndSendToRemote = (_userNameForOffer) => {
            try {
                const offerMessage = new FudgeNetwork.NetworkMessageRtcOffer(this.ownClientId, _userNameForOffer, this.ownPeerConnection.localDescription);
                this.sendMessage(offerMessage);
                console.log("Sent offer to remote peer, Expected 'have-local-offer', got:  ", this.ownPeerConnection.signalingState);
            }
            catch (error) {
                console.error("Unexpected Error: Creating Object and Sending RTC Offer", error);
            }
        };
        this.createAnswerAndSendToRemote = (_remoteIdToAnswerTo) => {
            let ultimateAnswer;
            // Signaling example from here https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/createAnswer
            this.ownPeerConnection.createAnswer()
                .then(async (answer) => {
                console.log("Create Answer before settign local desc: Expected 'have-remote-offer', got:  ", this.ownPeerConnection.signalingState);
                ultimateAnswer = new RTCSessionDescription(answer);
                return await this.ownPeerConnection.setLocalDescription(ultimateAnswer);
            }).then(async () => {
                console.log("CreateAnswerFunction after setting local descp, Expected 'stable', got:  ", this.ownPeerConnection.signalingState);
                const answerMessage = new FudgeNetwork.NetworkMessageRtcAnswer(this.ownClientId, _remoteIdToAnswerTo, "", ultimateAnswer);
                console.log("AnswerObject: ", answerMessage);
                await this.sendMessage(answerMessage);
            })
                .catch((error) => {
                console.error("Unexpected error: Creating RTC Answer failed", error);
            });
        };
        // tslint:disable-next-line: no-any
        this.sendNewIceCandidatesToPeer = ({ candidate }) => {
            try {
                console.log("Sending ICECandidates from: ", this.ownClientId);
                let message = new FudgeNetwork.NetworkMessageIceCandidate(this.ownClientId, this.remoteClientId, candidate);
                this.sendMessage(message);
            }
            catch (error) {
                console.error("Unexpected Error: Creating and Sending ICECandidates to Peer", error);
            }
        };
        this.loginValidAddUser = (_assignedId, _loginSuccess, _originatorUserName) => {
            if (_loginSuccess) {
                this.ownUserName = _originatorUserName;
                console.log("Local Username: " + this.ownUserName);
            }
            else {
                console.log("Login failed, username taken");
            }
        };
        // TODO https://stackoverflow.com/questions/37787372/domexception-failed-to-set-remote-offer-sdp-called-in-wrong-state-state-sento/37787869
        // DOMException: Failed to set remote offer sdp: Called in wrong state: STATE_SENTOFFER
        this.receiveOfferAndSetRemoteDescriptionThenCreateAndSendAnswer = (_offerMessage) => {
            if (!this.ownPeerConnection) {
                console.error("Unexpected Error: OwnPeerConnection error");
                return;
            }
            this.ownPeerConnection.addEventListener("datachannel", this.receiveDataChannel);
            this.remoteClientId = _offerMessage.originatorId;
            let offerToSet = _offerMessage.offer;
            if (!offerToSet) {
                return;
            }
            this.ownPeerConnection.setRemoteDescription(new RTCSessionDescription(offerToSet))
                .then(async () => {
                console.log("Received Offer and Set Descirpton, Expected 'have-remote-offer', got:  ", this.ownPeerConnection.signalingState);
                await this.createAnswerAndSendToRemote(_offerMessage.originatorId);
            })
                .catch((error) => {
                console.error("Unexpected Error: Setting Remote Description and Creating Answer", error);
            });
            console.log("End of Function Receive offer, Expected 'stable', got:  ", this.ownPeerConnection.signalingState);
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
        this.handleCandidate = async (_receivedIceMessage) => {
            if (_receivedIceMessage.candidate) {
                try {
                    await this.ownPeerConnection.addIceCandidate(_receivedIceMessage.candidate);
                }
                catch (error) {
                    console.error("Unexpected Error: Adding Ice Candidate", error);
                }
            }
        };
        this.receiveDataChannel = (event) => {
            this.remoteEventPeerDataChannel = event.channel;
            if (this.remoteEventPeerDataChannel) {
                this.remoteEventPeerDataChannel.addEventListener("message", this.dataChannelMessageHandler);
                // this.remoteEventPeerDataChannel.addEventListener("open", this.enableKeyboardPressesForSending);
                this.remoteEventPeerDataChannel.addEventListener("close", this.dataChannelStatusChangeHandler);
            }
            else {
                console.error("Unexpected Error: RemoteDatachannel");
            }
        };
        this.sendPeerMessageToServer = (_messageToSend) => {
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
        this.dataChannelStatusChangeHandler = (event) => {
            //TODO Reconnection logic
            console.log("Channel Event happened", event);
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
                let parsedObject = this.parseReceivedMessageAndReturnObject(_messageEvent);
                FudgeNetwork.UiElementHandler.chatbox.innerHTML += "\n" + this.remoteClientId + ": " + parsedObject.messageData;
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
        this.ownUserName = "";
        this.ownClientId = "undefined";
        this.remoteClientId = "";
        this.isInitiator = false;
        this.remoteEventPeerDataChannel = undefined;
        this.createRTCPeerConnectionAndAddListeners();
    }
    // public startUpSignalingServerFile = (_serverFileUri: string): void => {
    //     // TODO You can start the signaling server inside  the componente, so it can be toggled/clicked to make it happen
    //     let server_test = require("./Server/ServerMain");
    // }
    getOwnClientId() {
        return this.ownClientId;
    }
}
exports.NetworkConnectionManager = NetworkConnectionManager;
