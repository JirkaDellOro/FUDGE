var Scenes;
(function (Scenes) {
    var ƒ = Fudge;
    function createAxisCross() {
        let clrRed = new ƒ.Color(1, 0, 0, 0.5);
        let clrGreen = new ƒ.Color(0, 1, 0, 0.5);
        let clrBlue = new ƒ.Color(0, 0, 1, 0.5);
        let coatRed = new ƒ.CoatColored(clrRed);
        let coatGreen = new ƒ.CoatColored(clrGreen);
        let coatBlue = new ƒ.CoatColored(clrBlue);
        let mtrRed = new ƒ.Material("Red", ƒ.ShaderUniColor, coatRed);
        let mtrGreen = new ƒ.Material("Green", ƒ.ShaderUniColor, coatGreen);
        let mtrBlue = new ƒ.Material("Blue", ƒ.ShaderUniColor, coatBlue);
        let meshCube = new ƒ.MeshCube();
        let cubeRed = Scenes.createCompleteMeshNode("Red", mtrRed, meshCube);
        let cubeGreen = Scenes.createCompleteMeshNode("Green", mtrGreen, meshCube);
        let cubeBlue = Scenes.createCompleteMeshNode("Blue", mtrBlue, meshCube);
        cubeRed.cmpTransform.scaleX(2);
        cubeGreen.cmpTransform.scaleY(2);
        // cubeBlue.cmpTransform.scaleZ(2);
        // using pivot on blue node, just for testing...
        let pivot = new ƒ.ComponentPivot();
        pivot.scaleZ(2);
        cubeBlue.addComponent(pivot);
        cubeBlue.removeComponent(cubeBlue.cmpTransform);
        // create branch
        let branch = new ƒ.Node("AxisCross");
        branch.appendChild(cubeRed);
        branch.appendChild(cubeGreen);
        branch.appendChild(cubeBlue);
        return branch;
    }
    Scenes.createAxisCross = createAxisCross;
    function createCoordinateSystem() {
        let coatRed = new ƒ.CoatColored(new ƒ.Color(1, 0, 0, 1));
        let coatGreen = new ƒ.CoatColored(new ƒ.Color(0, 1, 0, 0.5));
        let coatBlue = new ƒ.CoatColored(new ƒ.Color(0, 0, 1, 0.5));
        let mtrRed = new ƒ.Material("Red", ƒ.ShaderUniColor, coatRed);
        let mtrGreen = new ƒ.Material("Green", ƒ.ShaderUniColor, coatGreen);
        let mtrBlue = new ƒ.Material("Blue", ƒ.ShaderUniColor, coatBlue);
        let meshCube = new ƒ.MeshCube();
        let meshPyramid = new ƒ.MeshPyramid();
        let cubeRed = Scenes.createCompleteMeshNode("Red", mtrRed, meshCube);
        let cubeGreen = Scenes.createCompleteMeshNode("Green", mtrGreen, meshCube);
        let cubeBlue = Scenes.createCompleteMeshNode("Blue", mtrBlue, meshCube);
        let pyramidRed = Scenes.createCompleteMeshNode("RedTip", mtrRed, meshPyramid);
        let pyramidGreen = Scenes.createCompleteMeshNode("GreenTip", mtrGreen, meshPyramid);
        let pyramidBlue = Scenes.createCompleteMeshNode("BlueTip", mtrBlue, meshPyramid);
        cubeRed.cmpTransform.scale(1, 0.01, 0.01);
        cubeGreen.cmpTransform.scale(0.01, 1, 0.01);
        cubeBlue.cmpTransform.scale(0.01, 0.01, 1);
        pyramidRed.cmpTransform.translateX(0.5);
        pyramidRed.cmpTransform.scale(0.1, 0.1, 0.1);
        pyramidRed.cmpTransform.rotateZ(-90);
        pyramidGreen.cmpTransform.translateY(0.5);
        pyramidGreen.cmpTransform.scale(0.1, 0.1, 0.1);
        pyramidBlue.cmpTransform.translateZ(0.5);
        pyramidBlue.cmpTransform.scale(0.1, 0.1, 0.1);
        pyramidBlue.cmpTransform.rotateX(90);
        // create branch
        let branch = new ƒ.Node("CoordinateSystem");
        branch.appendChild(cubeRed);
        branch.appendChild(cubeGreen);
        branch.appendChild(cubeBlue);
        branch.appendChild(pyramidRed);
        branch.appendChild(pyramidGreen);
        branch.appendChild(pyramidBlue);
        return branch;
    }
    Scenes.createCoordinateSystem = createCoordinateSystem;
    function createThreeLevelNodeHierarchy() {
        createMiniScene();
        let child = Scenes.node.getChildren()[0];
        let grandchild;
        grandchild = createCompleteMeshNode("Grandchild", new ƒ.Material("Green", ƒ.ShaderUniColor, new ƒ.CoatColored()), new ƒ.MeshCube());
        grandchild.cmpTransform.translateX(2);
        child.appendChild(grandchild);
    }
    Scenes.createThreeLevelNodeHierarchy = createThreeLevelNodeHierarchy;
    function createMiniScene() {
        ƒ.RenderManager.initialize();
        Scenes.node = createCompleteMeshNode("Node", new ƒ.Material("Red", ƒ.ShaderUniColor, new ƒ.CoatColored(new ƒ.Color(1, 0, 0, 1))), new ƒ.MeshCube());
        let cmpTransform = Scenes.node.cmpTransform;
        cmpTransform.scaleX(2);
        Scenes.camera = createCamera();
        let child = new ƒ.Node("Child");
        Scenes.node.appendChild(child);
    }
    Scenes.createMiniScene = createMiniScene;
    function createViewport(_canvas = null) {
        if (!_canvas) {
            _canvas = document.createElement("canvas");
            document.body.appendChild(_canvas);
        }
        Scenes.viewPort = new ƒ.Viewport();
        Scenes.viewPort.initialize("TestViewport", Scenes.node, Scenes.camera.getComponent(ƒ.ComponentCamera), _canvas);
        // viewPort.drawScene();
        Scenes.viewPort.showSceneGraph();
    }
    Scenes.createViewport = createViewport;
    function createCamera(_translation = new ƒ.Vector3(1, 1, 10), _lookAt = new ƒ.Vector3()) {
        let camera = new ƒ.Node("Camera");
        let cmpTransform = new ƒ.ComponentTransform();
        cmpTransform.translate(_translation.x, _translation.y, _translation.z);
        cmpTransform.lookAt(_lookAt);
        camera.addComponent(cmpTransform);
        let cmpCamera = new ƒ.ComponentCamera();
        cmpCamera.projectCentral(1, 45, ƒ.FIELD_OF_VIEW.DIAGONAL);
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