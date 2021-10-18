//@ts-ignore
import { FudgeServerWebSocket } from "../../../Network/Build/Server/index.js";
// import RTCPeerConnection from "webrtc-adapter";

let type: string = process.argv[2];
let port: number = parseInt(process.argv[3]);

if (!type) {
  console.log("Syntax: node Server.js type port\ntype = WebSocket, xyz, ...");
  process.exit();
}
if (type == "WebSocket") {
  let s: FudgeServerWebSocket = new FudgeServerWebSocket();
  s.startUpServer(port);
  // console.log(s);
}