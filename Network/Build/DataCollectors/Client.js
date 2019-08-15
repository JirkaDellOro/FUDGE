"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Client {
    // public connectedRoom: ServerRoom | null;
    constructor(websocketConnection, uniqueClientId, loginName) {
        this.clientConnection = websocketConnection || null;
        this.peerConnection = null;
        this.dataChannel = null;
        this.id = uniqueClientId || "";
        this.userName = loginName || "";
        this.peerMeshReadyFlag = false;
        // this.connectedRoom = connectedToRoom || null;
    }
}
exports.Client = Client;
