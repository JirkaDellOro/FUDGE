import { FudgeServer } from "../../../Network/Build/Server/FudgeServer.js";

let port: number = parseInt(process.argv[2]);

if (!port) {
  console.log("Syntax: node ServerNew.js port");
  process.exit();
}
let server: FudgeServer = new FudgeServer();
server.startUp(port);
console.log(server);
