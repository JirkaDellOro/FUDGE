var WebEngine;
(function (WebEngine) {
    window.addEventListener("DOMContentLoaded", init);
    window.addEventListener("keydown", moveCamera);
    // Shader sourcestrings are located at script's bottom end due to spacemanagement.
    function init() {
        console.log("Starting init().");
        WebEngine.GLUtil.initializeContext();
        let shader = new WebEngine.BasicShader();
        let material = new WebEngine.Material("BasicMaterial", new WebEngine.Vec3(190, 190, 190), shader);
        material = new WebEngine.Material("Textured Material", new WebEngine.Vec3(130, 130, 0), shader);
        // Setup for two testnodes and a CameraNode.
        let materialComponent = new WebEngine.MaterialComponent(material);
        material.addTexture("https://cdn.shopify.com/s/files/1/1869/0319/products/ART-i-cant-adult-today_color-powder-blue_1024x1024.jpg?v=1523750709");
        let mesh = new WebEngine.Mesh(new WebEngine.BoxGeometry(50, 50, 50).Positions);
        let transform0 = new WebEngine.Transform();
        let pivot0 = new WebEngine.Pivot();
        let fudge0 = new WebEngine.FudgeNode("Fudge0");
        fudge0.addComponent(mesh);
        fudge0.addComponent(materialComponent);
        fudge0.addComponent(pivot0);
        fudge0.addComponent(transform0);
        transform0.translate(0, -200, -200);
        pivot0.translateZ(0);
        let fudge1 = new WebEngine.FudgeNode("Fudge1");
        let transform1 = new WebEngine.Transform();
        let mesh1 = new WebEngine.Mesh(new WebEngine.BoxGeometry(25, 25, 25).Positions);
        fudge1.addComponent(mesh1);
        fudge1.addComponent(transform1);
        transform1.translate(150, 0, 0);
        let fudge2 = new WebEngine.FudgeNode("Fudge2");
        let transform2 = new WebEngine.Transform();
        let mesh2 = new WebEngine.Mesh(new WebEngine.BoxGeometry(25, 25, 25).Positions);
        fudge2.addComponent(materialComponent);
        fudge2.addComponent(transform2);
        transform2.translate(0, -150, 0);
        let fudge3 = new WebEngine.FudgeNode("Fudge3");
        let transform3 = new WebEngine.Transform();
        let mesh3 = new WebEngine.Mesh(new WebEngine.BoxGeometry(15, 15, 100).Positions);
        fudge3.addComponent(mesh3);
        fudge3.addComponent(materialComponent);
        fudge3.addComponent(transform3);
        transform3.translate(0, 0, 0);
        let cameraNode = new WebEngine.FudgeNode("Camera");
        let camtrans = new WebEngine.Transform();
        camtrans.lookAt(fudge0.getComponentByName("Transform").Position);
        cameraNode.addComponent(camtrans);
        let camera = new WebEngine.Camera();
        cameraNode.addComponent(camera);
        fudge0.appendChild(fudge1);
        fudge1.appendChild(fudge2);
        fudge2.appendChild(fudge3);
        let viewPort = new WebEngine.Viewport("Scene1", fudge0, camera);
        viewPort.drawScene();
        viewPort.showSceneGraph();
        play();
    }
    WebEngine.init = init;
    // Trial function that animates the scene.
    function play() {
        let rotation = 1;
        //(fudge1.getComponentByName("Transform") as Transform).rotateY(rotation);
        WebEngine.AssetManager.getFudgeNode("Fudge2").getComponentByName("Transform").rotateY(rotation);
        //(fudge0.getComponentByName("Transform") as Transform).rotateY(rotation);
        //(fudge1.getComponentByName("Transform") as Transform).translateX(rotation);
        // (fudge1.getComponentByName("Transform") as Transform).lookAt(fudge2);
        //(fudge3.getComponentByName("Transform") as Transform).lookAt(fudge1);
        WebEngine.AssetManager.getViewport("Scene1").drawScene();
        requestAnimationFrame(play);
    }
    // Trial function to move the camera around the viewports rootnode.
    function moveCamera(_event) {
        let transform = WebEngine.AssetManager.getFudgeNode("Camera").getComponentByName("Transform");
        let target = WebEngine.AssetManager.getFudgeNode("Fudge0").getComponentByName("Transform").Position;
        switch (_event.key) {
            case "q": {
                transform.translateY(10);
                transform.lookAt(target);
                break;
            }
            case "e": {
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
            case "w": {
                transform.translateZ(-10);
                break;
            }
            case "s": {
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
    // Trial function to setup the cube's face's colors (TODO: Outsource to Material?).
    // Shadersourcestrings below.
})(WebEngine || (WebEngine = {}));
//# sourceMappingURL=main.js.map