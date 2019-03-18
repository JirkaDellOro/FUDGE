namespace MiniScene {
    import ƒ = Fudge;

    window.addEventListener("DOMContentLoaded", init);

    let node: ƒ.Node;
    let camera: ƒ.Node;
    let viewPort: ƒ.Viewport;

    export function init(): void {
        ƒ.GLUtil.initializeContext();
        let shdBasic: ƒ.ShaderBasic = new ƒ.ShaderBasic();
        let mtrRed: ƒ.Material = new ƒ.Material("Red", new ƒ.Vector3(255, 0, 0), shdBasic);

        let cmpMesh: ƒ.ComponentMesh = new ƒ.ComponentMesh();
        cmpMesh.initialize(new ƒ.BoxGeometry(50, 50, 50).Positions);
        let cmpMaterial: ƒ.ComponentMaterial = new ƒ.ComponentMaterial();
        cmpMaterial.initialize(mtrRed);
        let cmpTransform: ƒ.ComponentTransform = new ƒ.ComponentTransform();
        node = new ƒ.Node("Node");
        node.addComponent(cmpMesh);
        node.addComponent(cmpMaterial);
        console.log(node.transform);
        node.addComponent(cmpTransform);


        camera = new ƒ.Node("Camera");
        cmpTransform = new ƒ.ComponentTransform();
        cmpTransform.translate(100, 100, 500);
        cmpTransform.lookAt(node.transform.Position);
        camera.addComponent(cmpTransform);
        let cmpCamera: ƒ.ComponentCamera = new ƒ.ComponentCamera();
        camera.addComponent(cmpCamera);

        viewPort = new ƒ.Viewport("MiniScene", node, cmpCamera);
        viewPort.drawScene();
        viewPort.showSceneGraph();
    }
}