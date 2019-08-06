namespace Scenes {
    import ƒ = Fudge;

    export let node: ƒ.Node;
    export let camera: ƒ.Node;
    export let viewPort: ƒ.Viewport;

    export function createAxisCross(): ƒ.Node {
<<<<<<< Updated upstream
        let clrRed: ƒ.Color = new ƒ.Color(1, 0, 0, 0.5);
        let clrGreen: ƒ.Color = new ƒ.Color(0, 1, 0, 0.5);
        let clrBlue: ƒ.Color = new ƒ.Color(0, 0, 1, 0.5);

        let coatRed: ƒ.CoatColored = new ƒ.CoatColored(clrRed);
        let coatGreen: ƒ.CoatColored = new ƒ.CoatColored(clrGreen);
        let coatBlue: ƒ.CoatColored = new ƒ.CoatColored(clrBlue);

        let mtrRed: ƒ.Material = new ƒ.Material("Red", ƒ.ShaderUniColor, coatRed);
        let mtrGreen: ƒ.Material = new ƒ.Material("Green", ƒ.ShaderUniColor, coatGreen);
        let mtrBlue: ƒ.Material = new ƒ.Material("Blue", ƒ.ShaderUniColor, coatBlue);

        let meshCube: ƒ.MeshCube = new ƒ.MeshCube();
=======
        let clrRed: ƒ.Color = new ƒ.Color(1, 0, 0, 1);
        let clrGreen: ƒ.Color = new ƒ.Color(0, 1, 0, 1);
        let clrBlue: ƒ.Color = new ƒ.Color(0, 0, 1, 1);

        let mtrRed: ƒ.Material = new ƒ.Material("Red", clrRed, ƒ.ShaderBasic);
        let mtrGreen: ƒ.Material = new ƒ.Material("Green", clrGreen, ƒ.ShaderBasic);
        let mtrBlue: ƒ.Material = new ƒ.Material("Blue", clrBlue, ƒ.ShaderBasic);

        let meshCube: ƒ.MeshCube = new ƒ.MeshCube(1, 1, 1);
>>>>>>> Stashed changes

        let cubeRed: ƒ.Node = Scenes.createCompleteMeshNode("Red", mtrRed, meshCube);
        let cubeGreen: ƒ.Node = Scenes.createCompleteMeshNode("Green", mtrGreen, meshCube);
        let cubeBlue: ƒ.Node = Scenes.createCompleteMeshNode("Blue", mtrBlue, meshCube);

<<<<<<< Updated upstream
        cubeRed.cmpTransform.local.scaleX(2);
        cubeGreen.cmpTransform.local.scaleY(2);
        // cubeBlue.cmpTransform.scaleZ(2);
        // using mesh pivot on blue node, just for testing...
        let cmpMesh: ƒ.ComponentMesh = cubeBlue.getComponent(ƒ.ComponentMesh);
        cmpMesh.pivot.scaleZ(2);
=======
        cubeRed.cmpTransform.scaleX(2);
        cubeGreen.cmpTransform.scaleY(2);
        // cubeBlue.cmpTransform.scaleZ(2);
        // using pivot on blue node, just for testing...
        let pivot: ƒ.ComponentPivot = new ƒ.ComponentPivot();
        pivot.scaleZ(2);
        cubeBlue.addComponent(pivot);
>>>>>>> Stashed changes
        cubeBlue.removeComponent(cubeBlue.cmpTransform);

        // create branch
        let branch: ƒ.Node = new ƒ.Node("AxisCross");
        branch.appendChild(cubeRed);
        branch.appendChild(cubeGreen);
        branch.appendChild(cubeBlue);

        return branch;
    }

<<<<<<< Updated upstream
    function createArrow(_name: string, _color: ƒ.Color): ƒ.Node {
        let arrow: ƒ.Node = new ƒ.Node(_name);
        let coat: ƒ.CoatColored = new ƒ.CoatColored(_color);
        let material: ƒ.Material = new ƒ.Material("Red", ƒ.ShaderUniColor, coat);

        let meshCube: ƒ.MeshCube = new ƒ.MeshCube();
        let meshPyramid: ƒ.MeshPyramid = new ƒ.MeshPyramid();
        let shaft: ƒ.Node = Scenes.createCompleteMeshNode("Shaft", material, meshCube);
        let head: ƒ.Node = Scenes.createCompleteMeshNode("Head", material, meshPyramid);
        let mtxShaft: ƒ.Matrix4x4 = shaft.cmpTransform.local;
        let mtxHead: ƒ.Matrix4x4 = head.cmpTransform.local;
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

        arrowRed.cmpTransform.local.rotateZ(-90);
        arrowBlue.cmpTransform.local.rotateX(90);

        let coordinates: ƒ.Node = new ƒ.Node("CoordinateSystem");
        coordinates.appendChild(arrowRed);
        coordinates.appendChild(arrowGreen);
        coordinates.appendChild(arrowBlue);

        return coordinates;
    }

=======
>>>>>>> Stashed changes
    export function createThreeLevelNodeHierarchy(): void {
        createMiniScene();

        let child: ƒ.Node = node.getChildren()[0];

        let grandchild: ƒ.Node;
<<<<<<< Updated upstream
        grandchild = createCompleteMeshNode("Grandchild", new ƒ.Material("Green", ƒ.ShaderUniColor, new ƒ.CoatColored()), new ƒ.MeshCube());
        grandchild.cmpTransform.local.translateX(2);
=======
        grandchild = createCompleteMeshNode("Grandchild", new ƒ.Material("Green", new ƒ.Color(0, 1, 0, 1), ƒ.ShaderBasic), new ƒ.MeshCube(3, 3, 3));
        grandchild.cmpTransform.translateX(2);
>>>>>>> Stashed changes
        child.appendChild(grandchild);
    }

    export function createMiniScene(): void {
        ƒ.RenderManager.initialize();

<<<<<<< Updated upstream
        node = createCompleteMeshNode("Node", new ƒ.Material("Red", ƒ.ShaderUniColor, new ƒ.CoatColored(new ƒ.Color(1, 0, 0, 1))), new ƒ.MeshCube());
        let cmpTransform: ƒ.ComponentTransform = node.cmpTransform;
        cmpTransform.local.scaleX(2);
=======
        node = createCompleteMeshNode("Node", new ƒ.Material("Red", new ƒ.Color(1, 0, 0, 1), ƒ.ShaderBasic), new ƒ.MeshCube(5, 2, 5));
        let cmpTransform: ƒ.ComponentTransform = node.cmpTransform;
        cmpTransform.scaleX(2);
>>>>>>> Stashed changes

        camera = createCamera();

        let child: ƒ.Node = new ƒ.Node("Child");
        node.appendChild(child);
    }

    export function createViewport(_canvas: HTMLCanvasElement = null): void {
        if (!_canvas) {
            _canvas = document.createElement("canvas");
            document.body.appendChild(_canvas);
        }
        viewPort = new ƒ.Viewport();
<<<<<<< Updated upstream
        viewPort.initialize("TestViewport", node, camera.getComponent(ƒ.ComponentCamera), _canvas);
=======
        viewPort.initialize("TestViewport", node, <ƒ.ComponentCamera>camera.getComponent(ƒ.ComponentCamera), _canvas);
>>>>>>> Stashed changes
        // viewPort.drawScene();
        viewPort.showSceneGraph();
    }

<<<<<<< Updated upstream
    export function createCamera(_translation: ƒ.Vector3 = new ƒ.Vector3(1, 1, 10), _lookAt: ƒ.Vector3 = new ƒ.Vector3()): ƒ.Node {
        let camera: ƒ.Node = new ƒ.Node("Camera");
        let cmpTransform: ƒ.ComponentTransform = new ƒ.ComponentTransform();
        cmpTransform.local.translate(_translation);
        cmpTransform.local.lookAt(_lookAt);
=======
    export function createCamera(_translation: ƒ.Vector3 = new ƒ.Vector3(10, 10, 50), _lookAt: ƒ.Vector3 = new ƒ.Vector3()): ƒ.Node {
        let camera: ƒ.Node = new ƒ.Node("Camera");
        let cmpTransform: ƒ.ComponentTransform = new ƒ.ComponentTransform();
        cmpTransform.translate(_translation.x, _translation.y, _translation.z);
        cmpTransform.lookAt(_lookAt);
>>>>>>> Stashed changes
        camera.addComponent(cmpTransform);
        let cmpCamera: ƒ.ComponentCamera = new ƒ.ComponentCamera();
        cmpCamera.projectCentral(1, 45, ƒ.FIELD_OF_VIEW.DIAGONAL);
        camera.addComponent(cmpCamera);
        return camera;
    }

    export function createCompleteMeshNode(_name: string, _material: ƒ.Material, _mesh: ƒ.Mesh): ƒ.Node {
        let node: ƒ.Node = new ƒ.Node(_name);

<<<<<<< Updated upstream
        let cmpMesh: ƒ.ComponentMesh = new ƒ.ComponentMesh(_mesh);
        let cmpMaterial: ƒ.ComponentMaterial = new ƒ.ComponentMaterial(_material);
=======
        let cmpMesh: ƒ.ComponentMesh = new ƒ.ComponentMesh();
        cmpMesh.setMesh(_mesh);
        let cmpMaterial: ƒ.ComponentMaterial = new ƒ.ComponentMaterial();
        cmpMaterial.initialize(_material);
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream



    export function dollyViewportCamera(_viewport: ƒ.Viewport): void {
        _viewport.activateKeyboardEvent(ƒ.EVENT_KEYBOARD.DOWN, true);
        _viewport.addEventListener(ƒ.EVENT_KEYBOARD.DOWN, rotate);

        function rotate(_event: ƒ.KeyboardEventƒ): void {
            let mtxCamera: ƒ.Matrix4x4 = _viewport.camera.getContainer().cmpTransform.local;
            let vctCamera: ƒ.Vector3 = ƒ.Vector3.ZERO;
            vctCamera.y = (0.1 *
                (_event.code == ƒ.KEYBOARD_CODE.ARROW_UP || _event.code == ƒ.KEYBOARD_CODE.W ? 1 :
                    _event.code == ƒ.KEYBOARD_CODE.ARROW_DOWN || _event.code == ƒ.KEYBOARD_CODE.S ? -1 :
                        0));
            vctCamera.x = (0.1 *
                (_event.code == ƒ.KEYBOARD_CODE.ARROW_LEFT || _event.code == ƒ.KEYBOARD_CODE.A ? 1 :
                    _event.code == ƒ.KEYBOARD_CODE.ARROW_RIGHT || _event.code == ƒ.KEYBOARD_CODE.D ? -1 :
                        0));

            mtxCamera.translate(vctCamera);
            mtxCamera.lookAt(ƒ.Vector3.ZERO, ƒ.Vector3.Y());
            _viewport.draw();
        }
    }
=======
>>>>>>> Stashed changes
}