var MiniScene;
(function (MiniScene) {
    var ƒ = Fudge;
    window.addEventListener("DOMContentLoaded", init);
    let node;
    let camera;
    let viewPort;
    function init() {
        ƒ.GLUtil.initializeContext();
        let basicShader = new ƒ.BasicShader();
        let standardMaterial = new ƒ.Material("standardMaterial", new ƒ.Vector3(100, 100, 100), basicShader);
        let mesh = new ƒ.MeshComponent();
        mesh.initialize(new ƒ.BoxGeometry(50, 50, 50).Positions);
        let material = new ƒ.MaterialComponent();
        material.initialize(standardMaterial);
        let transform = new ƒ.TransformComponent();
        node = new ƒ.Node("Node");
        node.addComponent(mesh);
        node.addComponent(material);
        node.addComponent(transform);
        camera = new ƒ.Node("Camera");
        let cameraTransformComponent = new ƒ.TransformComponent();
        cameraTransformComponent.translate(100, 100, 500);
        cameraTransformComponent.lookAt(node.getComponents(ƒ.TransformComponent)[0].Position);
        camera.addComponent(cameraTransformComponent);
        let cameraComponent = new ƒ.CameraComponent();
        camera.addComponent(cameraComponent);
        viewPort = new ƒ.Viewport("MiniScene", node, cameraComponent);
        viewPort.drawScene();
        viewPort.showSceneGraph();
    }
    MiniScene.init = init;
})(MiniScene || (MiniScene = {}));
//# sourceMappingURL=MiniScene.js.map