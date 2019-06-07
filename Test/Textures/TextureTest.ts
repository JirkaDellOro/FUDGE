namespace TextureTest {
    import ƒ = Fudge;

    window.addEventListener("load", init);

    function init(_event: Event): void {
        let img: HTMLImageElement = document.querySelector("img");
        let txtImage: ƒ.TextureImage = new ƒ.TextureImage();
        txtImage.image = img;
        let coatTextured: ƒ.CoatTextured = new ƒ.CoatTextured();
        coatTextured.texture = txtImage;
        
        let node: ƒ.Node = new ƒ.Node("Node");
        let cmpMaterial: ƒ.ComponentMaterial = new ƒ.ComponentMaterial();
        let material: ƒ.Material = new ƒ.Material("Textured", ƒ.ShaderTexture, coatTextured);
        cmpMaterial.initialize(material);
        let cmpMesh: ƒ.ComponentMesh = new ƒ.ComponentMesh();
        cmpMesh.setMesh(new ƒ.MeshQuad());

        node.addComponent(cmpMaterial);
        node.addComponent(cmpMesh);
        
        ƒ.RenderManager.initialize();
        ƒ.RenderManager.addNode(node);
        
        ƒ.RenderManager.drawNode(node, ƒ.Matrix4x4.identity);

        console.dir(node);
    }
}