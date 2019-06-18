namespace Scenes {
    import ƒ = Fudge;

    export let node: ƒ.Node;
    export let camera: ƒ.Node;
    export let viewPort: ƒ.Viewport;

    export function createAxisCross(): ƒ.Node {
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

        let cubeRed: ƒ.Node = Scenes.createCompleteMeshNode("Red", mtrRed, meshCube);
        let cubeGreen: ƒ.Node = Scenes.createCompleteMeshNode("Green", mtrGreen, meshCube);
        let cubeBlue: ƒ.Node = Scenes.createCompleteMeshNode("Blue", mtrBlue, meshCube);

        cubeRed.cmpTransform.scaleX(2);
        cubeGreen.cmpTransform.scaleY(2);
        // cubeBlue.cmpTransform.scaleZ(2);
        // using pivot on blue node, just for testing...
        let pivot: ƒ.ComponentPivot = new ƒ.ComponentPivot();
        pivot.scaleZ(2);
        cubeBlue.addComponent(pivot);
        cubeBlue.removeComponent(cubeBlue.cmpTransform);

        // create branch
        let branch: ƒ.Node = new ƒ.Node("AxisCross");
        branch.appendChild(cubeRed);
        branch.appendChild(cubeGreen);
        branch.appendChild(cubeBlue);

        return branch;
    }

    export function createCoordinates(): ƒ.Node {
        let coatRed: ƒ.CoatColored = new ƒ.CoatColored(new ƒ.Color(1, 0, 0, 1));
        let coatGreen: ƒ.CoatColored = new ƒ.CoatColored(new ƒ.Color(0, 1, 0, 0.5));
        let coatBlue: ƒ.CoatColored = new ƒ.CoatColored(new ƒ.Color(0, 0, 1, 0.5));

        let mtrRed: ƒ.Material = new ƒ.Material("Red", ƒ.ShaderUniColor, coatRed);
        let mtrGreen: ƒ.Material = new ƒ.Material("Green", ƒ.ShaderUniColor, coatGreen);
        let mtrBlue: ƒ.Material = new ƒ.Material("Blue", ƒ.ShaderUniColor, coatBlue);

        let meshCube: ƒ.MeshCube = new ƒ.MeshCube();

        let cubeRed: ƒ.Node = Scenes.createCompleteMeshNode("Red", mtrRed, meshCube);
        let cubeGreen: ƒ.Node = Scenes.createCompleteMeshNode("Green", mtrGreen, meshCube);
        let cubeBlue: ƒ.Node = Scenes.createCompleteMeshNode("Blue", mtrBlue, meshCube);

        cubeRed.cmpTransform.scale(1, 0.1, 0.1);
        cubeGreen.cmpTransform.scale(0.1, 1, 0.1);
        cubeBlue.cmpTransform.scale(0.1, 0.1, 1);

        // create branch
        let branch: ƒ.Node = new ƒ.Node("AxisCross");
        branch.appendChild(cubeRed);
        branch.appendChild(cubeGreen);
        branch.appendChild(cubeBlue);

        return branch;
    }

    export function createThreeLevelNodeHierarchy(): void {
        createMiniScene();

        let child: ƒ.Node = node.getChildren()[0];

        let grandchild: ƒ.Node;
        grandchild = createCompleteMeshNode("Grandchild", new ƒ.Material("Green", ƒ.ShaderUniColor, new ƒ.CoatColored()), new ƒ.MeshCube());
        grandchild.cmpTransform.translateX(2);
        child.appendChild(grandchild);
    }

    export function createMiniScene(): void {
        ƒ.RenderManager.initialize();

        node = createCompleteMeshNode("Node", new ƒ.Material("Red", ƒ.ShaderUniColor, new ƒ.CoatColored(new ƒ.Color(1, 0, 0, 1))), new ƒ.MeshCube());
        let cmpTransform: ƒ.ComponentTransform = node.cmpTransform;
        cmpTransform.scaleX(2);

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
        viewPort.initialize("TestViewport", node, camera.getComponent(ƒ.ComponentCamera), _canvas);
        // viewPort.drawScene();
        viewPort.showSceneGraph();
    }

    export function createCamera(_translation: ƒ.Vector3 = new ƒ.Vector3(1, 1, 10), _lookAt: ƒ.Vector3 = new ƒ.Vector3()): ƒ.Node {
        let camera: ƒ.Node = new ƒ.Node("Camera");
        let cmpTransform: ƒ.ComponentTransform = new ƒ.ComponentTransform();
        cmpTransform.translate(_translation.x, _translation.y, _translation.z);
        cmpTransform.lookAt(_lookAt);
        camera.addComponent(cmpTransform);
        let cmpCamera: ƒ.ComponentCamera = new ƒ.ComponentCamera();
        cmpCamera.projectCentral(1, 45, ƒ.FIELD_OF_VIEW.DIAGONAL);
        camera.addComponent(cmpCamera);
        return camera;
    }

    export function createCompleteMeshNode(_name: string, _material: ƒ.Material, _mesh: ƒ.Mesh): ƒ.Node {
        let node: ƒ.Node = new ƒ.Node(_name);

        let cmpMesh: ƒ.ComponentMesh = new ƒ.ComponentMesh();
        cmpMesh.setMesh(_mesh);
        let cmpMaterial: ƒ.ComponentMaterial = new ƒ.ComponentMaterial();
        cmpMaterial.initialize(_material);
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
}