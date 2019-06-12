var TextureTest;
(function (TextureTest) {
    var ƒ = Fudge;
    window.addEventListener("load", init);
    function init(_event) {
        let img = document.querySelector("img");
        let txtImage = new ƒ.TextureImage();
        txtImage.image = img;
        let coatTextured = new ƒ.CoatTextured();
        coatTextured.texture = txtImage;
        let coatColored = new ƒ.CoatColored(new ƒ.Color(1, 0, 0, 1));
        let node = new ƒ.Node("Node");
        let cmpMaterial = new ƒ.ComponentMaterial();
        let material = new ƒ.Material("Textured", ƒ.ShaderTexture, coatTextured);
        // let material: ƒ.Material = new ƒ.Material("Red", ƒ.ShaderBasic, coatColored);
        cmpMaterial.initialize(material);
        let cmpMesh = new ƒ.ComponentMesh();
        cmpMesh.setMesh(new ƒ.MeshQuad());
        node.addComponent(cmpMaterial);
        node.addComponent(cmpMesh);
        node.addComponent(new ƒ.ComponentTransform());
        node.cmpTransform.translateZ(2);
        ƒ.RenderManager.initialize();
        ƒ.RenderManager.addBranch(node);
        ƒ.RenderManager.recalculateAllNodeTransforms();
        let viewport = new ƒ.Viewport();
        let camera = Scenes.createCamera(new ƒ.Vector3(0, 0, 0), node.cmpTransform.position);
        viewport.initialize("Viewport", node, camera.getComponent(ƒ.ComponentCamera), document.querySelector("canvas"));
        viewport.draw();
        console.dir(node);
    }
})(TextureTest || (TextureTest = {}));
//# sourceMappingURL=TextureTest.js.map