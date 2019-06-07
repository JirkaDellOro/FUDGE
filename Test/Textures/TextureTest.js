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
        let node = new ƒ.Node("Node");
        let cmpMaterial = new ƒ.ComponentMaterial();
        let material = new ƒ.Material("Textured", ƒ.ShaderTexture, coatTextured);
        cmpMaterial.initialize(material);
        let cmpMesh = new ƒ.ComponentMesh();
        cmpMesh.setMesh(new ƒ.MeshQuad());
        node.addComponent(cmpMaterial);
        node.addComponent(cmpMesh);
        ƒ.RenderManager.initialize();
        ƒ.RenderManager.addNode(node);
        ƒ.RenderManager.drawNode(node, ƒ.Matrix4x4.identity);
        console.dir(node);
    }
})(TextureTest || (TextureTest = {}));
//# sourceMappingURL=TextureTest.js.map