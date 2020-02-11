var MeshTest;
(function (MeshTest) {
    var ƒ = FudgeCore;
    var ƒAid = FudgeAid;
    window.addEventListener("load", init);
    let branch = new ƒ.Node("Branch");
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
        let sphereMesh = new ƒ.MeshSphere(32, 24);
        sphereFlat = Scenes.createCompleteMeshNode("SphereFlat", matFlat, sphereMesh);
        sphereTex = Scenes.createCompleteMeshNode("SphereTexture", matTex, sphereMesh);
        sphereFlat.cmpTransform.local.translateX(0.6);
        sphereTex.cmpTransform.local.translateX(-0.6);
        branch.appendChild(sphereFlat);
        branch.appendChild(sphereTex);
        let body = new ƒ.Node("k");
        let lights = new ƒAid.NodeThreePointLights("lights", 0);
        branch.appendChild(lights);
        branch.appendChild(body);
        ƒ.RenderManager.initialize();
        ƒ.RenderManager.addBranch(branch);
        ƒ.RenderManager.update();
        let viewport = new ƒ.Viewport();
        let cmpCamera = Scenes.createCamera(new ƒ.Vector3(0, 0, 2.3), new ƒ.Vector3(0, 0, 0));
        viewport.initialize("Viewport", branch, cmpCamera, document.querySelector("canvas"));
        Scenes.dollyViewportCamera(viewport);
        viewport.setFocus(true);
        viewport.draw();
        window.setInterval(function () {
            sphereTex.cmpTransform.local.rotateY(0.5);
            ƒ.RenderManager.update();
            viewport.draw();
        }, 20);
    }
})(MeshTest || (MeshTest = {}));
//# sourceMappingURL=MeshSphere.js.map