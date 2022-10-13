import WebSocket from "ws";
import { FudgeNet } from "./Message.js";
/**
 * Keeps information about the connected clients
 */
export interface Client {
    id: string;
    name?: string;
    socket?: WebSocket;
    peers: string[];
}
interface Room {
    id: string;
    clients: {
        [id: string]: Client;
    };
    idHost: string | undefined;
}
declare type Rooms = {
    [id: string]: Room;
};
/**
 * Manages the websocket connections to FudgeClients, their ids and login names
 * and keeps track of the peer to peer connections between them. Processes messages
 * from the clients in the format {@link FudgeNet.Message} according to the controlling
 * fields {@link FudgeNet.ROUTE} and {@link FudgeNet.COMMAND}.
 * @author Falco Böhnke, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2021
 * TODOs:
 * - finalize the tracking of peers, deleted clients may not be removed from peers-array
 * - pass messages through the server to other clients to have them use the safe websocket connection
 */
export declare class FudgeServer {
    socket: WebSocket.Server;
    rooms: Rooms;
    private idLobby;
    /**
     * Starts the server on the given port, installs the appropriate event-listeners and starts the heartbeat
     */
    startUp: (_port?: number) => void;
    /**
     * Close the websocket of this server
     */
    closeDown: () => void;
    /**
     * Dispatch a FudgeNet.Message to the client with the id given as `idTarget`
     */
    dispatch(_message: FudgeNet.Message): void;
    /**
     * Broadcast a FudgeMet.Message to all clients known to the server.
     */
    broadcast(_message: FudgeNet.Message): void;
    /**
     * Logs the net-message with some additional text as prefix
     */
    logMessage(_text: string, _message: FudgeNet.Message): void;
    /**
     * Log the list of known clients
     */
    logClients(_room: Room): void;
    protected handleMessage(_message: string, _wsConnection: WebSocket): Promise<void>;
    private addEventListeners;
    private enterRoom;
    private createRoom;
    private getRoomIds;
    private createMesh;
    private connectHost;
    private addUserOnValidLoginRequest;
    private sendRtcOfferToRequestedClient;
    private answerRtcOfferOfClient;
    private sendIceCandidatesToRelevantPeer;
    private createID;
    private heartbeat;
}
export {};
