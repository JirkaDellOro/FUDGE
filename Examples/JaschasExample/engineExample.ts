namespace JaschasExample {
    import ƒ = Fudge;

    window.addEventListener("DOMContentLoaded", init);
    window.addEventListener("keydown", moveCamera);

    let fudge0: ƒ.Node;
    let fudge2: ƒ.Node;
    let cameraNode: ƒ.Node;
    let viewPort: ƒ.Viewport;

    export function init(): void {
        console.log("Starting init().");
        ƒ.GLUtil.initializeContext();
        let shdBasic: ƒ.ShaderBasic = new ƒ.ShaderBasic();
        let shdTexture: ƒ.ShaderTexture = new ƒ.ShaderTexture();
        let matStandard: ƒ.Material = new ƒ.Material("standardMaterial", new ƒ.Vector3(190, 190, 190), shdBasic);
        let matGreen: ƒ.Material = new ƒ.Material("greenMaterial", new ƒ.Vector3(130, 130, 0), shdBasic);
        let matTexture: ƒ.Material = new ƒ.Material("texturedMaterial", new ƒ.Vector3(255, 255, 255), shdTexture);
        matTexture.addTexture("https://stemkoski.github.io/A-Frame-Examples/images/hexagons.png");

        let cmpMesh: ƒ.ComponentMesh = new ƒ.ComponentMesh();
        cmpMesh.initialize(new ƒ.BoxGeometry(50, 50, 50).Positions);
        let cmpMaterial: ƒ.ComponentMaterial = new ƒ.ComponentMaterial();
        cmpMaterial.initialize(matTexture);
        let cmpTransform: ƒ.ComponentTransform = new ƒ.ComponentTransform();
        let cmpPivot: ƒ.ComponentPivot = new ƒ.ComponentPivot();
        fudge0 = new ƒ.Node("Fudge0");
        fudge0.addComponent(cmpMesh);
        fudge0.addComponent(cmpMaterial);
        fudge0.addComponent(cmpPivot);
        fudge0.addComponent(cmpTransform);
        cmpPivot.translateY(-50);


        let fudge1: ƒ.Node = new ƒ.Node("Fudge1");
        cmpTransform = new ƒ.ComponentTransform();
        cmpMesh = new ƒ.ComponentMesh();
        cmpMesh.initialize(new ƒ.BoxGeometry(25, 25, 25).Positions);
        let materialComponent1: ƒ.ComponentMaterial = new ƒ.ComponentMaterial();
        materialComponent1.initialize(matStandard);
        fudge1.addComponent(cmpMesh);
        fudge1.addComponent(materialComponent1);
        fudge1.addComponent(cmpTransform);
        cmpTransform.translate(150, 0, 0);

        fudge2 = new ƒ.Node("Fudge2");
        cmpTransform = new ƒ.ComponentTransform();
        fudge2.addComponent(cmpTransform);
        cmpTransform.translate(0, -150, 0);

        let fudge3: ƒ.Node = new ƒ.Node("Fudge3");
        cmpTransform = new ƒ.ComponentTransform();
        let meshComponent3: ƒ.ComponentMesh = new ƒ.ComponentMesh();
        meshComponent3.initialize(new ƒ.BoxGeometry(15, 15, 100).Positions);
        let materialComponent3: ƒ.ComponentMaterial = new ƒ.ComponentMaterial();
        materialComponent3.initialize(matGreen);
        fudge3.addComponent(meshComponent3);
        fudge3.addComponent(materialComponent3);
        fudge3.addComponent(cmpTransform);
        cmpTransform.rotateY(90);


        cameraNode = new ƒ.Node("Camera");
        let cameraComponentTransform: ƒ.ComponentTransform = new ƒ.ComponentTransform();
        cameraComponentTransform.translate(100, 100, 500);
        cameraComponentTransform.lookAt((fudge0.getComponents(ƒ.ComponentTransform)[0] as ƒ.ComponentTransform).Position);
        cameraNode.addComponent(cameraComponentTransform);
        let cameraComponent: ƒ.ComponentCamera = new ƒ.ComponentCamera();
        cameraNode.addComponent(cameraComponent);
        // TODO: orthographic doesn't work!
        // cameraComponent.projectOrthographic();

        fudge0.appendChild(fudge1);
        fudge1.appendChild(fudge2);
        fudge2.appendChild(fudge3);

        viewPort = new ƒ.Viewport("Scene1", fudge0, cameraComponent);
        viewPort.drawScene();
        viewPort.showSceneGraph();
        play();
    }


    // Trial function that animates the scene.
    function play(): void {

        let rotation: number = 1;

        (fudge2.getComponents(ƒ.ComponentTransform)[0] as ƒ.ComponentTransform).rotateY(rotation);
        (fudge0.getComponents(ƒ.ComponentPivot)[0] as ƒ.ComponentPivot).rotateY(-rotation);

        viewPort.drawScene();
        requestAnimationFrame(play);
    }

    // Trial function to move the camera around the viewports rootnode.
    function moveCamera(_event: KeyboardEvent): void {

        let transform: ƒ.ComponentTransform = <ƒ.ComponentTransform>cameraNode.getComponents(ƒ.ComponentTransform)[0];
        let target: ƒ.Vector3 = (<ƒ.ComponentTransform>fudge0.getComponents(ƒ.ComponentTransform)[0]).Position;
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