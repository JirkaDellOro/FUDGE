namespace Scenes {
    import ƒ = FudgeCore;

    export let node: ƒ.Node;
    export let cmpCamera: ƒ.ComponentCamera;
    export let viewport: ƒ.Viewport;

    export function createAxisCross(): ƒ.Node {
        let clrRed: ƒ.Color = new ƒ.Color(1, 0, 0, 1);
        let clrGreen: ƒ.Color = new ƒ.Color(0, 1, 0, 1);
        let clrBlue: ƒ.Color = new ƒ.Color(0, 0, 1, 1);

        let coatRed: ƒ.CoatColored = new ƒ.CoatColored(clrRed);
        let coatGreen: ƒ.CoatColored = new ƒ.CoatColored(clrGreen);
        let coatBlue: ƒ.CoatColored = new ƒ.CoatColored(clrBlue);

        let mtrRed: ƒ.Material = new ƒ.Material("Red", ƒ.ShaderUniColor, coatRed);
        let mtrGreen: ƒ.Material = new ƒ.Material("Green", ƒ.ShaderUniColor, coatGreen);
        let mtrBlue: ƒ.Material = new ƒ.Material("Blue", ƒ.ShaderUniColor, coatBlue);

        let meshCube: ƒ.MeshCube = new ƒ.MeshCube();

        let cubeRed: ƒ.Node = Scenes.createCompleteMeshNode("Red", mtrRed, meshCube);
        let cubeGreen: ƒ.Node = Scenes.createCompleteMeshNode("Green", mtrGreen, meshCube);
        let cubeBlue: ƒ.Node = Scenes.createCompleteMeshNode("Blue", mtrBlue, meshCube);

        cubeRed.mtxLocal.scaleX(2);
        cubeGreen.mtxLocal.scaleY(2);
        // cubeBlue.cmpTransform.scaleZ(2);
        // using mesh pivot on blue node, just for testing...
        let cmpMesh: ƒ.ComponentMesh = cubeBlue.getComponent(ƒ.ComponentMesh);
        cmpMesh.mtxPivot.scaleZ(2);
        cubeBlue.removeComponent(cubeBlue.cmpTransform);

        // create graph
        let graph: ƒ.Node = new ƒ.Node("AxisCross");
        graph.addChild(cubeRed);
        graph.addChild(cubeGreen);
        graph.addChild(cubeBlue);

        return graph;
    }

    function createArrow(_name: string, _color: ƒ.Color): ƒ.Node {
        let arrow: ƒ.Node = new ƒ.Node(_name);
        let coat: ƒ.CoatColored = new ƒ.CoatColored(_color);
        let material: ƒ.Material = new ƒ.Material("Red", ƒ.ShaderUniColor, coat);

        let meshCube: ƒ.MeshCube = new ƒ.MeshCube();
        let meshPyramid: ƒ.MeshPyramid = new ƒ.MeshPyramid();
        let shaft: ƒ.Node = Scenes.createCompleteMeshNode("Shaft", material, meshCube);
        let head: ƒ.Node = Scenes.createCompleteMeshNode("Head", material, meshPyramid);
        let mtxShaft: ƒ.Matrix4x4 = shaft.mtxLocal;
        let mtxHead: ƒ.Matrix4x4 = head.mtxLocal;
        mtxShaft.scale(new ƒ.Vector3(0.01, 1, 0.01));
        mtxHead.translateY(0.5);
        mtxHead.scale(new ƒ.Vector3(0.05, 0.1, 0.05));

        arrow.appendChild(shaft);
        arrow.appendChild(head);
        arrow.addComponent(new ƒ.ComponentTransform());

        return arrow;
    }

    export function createCoordinateSystem(): ƒ.Node {
        let arrowRed: ƒ.Node = createArrow("ArrowRed", new ƒ.Color(1, 0, 0, 1));
        let arrowGreen: ƒ.Node = createArrow("ArrowGreen", new ƒ.Color(0, 1, 0, 1));
        let arrowBlue: ƒ.Node = createArrow("ArrowBlue", new ƒ.Color(0, 0, 1, 1));

        arrowRed.mtxLocal.rotateZ(-90);
        arrowBlue.mtxLocal.rotateX(90);

        let coordinates: ƒ.Node = new ƒ.Node("CoordinateSystem");
        coordinates.addChild(arrowRed);
        coordinates.addChild(arrowGreen);
        coordinates.addChild(arrowBlue);

        return coordinates;
    }

    export function createThreeLevelNodeHierarchy(): void {
        createMiniScene();

        let child: ƒ.Node = node.getChildren()[0];

        let grandchild: ƒ.Node;
        grandchild = createCompleteMeshNode("Grandchild", new ƒ.Material("Green", ƒ.ShaderUniColor, new ƒ.CoatColored()), new ƒ.MeshCube());
        grandchild.mtxLocal.translateX(2);
        child.addChild(grandchild);
    }

    export function createMiniScene(): void {
        

        node = createCompleteMeshNode("Node", new ƒ.Material("Red", ƒ.ShaderUniColor, new ƒ.CoatColored(new ƒ.Color(1, 0, 0, 1))), new ƒ.MeshCube());
        let cmpTransform: ƒ.ComponentTransform = node.cmpTransform;
        cmpTransform.mtxLocal.scaleX(2);

        cmpCamera = createCamera();

        let child: ƒ.Node = new ƒ.Node("Child");
        node.addChild(child);
    }

    export function createViewport(_canvas: HTMLCanvasElement = null): void {
        if (!_canvas) {
            _canvas = document.createElement("canvas");
            document.body.appendChild(_canvas);
        }
        viewport = new ƒ.Viewport();
        viewport.initialize("TestViewport", node, cmpCamera, _canvas);
        // viewPort.drawScene();
        viewport.showSceneGraph();
    }

    export function createCamera(_translation: ƒ.Vector3 = new ƒ.Vector3(1, 1, 10), _lookAt: ƒ.Vector3 = new ƒ.Vector3()): ƒ.ComponentCamera {
        let cmpCamera: ƒ.ComponentCamera = new ƒ.ComponentCamera();
        cmpCamera.projectCentral(1, 45, ƒ.FIELD_OF_VIEW.DIAGONAL);
        cmpCamera.mtxPivot.translate(_translation);
        cmpCamera.mtxPivot.lookAt(_lookAt);
        return cmpCamera;
        // camera.addComponent(cmpCamera);
        // camera.addComponent(cmpTransform);
        // // let cmpCamera: ƒ.ComponentCamera = new ƒ.Node("Camera");
        // let cmpTransform: ƒ.ComponentTransform = new ƒ.ComponentTransform();
    }

    export function createCompleteMeshNode(_name: string, _material: ƒ.Material, _mesh: ƒ.Mesh): ƒ.Node {
        let node: ƒ.Node = new ƒ.Node(_name);

        let cmpMesh: ƒ.ComponentMesh = new ƒ.ComponentMesh(_mesh);
        let cmpMaterial: ƒ.ComponentMaterial = new ƒ.ComponentMaterial(_material);
        let cmpTransform: ƒ.ComponentTransform = new ƒ.ComponentTransform();
        node.addComponent(cmpMesh);
        node.addComponent(cmpMaterial);
        node.addComponent(cmpTransform);
        return node;
    }

    export function createCanvas(_width: number = 800, _height: number = 600): HTMLCanvasElement {
        let canvas: HTMLCanvasElement = <HTMLCanvasElement>document.createElement("canvas");
        canvas.id = "canvas";
        canvas.width = _width;
        canvas.height = _height;
        return canvas;
    }

    export function dollyViewportCamera(_viewport: ƒ.Viewport): void {
        _viewport.activateKeyboardEvent(ƒ.EVENT_KEYBOARD.DOWN, true);
        _viewport.addEventListener(ƒ.EVENT_KEYBOARD.DOWN, rotate);

        function rotate(_event: ƒ.EventKeyboard): void {
            let mtxCamera: ƒ.Matrix4x4 = _viewport.camera.mtxPivot;
            let vctCamera: ƒ.Vector3 = ƒ.Vector3.ZERO();
            let zoom: number;
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

    export function save(_filename: string, _json: ƒ.Serialization): void {
        let content: string = ƒ.Serializer.stringify(_json);
        let map: ƒ.MapFilenameToContent = {[_filename]: content};
        ƒ.FileIoBrowserLocal.save(map);
    }
}