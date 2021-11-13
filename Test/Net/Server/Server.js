/**
 * Minimal implementation showing the use of the FudgeServer.
 * Start with `node Server.js port`
 * @author Jirka Dell'Oro-Friedl, HFU, 2021
 */
import { FudgeServer } from "../../../Net/Build/Server/FudgeServer.js";
let port = parseInt(process.argv[2]);
if (!port) {
    console.log("Syntax: node Server.js port");
    process.exit();
}
let server = new FudgeServer();
server.startUp(port);
console.log(server);
