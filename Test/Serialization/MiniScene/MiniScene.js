var MiniScene;
(function (MiniScene) {
    var ƒ = Fudge;
    window.addEventListener("DOMContentLoaded", init);
    let node;
    let camera;
    let viewPort;
    function init() {
        ƒ.GLUtil.initializeContext();
        let shdBasic = new ƒ.ShaderBasic();
        let mtrRed = new ƒ.Material("Red", new ƒ.Vector3(255, 0, 0), shdBasic);
        let cmpMesh = new ƒ.ComponentMesh();
        cmpMesh.initialize(new ƒ.BoxGeometry(50, 50, 50).Positions);
        let cmpMaterial = new ƒ.ComponentMaterial();
        cmpMaterial.initialize(mtrRed);
        let cmpTransform = new ƒ.ComponentTransform();
        node = new ƒ.Node("Node");
        node.addComponent(cmpMesh);
        node.addComponent(cmpMaterial);
        console.log(node.transform);
        node.addComponent(cmpTransform);
        camera = new ƒ.Node("Camera");
        cmpTransform = new ƒ.ComponentTransform();
        cmpTransform.translate(100, 100, 500);
        cmpTransform.lookAt(node.transform.Position);
        camera.addComponent(cmpTransform);
        let cmpCamera = new ƒ.ComponentCamera();
        camera.addComponent(cmpCamera);
        viewPort = new ƒ.Viewport("MiniScene", node, cmpCamera);
        viewPort.drawScene();
        viewPort.showSceneGraph();
    }
    MiniScene.init = init;
})(MiniScene || (MiniScene = {}));
//# sourceMappingURL=MiniScene.js.map