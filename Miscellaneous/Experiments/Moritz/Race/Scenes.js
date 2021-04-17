"use strict";
var Scenes;
(function (Scenes) {
    var ƒ = FudgeCore;
    function createAxisCross() {
        let clrRed = new ƒ.Color(1, 0, 0, 1);
        let clrGreen = new ƒ.Color(0, 1, 0, 1);
        let clrBlue = new ƒ.Color(0, 0, 1, 1);
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
        cubeRed.mtxLocal.scaleX(2);
        cubeGreen.mtxLocal.scaleY(2);
        // cubeBlue.cmpTransform.scaleZ(2);
        // using mesh pivot on blue node, just for testing...
        let cmpMesh = cubeBlue.getComponent(ƒ.ComponentMesh);
        cmpMesh.pivot.scaleZ(2);
        cubeBlue.removeComponent(cubeBlue.cmpTransform);
        // create graph
        let graph = new ƒ.Node("AxisCross");
        graph.addChild(cubeRed);
        graph.addChild(cubeGreen);
        graph.addChild(cubeBlue);
        return graph;
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
        let mtxShaft = shaft.mtxLocal;
        let mtxHead = head.mtxLocal;
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
        arrowRed.mtxLocal.rotateZ(-90);
        arrowBlue.mtxLocal.rotateX(90);
        let coordinates = new ƒ.Node("CoordinateSystem");
        coordinates.addChild(arrowRed);
        coordinates.addChild(arrowGreen);
        coordinates.addChild(arrowBlue);
        return coordinates;
    }
    Scenes.createCoordinateSystem = createCoordinateSystem;
    function createThreeLevelNodeHierarchy() {
        createMiniScene();
        let child = Scenes.node.getChildren()[0];
        let grandchild;
        grandchild = createCompleteMeshNode("Grandchild", new ƒ.Material("Green", ƒ.ShaderUniColor, new ƒ.CoatColored()), new ƒ.MeshCube());
        grandchild.mtxLocal.translateX(2);
        child.addChild(grandchild);
    }
    Scenes.createThreeLevelNodeHierarchy = createThreeLevelNodeHierarchy;
    function createMiniScene() {
        Scenes.node = createCompleteMeshNode("Node", new ƒ.Material("Red", ƒ.ShaderUniColor, new ƒ.CoatColored(new ƒ.Color(1, 0, 0, 1))), new ƒ.MeshCube());
        let cmpTransform = Scenes.node.cmpTransform;
        cmpTransform.local.scaleX(2);
        Scenes.cmpCamera = createCamera();
        let child = new ƒ.Node("Child");
        Scenes.node.addChild(child);
    }
    Scenes.createMiniScene = createMiniScene;
    function createViewport(_canvas = null) {
        if (!_canvas) {
            _canvas = document.createElement("canvas");
            document.body.appendChild(_canvas);
        }
        Scenes.viewport = new ƒ.Viewport();
        Scenes.viewport.initialize("TestViewport", Scenes.node, Scenes.cmpCamera, _canvas);
        // viewPort.drawScene();
        Scenes.viewport.showSceneGraph();
    }
    Scenes.createViewport = createViewport;
    function createCamera(_translation = new ƒ.Vector3(1, 1, 10), _lookAt = new ƒ.Vector3()) {
        let cmpCamera = new ƒ.ComponentCamera();
        cmpCamera.projectCentral(1, 45, ƒ.FIELD_OF_VIEW.DIAGONAL);
        cmpCamera.pivot.translate(_translation);
        cmpCamera.pivot.lookAt(_lookAt);
        return cmpCamera;
        // camera.addComponent(cmpCamera);
        // camera.addComponent(cmpTransform);
        // // let cmpCamera: ƒ.ComponentCamera = new ƒ.Node("Camera");
        // let cmpTransform: ƒ.ComponentTransform = new ƒ.ComponentTransform();
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
            let mtxCamera = _viewport.camera.pivot;
            let vctCamera = ƒ.Vector3.ZERO();
            let zoom;
            vctCamera.y = (0.1 *
                (_event.code == ƒ.KEYBOARD_CODE.ARROW_UP ? 1 :
                    _event.code == ƒ.KEYBOARD_CODE.ARROW_DOWN ? -1 :
                        0));
            vctCamera.x = (0.1 *
                (_event.code == ƒ.KEYBOARD_CODE.ARROW_LEFT ? 1 :
                    _event.code == ƒ.KEYBOARD_CODE.ARROW_RIGHT ? -1 :
                        0));
            vctCamera.z = (0.1 *
                (_event.code == ƒ.KEYBOARD_CODE.NUMPAD_ADD ? 1 :
                    _event.code == ƒ.KEYBOARD_CODE.NUMPAD_SUBTRACT ? -1 :
                        0));
            mtxCamera.translate(vctCamera);
            mtxCamera.lookAt(ƒ.Vector3.ZERO(), ƒ.Vector3.Y());
            _viewport.draw();
        }
    }
    Scenes.dollyViewportCamera = dollyViewportCamera;
    function save(_filename, _json) {
        let content = ƒ.Serializer.stringify(_json);
        let map = { [_filename]: content };
        ƒ.FileIoBrowserLocal.save(map);
    }
    Scenes.save = save;
})(Scenes || (Scenes = {}));
