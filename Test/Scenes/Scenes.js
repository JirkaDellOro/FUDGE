var Scenes;
(function (Scenes) {
    var ƒ = Fudge;
    function createThreeLevelNodeHierarchy() {
        createMiniScene();
        let child = Scenes.node.getChildren()[0];
        let grandchild;
        grandchild = createCompleteMeshNode("Grandchild", new ƒ.Material("Green", new ƒ.Vector3(0, 255, 0), ƒ.ShaderBasic), new ƒ.MeshCube(3, 3, 3));
        grandchild.cmpTransform.translateX(2);
        child.appendChild(grandchild);
    }
    Scenes.createThreeLevelNodeHierarchy = createThreeLevelNodeHierarchy;
    function createMiniScene() {
        ƒ.WebGLApi.initializeContext();
        Scenes.node = createCompleteMeshNode("Node", new ƒ.Material("Red", new ƒ.Vector3(255, 0, 0), ƒ.ShaderBasic), new ƒ.MeshCube(5, 2, 5));
        let cmpTransform = Scenes.node.cmpTransform;
        cmpTransform.scaleX(2);
        Scenes.camera = createCamera();
        let child = new ƒ.Node("Child");
        Scenes.node.appendChild(child);
    }
    Scenes.createMiniScene = createMiniScene;
    function createViewport() {
        Scenes.viewPort = new ƒ.Viewport();
        Scenes.viewPort.initialize("TestViewport", Scenes.node, Scenes.camera.getComponent(ƒ.ComponentCamera), null);
        // viewPort.drawScene();
        Scenes.viewPort.showSceneGraph();
    }
    Scenes.createViewport = createViewport;
    function createCamera(_translation = new ƒ.Vector3(10, 10, 50), _lookAt = new ƒ.Vector3()) {
        let camera = new ƒ.Node("Camera");
        let cmpTransform = new ƒ.ComponentTransform();
        cmpTransform.translate(_translation.x, _translation.y, _translation.z);
        cmpTransform.lookAt(_lookAt);
        camera.addComponent(cmpTransform);
        let cmpCamera = new ƒ.ComponentCamera();
        camera.addComponent(cmpCamera);
        return camera;
    }
    Scenes.createCamera = createCamera;
    function createCompleteMeshNode(_name, _material, _mesh) {
        let node = new ƒ.Node(_name);
        let cmpMesh = new ƒ.ComponentMesh();
        cmpMesh.setMesh(_mesh);
        let cmpMaterial = new ƒ.ComponentMaterial();
        cmpMaterial.initialize(_material);
        let cmpTransform = new ƒ.ComponentTransform();
        node.addComponent(cmpMesh);
        node.addComponent(cmpMaterial);
        node.addComponent(cmpTransform);
        return node;
    }
    Scenes.createCompleteMeshNode = createCompleteMeshNode;
    function createCanvas(_width = 800, _height = 600) {
        let canvas = document.createElement("canvas");
        canvas.id = "canvas";
        canvas.width = _width;
        canvas.height = _height;
        return canvas;
    }
    Scenes.createCanvas = createCanvas;
})(Scenes || (Scenes = {}));
//# sourceMappingURL=Scenes.js.map