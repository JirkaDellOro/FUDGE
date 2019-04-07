var Scenes;
(function (Scenes) {
    var ƒ = Fudge;
    function createMiniScene() {
        ƒ.GLUtil.initializeContext();
        let shdBasic = new ƒ.ShaderBasic();
        let mtrRed = new ƒ.Material("Red", new ƒ.Vector3(255, 0, 0), shdBasic);
        let cmpMesh = new ƒ.ComponentMesh();
        cmpMesh.setMesh(new ƒ.MeshCube(50, 50, 50));
        let cmpMaterial = new ƒ.ComponentMaterial();
        cmpMaterial.initialize(mtrRed);
        let cmpTransform = new ƒ.ComponentTransform();
        Scenes.node = new ƒ.Node("Node");
        Scenes.node.addComponent(cmpMesh);
        Scenes.node.addComponent(cmpMaterial);
        Scenes.node.addComponent(cmpTransform);
        cmpTransform.scaleX(2);
        Scenes.camera = new ƒ.Node("Camera");
        cmpTransform = new ƒ.ComponentTransform();
        cmpTransform.translate(100, 100, 500);
        cmpTransform.lookAt(Scenes.node.cmpTransform.position);
        Scenes.camera.addComponent(cmpTransform);
        let cmpCamera = new ƒ.ComponentCamera();
        Scenes.camera.addComponent(cmpCamera);
        Scenes.viewPort = new ƒ.Viewport("MiniScene", Scenes.node, cmpCamera);
        Scenes.viewPort.drawScene();
        Scenes.viewPort.showSceneGraph();
        let child = new ƒ.Node("Child");
        Scenes.node.appendChild(child);
    }
    Scenes.createMiniScene = createMiniScene;
})(Scenes || (Scenes = {}));
//# sourceMappingURL=Scenes.js.map