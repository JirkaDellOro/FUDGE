namespace WebEngine {
    window.addEventListener("DOMContentLoaded", init);
    window.addEventListener("keydown", moveCamera);

    export function init() {   
        console.log("Starting init().")
        GLUtil.initializeContext();
        let basicShader = new BasicShader();
        let standardMaterial =new Material("standardMaterial", new Vec3(190,190,190), basicShader);
        let greenMaterial = new Material("greenMaterial", new Vec3 (130,130,0), basicShader)
        let texturedMaterial = new Material("texturedMaterial",new Vec3(255,255,255), basicShader);
        texturedMaterial.addTexture("https://stemkoski.github.io/A-Frame-Examples/images/hexagons.png");
        
        let meshComponent0: MeshComponent = new MeshComponent(new BoxGeometry(50, 50, 50).Positions);
        let materialComponent0 : MaterialComponent = new MaterialComponent(texturedMaterial);
        let transformComponent0: TransformComponent = new TransformComponent();
        let pivotComponent0: PivotComponent = new PivotComponent();
        let fudge0 = new FudgeNode("Fudge0");
        fudge0.addComponent(meshComponent0);
        fudge0.addComponent(materialComponent0);
        fudge0.addComponent(pivotComponent0);
        fudge0.addComponent(transformComponent0);
        pivotComponent0.translateY(-50);


        let fudge1 = new FudgeNode("Fudge1");
        let transformComponent1: TransformComponent = new TransformComponent();
        let meshComponent1: MeshComponent = new MeshComponent(new BoxGeometry(25, 25, 25).Positions);
        fudge1.addComponent(meshComponent1);
        fudge1.addComponent(transformComponent1);
        transformComponent1.translate(150, 0, 0);

        let fudge2 = new FudgeNode("Fudge2");
        let transformComponent2: TransformComponent = new TransformComponent();
        fudge2.addComponent(transformComponent2);
        transformComponent2.translate(0, -150, 0);

        let fudge3 = new FudgeNode("Fudge3");
        let transformComponent3: TransformComponent= new TransformComponent();
        let meshComponent3: MeshComponent = new MeshComponent(new BoxGeometry(15, 15, 100).Positions);
        let materialComponent3 : MaterialComponent= new MaterialComponent(greenMaterial);
        fudge3.addComponent(meshComponent3);
        fudge3.addComponent(materialComponent3);
        fudge3.addComponent(transformComponent3);
        transformComponent3.rotateY(90);


        let cameraNode = new FudgeNode("Camera");
        let cameraTransformComponent: TransformComponent = new TransformComponent();
        cameraTransformComponent.translate(100,100,500)
        cameraTransformComponent.lookAt((fudge0.getComponentByName("Transform")as TransformComponent).Position);
        cameraNode.addComponent(cameraTransformComponent);
        let cameraComponent: CameraComponent = new CameraComponent();
        cameraNode.addComponent(cameraComponent);


        fudge0.appendChild(fudge1);
        fudge1.appendChild(fudge2);
        fudge2.appendChild(fudge3);

        let viewPort = new Viewport("Scene1",fudge0, cameraComponent);
        viewPort.drawScene();
        viewPort.showSceneGraph();
        play();
    }


    // Trial function that animates the scene.
    function play(): void {

        let rotation: number = 1;

        (AssetManager.getFudgeNode("Fudge2").getComponentByName("Transform") as TransformComponent).rotateY(rotation);
        (AssetManager.getFudgeNode("Fudge0").getComponentByName("Pivot") as PivotComponent).rotateY(-rotation);

        AssetManager.getViewport("Scene1").drawScene();
        requestAnimationFrame(play);
    }

    // Trial function to move the camera around the viewports rootnode.
    function moveCamera(_event:KeyboardEvent):void{
        let transform : TransformComponent =<TransformComponent>AssetManager.getFudgeNode("Camera").getComponentByName("Transform");
        let target : Vec3 = (<TransformComponent>AssetManager.getFudgeNode("Fudge0").getComponentByName("Transform")).Position
        switch(_event.key){
            case "w":{
                transform.translateY(10);
                transform.lookAt(target);
                break;
            }
            case "s":{
                transform.translateY(-10);
                transform.lookAt(target);
                break;
            }
            case "a":{
                transform.translateX(-10);
                transform.lookAt(target);
                break;
            }
            case "d":{
                transform.translateX(10);
                transform.lookAt(target);
                break;
            }
            case "q":{
                transform.translateZ(-10);
                break;
            }
            case "e":{
                transform.translateZ(10);
                break;
            }
            case "r":{
                transform.reset();
                transform.lookAt(target);
                break;
            }
        }
    }
}