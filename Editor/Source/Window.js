// /<reference path="../../Scenes/Scenes.ts"/>
///<reference types="../../Core/Build/Fudge"/>
///<reference types="../../node_modules/@types/node/fs"/>
var ElectronFileIo;
// /<reference path="../../Scenes/Scenes.ts"/>
///<reference types="../../Core/Build/Fudge"/>
///<reference types="../../node_modules/@types/node/fs"/>
(function (ElectronFileIo) {
    var ƒ = Fudge;
    const { dialog } = require("electron").remote;
    const fs = require("fs");
    window.addEventListener("DOMContentLoaded", init);
    let branch;
    function init() {
        createScene();
    }
    function createScene() {
        // create asset
        branch = Scenes.createAxisCross();
        // initialize RenderManager and transmit content
        ƒ.RenderManager.initialize();
        ƒ.RenderManager.addBranch(branch);
        ƒ.RenderManager.update();
        // initialize viewport
        let camera = Scenes.createCamera(new ƒ.Vector3(3, 3, 5));
        let cmpCamera = camera.getComponent(ƒ.ComponentCamera);
        cmpCamera.projectCentral(1, 45);
        let canvas = Scenes.createCanvas();
        document.body.appendChild(canvas);
        let viewPort = new ƒ.Viewport();
        viewPort.initialize("TestViewport", branch, cmpCamera, canvas);
        viewPort.draw();
    }
})(ElectronFileIo || (ElectronFileIo = {}));
//# sourceMappingURL=Window.js.map