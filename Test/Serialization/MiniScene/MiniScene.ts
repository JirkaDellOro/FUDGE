namespace MiniScene {
    import ƒ = Fudge;

    window.addEventListener("DOMContentLoaded", init);

    let node: ƒ.Node;
    let camera: ƒ.Node;
    let viewPort: ƒ.Viewport;

    function init(): void {
        createScene();
        testSerialization(node);
    }

    function createScene(): void {
        ƒ.GLUtil.initializeContext();
        let shdBasic: ƒ.ShaderBasic = new ƒ.ShaderBasic();
        let mtrRed: ƒ.Material = new ƒ.Material("Red", new ƒ.Vector3(255, 0, 0), shdBasic);

        let cmpMesh: ƒ.ComponentMesh = new ƒ.ComponentMesh();
        cmpMesh.setMesh(new ƒ.MeshCube(50, 50, 50));
        let cmpMaterial: ƒ.ComponentMaterial = new ƒ.ComponentMaterial();
        cmpMaterial.initialize(mtrRed);
        let cmpTransform: ƒ.ComponentTransform = new ƒ.ComponentTransform();
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
        let cmpCamera: ƒ.ComponentCamera = new ƒ.ComponentCamera();
        camera.addComponent(cmpCamera);

        viewPort = new ƒ.Viewport("MiniScene", node, cmpCamera);
        viewPort.drawScene();
        viewPort.showSceneGraph();

        let child: ƒ.Node = new ƒ.Node("Child");
        node.appendChild(child);
    }

    function testSerialization(_object: ƒ.Serializable): void {
        console.group("Original");
        console.log(_object);
        console.groupEnd();

        console.group("Serialized");
        let serialization: ƒ.Serialization = ƒ.Serializer.serialize(_object);
        console.log(serialization);
        console.groupEnd();

        console.group("Stringified");
        let json: string = JSON.stringify(serialization);
        console.log(json);
        console.groupEnd();

        console.group("Parsed");
        serialization = JSON.parse(json);
        console.log(serialization);
        console.groupEnd();

        console.group("Reconstructed");
        let reconstruction: ƒ.Serializable = ƒ.Serializer.deserialize(serialization);
        console.log(reconstruction);
        console.groupEnd();
    }
}