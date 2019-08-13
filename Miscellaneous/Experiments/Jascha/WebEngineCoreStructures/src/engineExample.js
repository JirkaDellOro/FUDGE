var WebEngine;
(function (WebEngine) {
    window.addEventListener("DOMContentLoaded", init);
    window.addEventListener("keydown", moveCamera);
    function init() {
        console.log("Starting init().");
        WebEngine.GLUtil.initializeContext();
        let basicShader = new WebEngine.BasicShader();
        let standardMaterial = new WebEngine.Material("standardMaterial", new WebEngine.Vec3(190, 190, 190), basicShader);
        let greenMaterial = new WebEngine.Material("greenMaterial", new WebEngine.Vec3(130, 130, 0), basicShader);
        let texturedMaterial = new WebEngine.Material("texturedMaterial", new WebEngine.Vec3(255, 255, 255), basicShader);
        texturedMaterial.addTexture("https://stemkoski.github.io/A-Frame-Examples/images/hexagons.png");
        let meshComponent0 = new WebEngine.MeshComponent(new WebEngine.BoxGeometry(50, 50, 50).Positions);
        let materialComponent0 = new WebEngine.MaterialComponent(texturedMaterial);
        let transformComponent0 = new WebEngine.TransformComponent();
        let pivotComponent0 = new WebEngine.PivotComponent();
        let fudge0 = new WebEngine.FudgeNode("Fudge0");
        fudge0.addComponent(meshComponent0);
        fudge0.addComponent(materialComponent0);
        fudge0.addComponent(pivotComponent0);
        fudge0.addComponent(transformComponent0);
        pivotComponent0.translateY(-50);
        let fudge1 = new WebEngine.FudgeNode("Fudge1");
        let transformComponent1 = new WebEngine.TransformComponent();
        let meshComponent1 = new WebEngine.MeshComponent(new WebEngine.BoxGeometry(25, 25, 25).Positions);
        fudge1.addComponent(meshComponent1);
        fudge1.addComponent(transformComponent1);
        transformComponent1.translate(150, 0, 0);
        let fudge2 = new WebEngine.FudgeNode("Fudge2");
        let transformComponent2 = new WebEngine.TransformComponent();
        fudge2.addComponent(transformComponent2);
        transformComponent2.translate(0, -150, 0);
        let fudge3 = new WebEngine.FudgeNode("Fudge3");
        let transformComponent3 = new WebEngine.TransformComponent();
        let meshComponent3 = new WebEngine.MeshComponent(new WebEngine.BoxGeometry(15, 15, 100).Positions);
        let materialComponent3 = new WebEngine.MaterialComponent(greenMaterial);
        fudge3.addComponent(meshComponent3);
        fudge3.addComponent(materialComponent3);
        fudge3.addComponent(transformComponent3);
        transformComponent3.rotateY(90);
        let cameraNode = new WebEngine.FudgeNode("Camera");
        let cameraTransformComponent = new WebEngine.TransformComponent();
        cameraTransformComponent.translate(100, 100, 500);
        cameraTransformComponent.lookAt(fudge0.getComponentByName("Transform").Position);
        cameraNode.addComponent(cameraTransformComponent);
        let cameraComponent = new WebEngine.CameraComponent();
        cameraNode.addComponent(cameraComponent);
        fudge0.appendChild(fudge1);
        fudge1.appendChild(fudge2);
        fudge2.appendChild(fudge3);
        let viewPort = new WebEngine.Viewport("Scene1", fudge0, cameraComponent);
        viewPort.drawScene();
        viewPort.showSceneGraph();
        play();
    }
    WebEngine.init = init;
    // Trial function that animates the scene.
    function play() {
        let rotation = 1;
        WebEngine.AssetManager.getFudgeNode("Fudge2").getComponentByName("Transform").rotateY(rotation);
        WebEngine.AssetManager.getFudgeNode("Fudge0").getComponentByName("Pivot").rotateY(-rotation);
        WebEngine.AssetManager.getViewport("Scene1").drawScene();
        requestAnimationFrame(play);
    }
    // Trial function to move the camera around the viewports rootnode.
    function moveCamera(_event) {
        let transform = WebEngine.AssetManager.getFudgeNode("Camera").getComponentByName("Transform");
        let target = WebEngine.AssetManager.getFudgeNode("Fudge0").getComponentByName("Transform").Position;
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
})(WebEngine || (WebEngine = {}));
//# sourceMappingURL=engineExample.js.map