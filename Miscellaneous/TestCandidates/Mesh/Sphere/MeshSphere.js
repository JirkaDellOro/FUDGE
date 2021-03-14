var MeshTest;
(function (MeshTest) {
    var ƒ = FudgeCore;
    ƒ.Render.initialize(true, true);
    var ƒAid = FudgeAid;
    window.addEventListener("load", init);
    let graph = new ƒ.Node("Graph");
    let sphereTex = new ƒ.Node("sphereTex");
    let sphereFlat = new ƒ.Node("sphereFlat");
    function init(_event) {
        let img = document.querySelector("img");
        let txtImage = new ƒ.TextureImage();
        txtImage.image = img;
        let coatTextured = new ƒ.CoatTextured();
        coatTextured.texture = txtImage;
        let matTex = new ƒ.Material("Textured", ƒ.ShaderTexture, coatTextured);
        let matFlat = new ƒ.Material("White", ƒ.ShaderFlat, new ƒ.CoatColored(ƒ.Color.CSS("WHITE")));
        let sphereMesh = new ƒ.MeshSphere("Sphere", 32, 24);
        sphereFlat = Scenes.createCompleteMeshNode("SphereFlat", matFlat, sphereMesh);
        sphereTex = Scenes.createCompleteMeshNode("SphereTexture", matTex, sphereMesh);
        sphereFlat.mtxLocal.translateX(0.6);
        sphereTex.mtxLocal.translateX(-0.6);
        graph.addChild(sphereFlat);
        graph.addChild(sphereTex);
        let body = new ƒ.Node("k");
        ƒAid.addStandardLightComponents(graph);
        // graph.addChild(lights);
        graph.addChild(body);
        let viewport = new ƒ.Viewport();
        let cmpCamera = Scenes.createCamera(new ƒ.Vector3(0, 0, 2.3), new ƒ.Vector3(0, 0, 0));
        viewport.initialize("Viewport", graph, cmpCamera, document.querySelector("canvas"));
        Scenes.dollyViewportCamera(viewport);
        viewport.setFocus(true);
        viewport.draw();
        window.setInterval(function () {
            sphereTex.mtxLocal.rotateY(0.5);
            viewport.draw();
        }, 20);
    }
})(MeshTest || (MeshTest = {}));
//# sourceMappingURL=MeshSphere.js.map