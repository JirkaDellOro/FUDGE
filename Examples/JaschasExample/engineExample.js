var JaschasExample;
(function (JaschasExample) {
    var ƒ = Fudge;
    window.addEventListener("DOMContentLoaded", init);
    window.addEventListener("keydown", moveCamera);
    let fudge0;
    let fudge2;
    let cameraNode;
    let viewPort;
    function init() {
        console.log("Starting init().");
        ƒ.GLUtil.initializeContext();
        let shdBasic = new ƒ.ShaderBasic();
        let shdTexture = new ƒ.ShaderTexture();
        let matStandard = new ƒ.Material("standardMaterial", new ƒ.Vector3(190, 190, 190), shdBasic);
        let matGreen = new ƒ.Material("greenMaterial", new ƒ.Vector3(130, 130, 0), shdBasic);
        let matTexture = new ƒ.Material("texturedMaterial", new ƒ.Vector3(255, 255, 255), shdTexture);
        matTexture.addTexture("https://stemkoski.github.io/A-Frame-Examples/images/hexagons.png");
        let cmpMesh = new ƒ.ComponentMesh();
        cmpMesh.initialize(new ƒ.BoxGeometry(50, 50, 50).Positions);
        let cmpMaterial = new ƒ.ComponentMaterial();
        cmpMaterial.initialize(matTexture);
        let cmpTransform = new ƒ.ComponentTransform();
        let cmpPivot = new ƒ.ComponentPivot();
        fudge0 = new ƒ.Node("Fudge0");
        fudge0.addComponent(cmpMesh);
        fudge0.addComponent(cmpMaterial);
        fudge0.addComponent(cmpPivot);
        fudge0.addComponent(cmpTransform);
        cmpPivot.translateY(-50);
        let fudge1 = new ƒ.Node("Fudge1");
        cmpTransform = new ƒ.ComponentTransform();
        cmpMesh = new ƒ.ComponentMesh();
        cmpMesh.initialize(new ƒ.BoxGeometry(25, 25, 25).Positions);
        let materialComponent1 = new ƒ.ComponentMaterial();
        materialComponent1.initialize(matStandard);
        fudge1.addComponent(cmpMesh);
        fudge1.addComponent(materialComponent1);
        fudge1.addComponent(cmpTransform);
        cmpTransform.translate(150, 0, 0);
        fudge2 = new ƒ.Node("Fudge2");
        cmpTransform = new ƒ.ComponentTransform();
        fudge2.addComponent(cmpTransform);
        cmpTransform.translate(0, -150, 0);
        let fudge3 = new ƒ.Node("Fudge3");
        cmpTransform = new ƒ.ComponentTransform();
        let meshComponent3 = new ƒ.ComponentMesh();
        meshComponent3.initialize(new ƒ.BoxGeometry(15, 15, 100).Positions);
        let materialComponent3 = new ƒ.ComponentMaterial();
        materialComponent3.initialize(matGreen);
        fudge3.addComponent(meshComponent3);
        fudge3.addComponent(materialComponent3);
        fudge3.addComponent(cmpTransform);
        cmpTransform.rotateY(90);
        cameraNode = new ƒ.Node("Camera");
        let cameraComponentTransform = new ƒ.ComponentTransform();
        cameraComponentTransform.translate(100, 100, 500);
        cameraComponentTransform.lookAt(fudge0.getComponents(ƒ.ComponentTransform)[0].Position);
        cameraNode.addComponent(cameraComponentTransform);
        let cameraComponent = new ƒ.ComponentCamera();
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
    JaschasExample.init = init;
    // Trial function that animates the scene.
    function play() {
        let rotation = 1;
        fudge2.getComponents(ƒ.ComponentTransform)[0].rotateY(rotation);
        fudge0.getComponents(ƒ.ComponentPivot)[0].rotateY(-rotation);
        viewPort.drawScene();
        requestAnimationFrame(play);
    }
    // Trial function to move the camera around the viewports rootnode.
    function moveCamera(_event) {
        let transform = cameraNode.getComponents(ƒ.ComponentTransform)[0];
        let target = fudge0.getComponents(ƒ.ComponentTransform)[0].Position;
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
})(JaschasExample || (JaschasExample = {}));
//# sourceMappingURL=engineExample.js.map