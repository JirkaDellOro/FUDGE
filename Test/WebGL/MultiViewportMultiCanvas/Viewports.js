var WebGLRendering;
(function (WebGLRendering) {
    var ƒ = Fudge;
    window.addEventListener("load", init);
    function init() {
        // create asset
        let branch = Scenes.createAxisCross();
        branch.addComponent(new ƒ.ComponentTransform());
        // initialize WebGL and transmit content
        ƒ.WebGLApi.initializeContext();
        ƒ.WebGL.addBranch(branch);
        ƒ.WebGL.recalculateAllNodeTransforms();
        // initialize viewports
        let posCameras = [new ƒ.Vector3(0.1, 0, 5), new ƒ.Vector3(0.1, 5, 0), new ƒ.Vector3(5, 0.1, 0), new ƒ.Vector3(3, 3, 5)];
        let canvasList = document.getElementsByTagName("canvas");
        let viewPorts = [];
        for (let i = 0; i < canvasList.length; i++) {
            let camera = Scenes.createCamera(posCameras[i]);
            let cmpCamera = camera.getComponent(ƒ.ComponentCamera);
            let viewPort = new ƒ.Viewport();
            viewPort.initialize(canvasList[i].id, branch, cmpCamera, canvasList[i]);
            viewPorts.push(viewPort);
        }
        ƒ.Loop.addEventListener(ƒ.EVENT.ANIMATION_FRAME, animate);
        ƒ.Loop.start();
        function animate(_event) {
            branch.cmpTransform.rotateY(1);
            ƒ.WebGL.recalculateAllNodeTransforms();
            // prepare and draw viewport
            for (let viewPort of viewPorts) {
                viewPort.prepare();
                viewPort.draw();
            }
        }
        // let table: {} = {
        //     crc3: { width: ƒ.WebGLApi.crc3.canvas.width, height: ƒ.WebGLApi.crc3.canvas.height },
        //     crc2: { width: viewPort.getContext().canvas.width, height: viewPort.getContext().canvas.height }
        // };
        // console.table(table, ["width", "height"]);
    }
})(WebGLRendering || (WebGLRendering = {}));
//# sourceMappingURL=Viewports.js.map