namespace TextureTest {
    import ƒ = Fudge;

    window.addEventListener("load", init);

    function init(_event: Event): void {
        let img: HTMLImageElement = document.querySelector("img");
        let txtImage: ƒ.TextureImage = new ƒ.TextureImage();
        txtImage.image = img;
        let coatTextured: ƒ.CoatTextured = new ƒ.CoatTextured();
        coatTextured.texture = txtImage;
        let coatColored: ƒ.CoatColored = new ƒ.CoatColored(new ƒ.Color(1, 0, 0, 1));

        let node: ƒ.Node = new ƒ.Node("Node");
        let cmpMaterial: ƒ.ComponentMaterial = new ƒ.ComponentMaterial();
        let material: ƒ.Material = new ƒ.Material("Textured", ƒ.ShaderTexture, coatTextured);
        // let material: ƒ.Material = new ƒ.Material("Red", ƒ.ShaderBasic, coatColored);
        cmpMaterial.initialize(material);
        let cmpMesh: ƒ.ComponentMesh = new ƒ.ComponentMesh();
        cmpMesh.setMesh(new ƒ.MeshQuad());

        node.addComponent(cmpMaterial);
        node.addComponent(cmpMesh);
        node.addComponent(new ƒ.ComponentTransform());
        node.cmpTransform.translateZ(2);

        ƒ.RenderManager.initialize();
        ƒ.RenderManager.addBranch(node);
        ƒ.RenderManager.recalculateAllNodeTransforms();

        let viewport: ƒ.Viewport = new ƒ.Viewport();
        let camera: ƒ.Node = Scenes.createCamera(new ƒ.Vector3(0, 0, 0), node.cmpTransform.position);
        viewport.initialize("Viewport", node, camera.getComponent(ƒ.ComponentCamera), document.querySelector("canvas"));

        viewport.draw();

        console.dir(node);
    }
}