var MatCapTest;
(function (MatCapTest) {
    var ƒ = FudgeCore;
    let branch = new ƒ.Node("Branch");
    window.addEventListener("load", init);
    function init() {
        /* textures can only be loaded by https - not with file:// address (cross origin block)
        so this example only works online or on a local server (form example node's http-server) */
        let img1 = document.querySelector("img[id='mc1']");
        let txtImage1 = new ƒ.TextureImage();
        txtImage1.image = img1;
        let img2 = document.querySelector("img[id='mc2']");
        let txtImage2 = new ƒ.TextureImage();
        txtImage2.image = img2;
        let ctMatcap = new ƒ.CoatMatCap(txtImage1, new ƒ.Color(0.5, 0.5, 0.5, 1), 0.8);
        let ctMatcapGreen = new ƒ.CoatMatCap(txtImage2, new ƒ.Color(0.5, 0.5, 0.5, 1), 0.2);
        let mtlRed = new ƒ.Material("Material_Red", ƒ.ShaderMatCap, ctMatcap);
        let mtlGreen = new ƒ.Material("Material_Green", ƒ.ShaderMatCap, ctMatcapGreen);
        let pyramidRed = Scenes.createCompleteMeshNode("Cube", mtlRed, new ƒ.MeshPyramid());
        let pyramidGreen = Scenes.createCompleteMeshNode("Cube", mtlGreen, new ƒ.MeshPyramid());
        pyramidGreen.cmpTransform.local.translateX(1);
        pyramidRed.cmpTransform.local.translateX(-1);
        branch.appendChild(pyramidRed);
        branch.appendChild(pyramidGreen);
        ƒ.RenderManager.initialize();
        let viewport = new ƒ.Viewport();
        let cmpCamera = Scenes.createCamera(new ƒ.Vector3(1, 1, 5), new ƒ.Vector3(0, 0, 0));
        viewport.initialize("Viewport", branch, cmpCamera, document.querySelector("canvas"));
        viewport.draw();
        ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, handleFrame);
        ƒ.Loop.start(ƒ.LOOP_MODE["TIME_GAME"], 30, true);
        function handleFrame(_event) {
            pyramidGreen.cmpTransform.local.rotateX(1);
            pyramidGreen.cmpTransform.local.rotateY(0.5);
            pyramidRed.cmpTransform.local.rotateX(0.6);
            pyramidRed.cmpTransform.local.rotateY(0.8);
            ƒ.RenderManager.update();
            viewport.draw();
        }
    }
})(MatCapTest || (MatCapTest = {}));
//# sourceMappingURL=MatCap.js.map