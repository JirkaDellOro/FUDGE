/**
 * Minimal implementation showing the use of the FudgeServer.  
 * Start with `node Server.js <port>`, Heroku uses the start-script in package.json
 * @author Jirka Dell'Oro-Friedl, HFU, 2021
 */

import { FudgeServer } from "../../../Net/Build/Server/FudgeServer.js";

let port: number | string | undefined = process.env.PORT;
if (port == undefined)
  port = parseInt(process.argv[2]);

if (!port) {
  console.log("Syntax: 'node Server.js <port>' or use start script in Heroku");
  process.exit();
}

let server: FudgeServer = new FudgeServer();
server.startUp(<number>port);
console.log(server);
