//@ts-ignore
import { FudgeServerWebSocket, FudgeServerSinglePeer, FudgeServerMeshNetwork, FudgeServerAuthoritativeSignaling } from "../../../Network/Build/Server/index.js";
// import RTCPeerConnection from "webrtc-adapter";
let type = process.argv[2];
let port = parseInt(process.argv[3]);
if (!type) {
    console.log("Syntax: node Server.js type port\ntype = WebSocket, SinglePeer, ...");
    process.exit();
}
switch (type) {
    case "WebSocket":
        let sws = new FudgeServerWebSocket();
        sws.startUpServer(port);
        console.log(sws);
        break;
    case "SinglePeer":
        let ssp = new FudgeServerSinglePeer();
        ssp.startUpServer(port);
        console.log(ssp);
        break;
    case "Mesh":
        let smn = new FudgeServerMeshNetwork();
        smn.startUpServer(port);
        console.log(smn);
    case "Authoritative":
        let sas = new FudgeServerAuthoritativeSignaling();
        sas.startUpServer(port);
        console.log(sas);
}
