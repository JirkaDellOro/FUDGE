//@ts-ignore
import { FudgeServerWebSocket, FudgeServerSinglePeer, FudgeServerMeshNetwork, FudgeServerAuthoritativeSignaling, FudgeServerAuthoritativeManager } from "../../../Network/Build/Server/index.js";
// import RTCPeerConnection from "webrtc-adapter";

let type: string = process.argv[2];
let port: number = parseInt(process.argv[3]);

if (!type) {
  console.log("Syntax: node Server.js type port\ntype = WebSocket, SinglePeer, ...");
  process.exit();
}
switch (type) {
  case "WebSocket":
    let sws: FudgeServerWebSocket = new FudgeServerWebSocket();
    sws.startUpServer(port);
    console.log(sws);
    break;
  case "SinglePeer":
    let ssp: FudgeServerSinglePeer = new FudgeServerSinglePeer();
    ssp.startUpServer(port);
    console.log(ssp);
    break;
  case "Mesh":
    let smn: FudgeServerMeshNetwork = new FudgeServerMeshNetwork();
    smn.startUpServer(port);
    console.log(smn);
  case "Authoritative":
    let sas: FudgeServerAuthoritativeSignaling = new FudgeServerAuthoritativeSignaling();
    sas.startUpServer(port);
    console.log(sas);
}
