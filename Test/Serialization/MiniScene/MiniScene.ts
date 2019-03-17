namespace MiniScene {
    import ƒ = Fudge;

    window.addEventListener("DOMContentLoaded", init);

    let node: ƒ.Node;
    let camera: ƒ.Node;
    let viewPort: ƒ.Viewport;

    export function init(): void {
        ƒ.GLUtil.initializeContext();
        let basicShader: ƒ.BasicShader = new ƒ.BasicShader();
        let standardMaterial: ƒ.Material = new ƒ.Material("standardMaterial", new ƒ.Vector3(100, 100, 100), basicShader);

        let mesh: ƒ.MeshComponent = new ƒ.MeshComponent();
        mesh.initialize(new ƒ.BoxGeometry(50, 50, 50).Positions);
        let material: ƒ.MaterialComponent = new ƒ.MaterialComponent();
        material.initialize(standardMaterial);
        let transform: ƒ.TransformComponent = new ƒ.TransformComponent();
        node = new ƒ.Node("Node");
        node.addComponent(mesh);
        node.addComponent(material);
        node.addComponent(transform);


        camera = new ƒ.Node("Camera");
        let cameraTransformComponent: ƒ.TransformComponent = new ƒ.TransformComponent();
        cameraTransformComponent.translate(100, 100, 500);
        cameraTransformComponent.lookAt((node.getComponents(ƒ.TransformComponent)[0] as ƒ.TransformComponent).Position);
        camera.addComponent(cameraTransformComponent);
        let cameraComponent: ƒ.CameraComponent = new ƒ.CameraComponent();
        camera.addComponent(cameraComponent);

        viewPort = new ƒ.Viewport("MiniScene", node, cameraComponent);
        viewPort.drawScene();
        viewPort.showSceneGraph();
    }
}