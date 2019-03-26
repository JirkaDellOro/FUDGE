var MiniScene;
(function (MiniScene) {
    var ƒ = Fudge;
    window.addEventListener("DOMContentLoaded", init);
    let node;
    let camera;
    let viewPort;
    function init() {
        createScene();
        testSerialization(node.getComponents(ƒ.ComponentMesh)[0]);
    }
    function createScene() {
        ƒ.GLUtil.initializeContext();
        let shdBasic = new ƒ.ShaderBasic();
        let mtrRed = new ƒ.Material("Red", new ƒ.Vector3(255, 0, 0), shdBasic);
        let cmpMesh = new ƒ.ComponentMesh();
        cmpMesh.setMesh(new ƒ.MeshCube(50, 50, 50));
        let cmpMaterial = new ƒ.ComponentMaterial();
        cmpMaterial.initialize(mtrRed);
        let cmpTransform = new ƒ.ComponentTransform();
        node = new ƒ.Node("Node");
        node.addComponent(cmpMesh);
        node.addComponent(cmpMaterial);
        node.addComponent(cmpTransform);
        cmpTransform.scaleX(2);
        camera = new ƒ.Node("Camera");
        cmpTransform = new ƒ.ComponentTransform();
        cmpTransform.translate(100, 100, 500);
        cmpTransform.lookAt(node.cmpTransform.position);
        camera.addComponent(cmpTransform);
        let cmpCamera = new ƒ.ComponentCamera();
        camera.addComponent(cmpCamera);
        viewPort = new ƒ.Viewport("MiniScene", node, cmpCamera);
        viewPort.drawScene();
        viewPort.showSceneGraph();
    }
    function testSerialization(_object) {
        console.group("Original");
        console.log(_object);
        console.groupEnd();
        console.group("Serialized");
        let serialization = ƒ.Serializer.serialize(_object);
        console.log(serialization);
        console.groupEnd();
        console.group("Stringified");
        let json = JSON.stringify(serialization);
        console.log(json);
        console.groupEnd();
        console.group("Parsed");
        serialization = JSON.parse(json);
        console.log(serialization);
        console.groupEnd();
        console.group("Reconstructed");
        let reconstruction = ƒ.Serializer.deserialize(serialization);
        console.log(reconstruction);
        console.groupEnd();
    }
})(MiniScene || (MiniScene = {}));
//# sourceMappingURL=MiniScene.js.map