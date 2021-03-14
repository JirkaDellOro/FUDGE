var MatCapTest;
(function (MatCapTest) {
    var ƒ = FudgeCore;
    let graph = new ƒ.Node("Graph");
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
        let ctMatcap1 = new ƒ.CoatMatCap(txtImage1, new ƒ.Color(0.3, 0.55, 0.6, 1));
        let ctMatcap2 = new ƒ.CoatMatCap(txtImage2, new ƒ.Color(0.5, 0.5, 0.5, 1), 1);
        let mtl1 = new ƒ.Material("Material_Matcap1", ƒ.ShaderMatCap, ctMatcap1);
        let mtl2 = new ƒ.Material("Material_Matcap2", ƒ.ShaderMatCap, ctMatcap2);
        let pyramid = Scenes.createCompleteMeshNode("Cube", mtl1, new ƒ.MeshCube());
        let sphere = Scenes.createCompleteMeshNode("Cube", mtl2, new ƒ.MeshSphere("Sphere", 32, 32));
        sphere.mtxLocal.translateX(1);
        pyramid.mtxLocal.translateX(-1);
        graph.addChild(pyramid);
        graph.addChild(sphere);
        let viewport = new ƒ.Viewport();
        let cmpCamera = Scenes.createCamera(new ƒ.Vector3(1, 1, 5), new ƒ.Vector3(0, 0, 0));
        viewport.initialize("Viewport", graph, cmpCamera, document.querySelector("canvas"));
        viewport.draw();
        ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, handleFrame);
        ƒ.Loop.start(ƒ.LOOP_MODE["TIME_GAME"], 30, true);
        function handleFrame(_event) {
            sphere.mtxLocal.rotateX(1);
            sphere.mtxLocal.rotateY(0.5);
            pyramid.mtxLocal.rotateX(0.6);
            pyramid.mtxLocal.rotateY(0.8);
            viewport.draw();
        }
    }
})(MatCapTest || (MatCapTest = {}));
//# sourceMappingURL=MatCap.js.map