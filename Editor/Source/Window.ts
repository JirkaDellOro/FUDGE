// /<reference path="../../Scenes/Scenes.ts"/>
///<reference types="../../Core/Build/Fudge"/>
///<reference types="../../node_modules/@types/node/fs"/>

namespace ElectronFileIo {
    import ƒ = Fudge;
    const { dialog } = require("electron").remote;
    const fs: ƒ.General = require("fs");

    window.addEventListener("DOMContentLoaded", init);
    let branch: ƒ.Node;

    function init(): void {
        createScene();
    }

    function createScene(): void {
        // create asset
        branch = Scenes.createAxisCross();

        // initialize RenderManager and transmit content
        ƒ.RenderManager.initialize();
        ƒ.RenderManager.addBranch(branch);
        ƒ.RenderManager.update();

        // initialize viewport
        let camera: ƒ.Node = Scenes.createCamera(new ƒ.Vector3(3, 3, 5));
        let cmpCamera: ƒ.ComponentCamera = camera.getComponent(ƒ.ComponentCamera);
        cmpCamera.projectCentral(1, 45);
        let canvas: HTMLCanvasElement = Scenes.createCanvas();
        document.body.appendChild(canvas);

        let viewPort: ƒ.Viewport = new ƒ.Viewport();
        viewPort.initialize("TestViewport", branch, cmpCamera, canvas);
        viewPort.draw();
    }
}