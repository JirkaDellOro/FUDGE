namespace WebEngine {
    window.addEventListener("DOMContentLoaded", init);
    window.addEventListener("keydown", moveCamera);


    // Shader sourcestrings are located at script's bottom end due to spacemanagement.



    export function init() {   
        console.log("Starting init().")
        GLUtil.initializeContext();

        let shader = new BasicShader();
        let material =new Material("BasicMaterial", new Vec3(190,190,190), shader);
        material = new Material("Textured Material",new Vec3(130,130,0), shader);
        // Setup for two testnodes and a CameraNode.
        let materialComponent: MaterialComponent = new MaterialComponent(material);
        material.addTexture("https://cdn.shopify.com/s/files/1/1869/0319/products/ART-i-cant-adult-today_color-powder-blue_1024x1024.jpg?v=1523750709");
        let mesh: Mesh = new Mesh(new BoxGeometry(50, 50, 50).Positions);

        let transform0: Transform = new Transform();
        let pivot0: Pivot = new Pivot();
        let fudge0 = new FudgeNode("Fudge0");
        fudge0.addComponent(mesh);
        fudge0.addComponent(materialComponent);
        fudge0.addComponent(pivot0);
        fudge0.addComponent(transform0);
        transform0.translate(0,-200,-200);
        pivot0.translateZ(0);

        let fudge1 = new FudgeNode("Fudge1");
        let transform1: Transform = new Transform();
        let mesh1: Mesh = new Mesh(new BoxGeometry(25, 25, 25).Positions);
        fudge1.addComponent(mesh1);
        fudge1.addComponent(transform1);
        transform1.translate(150, 0, 0);

        let fudge2 = new FudgeNode("Fudge2");
        let transform2: Transform = new Transform();
        let mesh2: Mesh = new Mesh(new BoxGeometry(25, 25, 25).Positions);
        fudge2.addComponent(materialComponent);
        fudge2.addComponent(transform2);
        transform2.translate(0, -150, 0);

        let fudge3 = new FudgeNode("Fudge3");
        let transform3: Transform = new Transform();
        let mesh3: Mesh = new Mesh(new BoxGeometry(15, 15, 100).Positions);
        fudge3.addComponent(mesh3);
        fudge3.addComponent(materialComponent);
        fudge3.addComponent(transform3);
        transform3.translate(0, 0, 0);


        let cameraNode = new FudgeNode("Camera");
        let camtrans: Transform = new Transform();


        camtrans.lookAt((fudge0.getComponentByName("Transform")as Transform).Position);
        cameraNode.addComponent(camtrans);
        let camera: Camera = new Camera();
        cameraNode.addComponent(camera);


        fudge0.appendChild(fudge1);
        fudge1.appendChild(fudge2);
        fudge2.appendChild(fudge3);


        let viewPort = new Viewport("Scene1",fudge0, camera);
        viewPort.drawScene();
        viewPort.showSceneGraph();
        play();
    }


    // Trial function that animates the scene.
    function play(): void {

        let rotation: number = 1;
        //(fudge1.getComponentByName("Transform") as Transform).rotateY(rotation);
        (AssetManager.getFudgeNode("Fudge2").getComponentByName("Transform") as Transform).rotateY(rotation);
        //(fudge0.getComponentByName("Transform") as Transform).rotateY(rotation);
        //(fudge1.getComponentByName("Transform") as Transform).translateX(rotation);

       // (fudge1.getComponentByName("Transform") as Transform).lookAt(fudge2);
        //(fudge3.getComponentByName("Transform") as Transform).lookAt(fudge1);
        AssetManager.getViewport("Scene1").drawScene();
        requestAnimationFrame(play);
    }

    // Trial function to move the camera around the viewports rootnode.
    function moveCamera(_event:KeyboardEvent):void{
        let transform : Transform =<Transform>AssetManager.getFudgeNode("Camera").getComponentByName("Transform");
        let target : Vec3 = (<Transform>AssetManager.getFudgeNode("Fudge0").getComponentByName("Transform")).Position
        switch(_event.key){
            case "q":{
                transform.translateY(10);
                transform.lookAt(target);
                break;
            }
            case "e":{
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
            case "w":{
                transform.translateZ(-10);
                break;
            }
            case "s":{
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



    // Trial function to setup the cube's face's colors (TODO: Outsource to Material?).


    // Shadersourcestrings below.



}