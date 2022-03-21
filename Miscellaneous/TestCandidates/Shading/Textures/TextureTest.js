var TextureTest;
(function (TextureTest) {
    var ƒ = FudgeCore;
    var ƒAid = FudgeAid;
    ƒ.Render.initialize(true, true);
    window.addEventListener("load", init);
    function init(_event) {
        let coatTextured = new ƒ.CoatTextured();
        let material = new ƒ.Material("Textured", ƒ.ShaderTexture, coatTextured);
        // coatTextured.texture.mipmap = ƒ.MIPMAP.BLURRY;
        let quad = new ƒAid.Node("Quad", ƒ.Matrix4x4.TRANSLATION(ƒ.Vector3.ZERO()), material, new ƒ.MeshQuad());
        let cube = new ƒAid.Node("Quad", ƒ.Matrix4x4.TRANSLATION(ƒ.Vector3.X(-0.7)), material, new ƒ.MeshCube());
        let pyramid = new ƒAid.Node("Quad", ƒ.Matrix4x4.TRANSLATION(ƒ.Vector3.X(0.7)), material, new ƒ.MeshPyramid());
        let graph = new ƒ.Node("Graph");
        graph.addChild(quad);
        graph.addChild(cube);
        graph.addChild(pyramid);
        let viewport = new ƒ.Viewport();
        let cmpCamera = new ƒ.ComponentCamera();
        cmpCamera.pivot.translation = new ƒ.Vector3(0, 2, 3);
        cmpCamera.pivot.lookAt(new ƒ.Vector3(0, 0, 0));
        viewport.initialize("Viewport", graph, cmpCamera, document.querySelector("canvas"));
        ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, function () {
            let speed = 0.5;
            pyramid.mtxLocal.rotateX(speed);
            cube.mtxLocal.rotateY(speed);
            quad.mtxLocal.rotateZ(speed);
            viewport.draw();
        });
        ƒ.Loop.start();
    }
})(TextureTest || (TextureTest = {}));
//# sourceMappingURL=TextureTest.js.map