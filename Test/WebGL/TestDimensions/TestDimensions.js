var WebGLRendering;
(function (WebGLRendering) {
    var ƒ = Fudge;
    window.addEventListener("load", init);
    function init() {
        let uiRect = new UI.Rectangle();
        document.body.appendChild(uiRect.htmlElement);
        // create asset
        let branch = Scenes.createAxisCross();
        branch.addComponent(new ƒ.ComponentTransform());
        // initialize WebGL and transmit content
        ƒ.WebGLApi.initializeContext();
        ƒ.WebGL.addBranch(branch);
        ƒ.WebGL.recalculateAllNodeTransforms();
        // initialize viewports
        let posCameras = [new ƒ.Vector3(0.1, 0, 5), new ƒ.Vector3(0.1, 5, 0), new ƒ.Vector3(5, 0.1, 0), new ƒ.Vector3(3, 3, 5)];
        let canvas = document.getElementsByTagName("canvas")[0];
        let camera = Scenes.createCamera(posCameras[3]);
        let cmpCamera = camera.getComponent(ƒ.ComponentCamera);
        let viewPort = new ƒ.Viewport();
        viewPort.initialize(canvas.id, branch, cmpCamera, canvas);
        ƒ.Loop.addEventListener(ƒ.EVENT.ANIMATION_FRAME, animate);
        ƒ.Loop.start();
        function animate(_event) {
            branch.cmpTransform.rotateY(1);
            ƒ.WebGL.recalculateAllNodeTransforms();
            // prepare and draw viewport
            viewPort.prepare();
            viewPort.draw();
        }
        // let table: {} = {
        //     crc3: { width: ƒ.WebGLApi.crc3.canvas.width, height: ƒ.WebGLApi.crc3.canvas.height },
        //     crc2: { width: viewPort.getContext().canvas.width, height: viewPort.getContext().canvas.height }
        // };
        // console.table(table, ["width", "height"]);
    }
})(WebGLRendering || (WebGLRendering = {}));
//# sourceMappingURL=TestDimensions.js.map