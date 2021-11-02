//@ts-ignore
import { FudgeServer } from "../../../Network/New/Build/Server/Server.js";
// import RTCPeerConnection from "webrtc-adapter";

let port: number = parseInt(process.argv[2]);

if (!port) {
  console.log("Syntax: node ServerNew.js port");
  process.exit();
}
let server: FudgeServer = new FudgeServer();
server.startUpServer(port);
console.log(server);
