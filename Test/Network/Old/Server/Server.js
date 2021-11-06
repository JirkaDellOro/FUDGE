System.register(["../../../Network/Build/Server/index.js"], function (exports_1, context_1) {
    "use strict";
    var index_js_1, type, port;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (index_js_1_1) {
                index_js_1 = index_js_1_1;
            }
        ],
        execute: function () {
            // import RTCPeerConnection from "webrtc-adapter";
            type = process.argv[2];
            port = parseInt(process.argv[3]);
            if (!type) {
                console.log("Syntax: node Server.js type port\ntype = WebSocket, SinglePeer, ...");
                process.exit();
            }
            switch (type) {
                case "WebSocket":
                    let sws = new index_js_1.FudgeServerWebSocket();
                    sws.startUpServer(port);
                    console.log(sws);
                    break;
                case "SinglePeer":
                    let ssp = new index_js_1.FudgeServerSinglePeer();
                    ssp.startUpServer(port);
                    console.log(ssp);
                    break;
                case "Mesh":
                    let smn = new index_js_1.FudgeServerMeshNetwork();
                    smn.startUpServer(port);
                    console.log(smn);
                case "Authoritative":
                    let sas = new index_js_1.FudgeServerAuthoritativeSignaling();
                    sas.startUpServer(port);
                    console.log(sas);
            }
        }
    };
});
//# sourceMappingURL=Server.js.map