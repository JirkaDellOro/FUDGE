namespace JaschasExample {
    import ƒ = Fudge;

    window.addEventListener("DOMContentLoaded", init);
    window.addEventListener("keydown", moveCamera);

    export function init() {
        console.log("Starting init().")
        ƒ.GLUtil.initializeContext();
        let basicShader = new ƒ.BasicShader();
        let standardMaterial = new ƒ.Material("standardMaterial", new ƒ.Vector3(190, 190, 190), basicShader);
        let greenMaterial = new ƒ.Material("greenMaterial", new ƒ.Vector3(130, 130, 0), basicShader)
        let texturedMaterial = new ƒ.Material("texturedMaterial", new ƒ.Vector3(255, 255, 255), basicShader);
        texturedMaterial.addTexture("https://stemkoski.github.io/A-Frame-Examples/images/hexagons.png");

        let meshComponent0: ƒ.MeshComponent = new ƒ.MeshComponent();
        meshComponent0.initialize(new ƒ.BoxGeometry(50, 50, 50).Positions);
        let materialComponent0: ƒ.MaterialComponent = new ƒ.MaterialComponent();
        materialComponent0.initialize(texturedMaterial);  
        let transformComponent0: ƒ.TransformComponent = new ƒ.TransformComponent();
        let pivotComponent0: ƒ.PivotComponent = new ƒ.PivotComponent();
        let fudge0 = new ƒ.Node("Fudge0");
        fudge0.addComponent(meshComponent0);
        fudge0.addComponent(materialComponent0);
        fudge0.addComponent(pivotComponent0);
        fudge0.addComponent(transformComponent0);
        pivotComponent0.translateY(-50);


        let fudge1 = new ƒ.Node("Fudge1");
        let transformComponent1: ƒ.TransformComponent = new ƒ.TransformComponent();
        let meshComponent1: ƒ.MeshComponent = new ƒ.MeshComponent();
        meshComponent1.initialize(new ƒ.BoxGeometry(25, 25, 25).Positions);
        fudge1.addComponent(meshComponent1);
        fudge1.addComponent(transformComponent1);
        transformComponent1.translate(150, 0, 0);

        let fudge2 = new ƒ.Node("Fudge2");
        let transformComponent2: ƒ.TransformComponent = new ƒ.TransformComponent();
        fudge2.addComponent(transformComponent2);
        transformComponent2.translate(0, -150, 0);

        let fudge3 = new ƒ.Node("Fudge3");
        let transformComponent3: ƒ.TransformComponent = new ƒ.TransformComponent();
        let meshComponent3: ƒ.MeshComponent = new ƒ.MeshComponent();
        meshComponent3.initialize(new ƒ.BoxGeometry(15, 15, 100).Positions);
        let materialComponent3: ƒ.MaterialComponent = new ƒ.MaterialComponent();
        materialComponent3.initialize(greenMaterial);
        fudge3.addComponent(meshComponent3);
        fudge3.addComponent(materialComponent3);
        fudge3.addComponent(transformComponent3);
        transformComponent3.rotateY(90);


        let cameraNode = new ƒ.Node("Camera");
        let cameraTransformComponent: ƒ.TransformComponent = new ƒ.TransformComponent();
        cameraTransformComponent.translate(100, 100, 500)
        cameraTransformComponent.lookAt((fudge0.getComponents(ƒ.TransformComponent)[0] as ƒ.TransformComponent).Position);
        cameraNode.addComponent(cameraTransformComponent);
        let cameraComponent: ƒ.CameraComponent = new ƒ.CameraComponent();
        cameraNode.addComponent(cameraComponent);
        // TODO: orthographic doesn't work!
        // cameraComponent.projectOrthographic();

        fudge0.appendChild(fudge1);
        fudge1.appendChild(fudge2); 
        fudge2.appendChild(fudge3); 

        let viewPort = new ƒ.Viewport("Scene1", fudge0, cameraComponent);
        viewPort.drawScene();
        viewPort.showSceneGraph();
        play();
    }


    // Trial function that animates the scene.
    function play(): void {

        let rotation: number = 1;

        (ƒ.AssetManager.getNode("Fudge2").getComponents(ƒ.TransformComponent)[0] as ƒ.TransformComponent).rotateY(rotation);
        (ƒ.AssetManager.getNode("Fudge0").getComponents(ƒ.PivotComponent)[0] as ƒ.PivotComponent).rotateY(-rotation);

        ƒ.AssetManager.getViewport("Scene1").drawScene();
        requestAnimationFrame(play);
    }

    // Trial function to move the camera around the viewports rootnode.
    function moveCamera(_event: KeyboardEvent): void {

        let transform: ƒ.TransformComponent = <ƒ.TransformComponent>ƒ.AssetManager.getNode("Camera").getComponents(ƒ.TransformComponent)[0];
        let target: ƒ.Vector3 = (<ƒ.TransformComponent>ƒ.AssetManager.getNode("Fudge0").getComponents(ƒ.TransformComponent)[0]).Position;
        switch (_event.key) {
            case "w": {
                transform.translateY(10);
                transform.lookAt(target);
                break;
            }
            case "s": {
                transform.translateY(-10);
                transform.lookAt(target);
                break;
            }
            case "a": {
                transform.translateX(-10);
                transform.lookAt(target);
                break;
            }
            case "d": {
                transform.translateX(10);
                transform.lookAt(target);
                break;
            }
            case "q": {
                transform.translateZ(-10);
                break;
            }
            case "e": {
                transform.translateZ(10);
                break;
            }
            case "r": {
                transform.reset();
                transform.lookAt(target);
                break;
            }
        }
    }
}