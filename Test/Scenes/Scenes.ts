namespace Scenes {
    import ƒ = Fudge;

    export let node: ƒ.Node;
    export let camera: ƒ.Node;
    export let viewPort: ƒ.Viewport;

    export function createThreeLevelNodeHierarchy(): void {
        createMiniScene();

        let child: ƒ.Node = node.getChildren()[0];

        let grandchild: ƒ.Node;
        grandchild = createCompleteMeshNode("Grandchild", new ƒ.Material("Green", new ƒ.Vector3(0, 255, 0), ƒ.ShaderBasic), new ƒ.MeshCube(3, 3, 3));
        grandchild.cmpTransform.translateX(2);
        child.appendChild(grandchild);
    }

    export function createMiniScene(): void {
        ƒ.WebGLApi.initializeContext();

        node = createCompleteMeshNode("Node", new ƒ.Material("Red", new ƒ.Vector3(255, 0, 0), ƒ.ShaderBasic), new ƒ.MeshCube(5, 2, 5));
        let cmpTransform: ƒ.ComponentTransform = node.cmpTransform;
        cmpTransform.scaleX(2);

        camera = createCamera();

        let child: ƒ.Node = new ƒ.Node("Child");
        node.appendChild(child);
    }

    export function createViewport(): void {
        viewPort = new ƒ.Viewport();
        viewPort.initialize("TestViewport", node, <ƒ.ComponentCamera>camera.getComponent(ƒ.ComponentCamera), null);
        // viewPort.drawScene();
        viewPort.showSceneGraph();
    }

    export function createCamera(_translation: ƒ.Vector3 = new ƒ.Vector3(10, 10, 50), _lookAt: ƒ.Vector3 = new ƒ.Vector3()): ƒ.Node {
        let camera: ƒ.Node = new ƒ.Node("Camera");
        let cmpTransform: ƒ.ComponentTransform = new ƒ.ComponentTransform();
        cmpTransform.translate(_translation.x, _translation.y, _translation.z);
        cmpTransform.lookAt(_lookAt);
        camera.addComponent(cmpTransform);
        let cmpCamera: ƒ.ComponentCamera = new ƒ.ComponentCamera();
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