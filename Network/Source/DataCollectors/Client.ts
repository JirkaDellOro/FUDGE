export class Client {

    public clientConnection: WebSocket | null;
    public id: string;
    public userName: string;
    public peerConnection: any;
    public dataChannel: any;
    public peerMeshReadyFlag: boolean;
    // public connectedRoom: ServerRoom | null;

    constructor(websocketConnection?: WebSocket,
                uniqueClientId?: string,
                loginName?: string) {

        this.clientConnection = websocketConnection || null;
        this.peerConnection = null;
        this.dataChannel = null;
        this.id = uniqueClientId || "";
        this.userName = loginName || "";
        this.peerMeshReadyFlag = false;
        // this.connectedRoom = connectedToRoom || null;
    }
}
