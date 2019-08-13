/// <reference path="../../../../../../Core/Build/Fudge.d.ts"/>
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
        cubeRed.cmpTransform.local.scaleX(2);
        cubeGreen.cmpTransform.local.scaleY(2);
        // cubeBlue.cmpTransform.scaleZ(2);
        // using mesh pivot on blue node, just for testing...
        let cmpMesh = cubeBlue.getComponent(ƒ.ComponentMesh);
        cmpMesh.pivot.scaleZ(2);
        cubeBlue.removeComponent(cubeBlue.cmpTransform);
        // create branch
        let branch = new ƒ.Node("AxisCross");
        branch.appendChild(cubeRed);
        branch.appendChild(cubeGreen);
        branch.appendChild(cubeBlue);
        return branch;
    }
    Scenes.createAxisCross = createAxisCross;
    function createArrow(_name, _color) {
        let arrow = new ƒ.Node(_name);
        let coat = new ƒ.CoatColored(_color);
        let material = new ƒ.Material("Red", ƒ.ShaderUniColor, coat);
        let meshCube = new ƒ.MeshCube();
        let meshPyramid = new ƒ.MeshPyramid();
        let shaft = Scenes.createCompleteMeshNode("Shaft", material, meshCube);
        let head = Scenes.createCompleteMeshNode("Head", material, meshPyramid);
        let mtxShaft = shaft.cmpTransform.local;
        let mtxHead = head.cmpTransform.local;
        mtxShaft.scale(new ƒ.Vector3(0.01, 1, 0.01));
        mtxHead.translateY(0.5);
        mtxHead.scale(new ƒ.Vector3(0.05, 0.1, 0.05));
        arrow.appendChild(shaft);
        arrow.appendChild(head);
        arrow.addComponent(new ƒ.ComponentTransform());
        return arrow;
    }
    function createCoordinateSystem() {
        let arrowRed = createArrow("ArrowRed", new ƒ.Color(1, 0, 0, 1));
        let arrowGreen = createArrow("ArrowGreen", new ƒ.Color(0, 1, 0, 1));
        let arrowBlue = createArrow("ArrowBlue", new ƒ.Color(0, 0, 1, 1));
        arrowRed.cmpTransform.local.rotateZ(-90);
        arrowBlue.cmpTransform.local.rotateX(90);
        let coordinates = new ƒ.Node("CoordinateSystem");
        coordinates.appendChild(arrowRed);
        coordinates.appendChild(arrowGreen);
        coordinates.appendChild(arrowBlue);
        return coordinates;
    }
    Scenes.createCoordinateSystem = createCoordinateSystem;
    function createThreeLevelNodeHierarchy() {
        createMiniScene();
        let child = Scenes.node.getChildren()[0];
        let grandchild;
        grandchild = createCompleteMeshNode("Grandchild", new ƒ.Material("Green", ƒ.ShaderUniColor, new ƒ.CoatColored()), new ƒ.MeshCube());
        grandchild.cmpTransform.local.translateX(2);
        child.appendChild(grandchild);
    }
    Scenes.createThreeLevelNodeHierarchy = createThreeLevelNodeHierarchy;
    function createMiniScene() {
        ƒ.RenderManager.initialize();
        Scenes.node = createCompleteMeshNode("Node", new ƒ.Material("Red", ƒ.ShaderUniColor, new ƒ.CoatColored(new ƒ.Color(1, 0, 0, 1))), new ƒ.MeshCube());
        let cmpTransform = Scenes.node.cmpTransform;
        cmpTransform.local.scaleX(2);
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
        cmpTransform.local.translate(_translation);
        cmpTransform.local.lookAt(_lookAt);
        camera.addComponent(cmpTransform);
        let cmpCamera = new ƒ.ComponentCamera();
        cmpCamera.projectCentral(1, 45, ƒ.FIELD_OF_VIEW.DIAGONAL);
        camera.addComponent(cmpCamera);
        return camera;
    }
    Scenes.createCamera = createCamera;
    function createCompleteMeshNode(_name, _material, _mesh) {
        let node = new ƒ.Node(_name);
        let cmpMesh = new ƒ.ComponentMesh(_mesh);
        let cmpMaterial = new ƒ.ComponentMaterial(_material);
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
    function dollyViewportCamera(_viewport) {
        _viewport.activateKeyboardEvent("\u0192keydown" /* DOWN */, true);
        _viewport.addEventListener("\u0192keydown" /* DOWN */, rotate);
        function rotate(_event) {
            let mtxCamera = _viewport.camera.getContainer().cmpTransform.local;
            let vctCamera = ƒ.Vector3.ZERO();
            vctCamera.y = (0.1 *
                (_event.code == ƒ.KEYBOARD_CODE.ARROW_UP || _event.code == ƒ.KEYBOARD_CODE.W ? 1 :
                    _event.code == ƒ.KEYBOARD_CODE.ARROW_DOWN || _event.code == ƒ.KEYBOARD_CODE.S ? -1 :
                        0));
            vctCamera.x = (0.1 *
                (_event.code == ƒ.KEYBOARD_CODE.ARROW_LEFT || _event.code == ƒ.KEYBOARD_CODE.A ? 1 :
                    _event.code == ƒ.KEYBOARD_CODE.ARROW_RIGHT || _event.code == ƒ.KEYBOARD_CODE.D ? -1 :
                        0));
            mtxCamera.translate(vctCamera);
            mtxCamera.lookAt(ƒ.Vector3.ZERO(), ƒ.Vector3.Y());
            _viewport.draw();
        }
    }
    Scenes.dollyViewportCamera = dollyViewportCamera;
})(Scenes || (Scenes = {}));
//# sourceMappingURL=Scenes.js.map