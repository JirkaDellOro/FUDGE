var Mesh;
(function (Mesh) {
    var ƒ = FudgeCore;
    var ƒAid = FudgeAid;
    let camera;
    let speedCameraRotation = 0.2;
    let speedCameraTranslation = 0.01;
    let mtxRotatorX;
    let mtxRotatorY;
    let mtxTranslator;
    const graph = new ƒ.Node("Graph");
    let cntMouseX = new ƒ.Control("MouseX", speedCameraRotation);
    let cntMouseY = new ƒ.Control("MouseY", speedCameraRotation);
    window.addEventListener("load", init);
    async function init(_event) {
        const rotator = new ƒAid.Node("Rotator", ƒ.Matrix4x4.IDENTITY());
        const translator = new ƒAid.Node("Translator", ƒ.Matrix4x4.IDENTITY());
        const nodes = new ƒAid.Node("nodes", ƒ.Matrix4x4.IDENTITY());
        rotator.addChild(nodes);
        translator.addChild(rotator);
        mtxRotatorX = nodes.mtxLocal;
        mtxRotatorY = rotator.mtxLocal;
        mtxTranslator = translator.mtxLocal;
        // camera setup
        const cmpCamera = new ƒ.ComponentCamera();
        camera = new ƒAid.CameraOrbit(cmpCamera, 25, 80, 2, 30);
        camera.axisRotateX.addControl(cntMouseY);
        camera.axisRotateY.addControl(cntMouseX);
        cmpCamera.clrBackground = ƒ.Color.CSS("HSL(240, 20%, 50%)");
        // scene setup
        graph.addChild(translator);
        graph.addChild(camera);
        let material = new ƒ.Material("texture", ƒ.ShaderLitTextured, new ƒ.CoatTextured());
        //let material: ƒ.Material = new ƒ.Material("matheial", ƒ.ShaderLit, new ƒ.CoatColored(ƒ.Color.CSS("Red")));
        let subclass = ƒ.Mesh.subclasses;
        for (let i = 0; i < subclass.length; i++) {
            console.log(subclass[i].name);
            let node = new ƒ.Node(subclass[i].name.replace("Mesh", ""));
            let mesh;
            switch (subclass[i].name) {
                case "MeshObj":
                    mesh = new ƒ.MeshObj("Icosphere", "Icosphere.obj");
                    break;
                default:
                    //@ts-ignore
                    mesh = new subclass[i]();
                    break;
            }
            let cmpMesh = new ƒ.ComponentMesh(mesh);
            let math = new ƒ.ComponentMaterial(material);
            node.addComponent(new ƒ.ComponentTransform());
            node.mtxLocal.translateX(i * 2.5 - 10);
            node.addComponent(cmpMesh);
            node.addComponent(math);
            nodes.addChild(node);
        }
        //cmpCamera.mtxPivot.lookAt(graph.mtxWorld.translation);
        const viewport = new ƒ.Viewport();
        const canvas = document.querySelector("canvas");
        viewport.initialize("Viewport", graph, cmpCamera, canvas);
        // setup event handling
        viewport.canvas.addEventListener("pointermove", hndPointerMove);
        viewport.canvas.addEventListener("wheel", hndWheelMove);
        //window.addEventListener("keypress", hndKeyboard);
        canvas.addEventListener("mousedown", canvas.requestPointerLock);
        canvas.addEventListener("mouseup", () => document.exitPointerLock());
        startInteraction(viewport);
        ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        ƒ.Loop.start();
        function update(_event) {
            viewport.draw();
        }
    }
    function hndPointerMove(_event) {
        if (!_event.buttons)
            return;
        cntMouseX.setInput(_event.movementX);
        cntMouseY.setInput(_event.movementY);
    }
    function hndWheelMove(_event) {
        camera.distance += _event.deltaY * speedCameraTranslation;
    }
    function startInteraction(_viewport) {
        _viewport.canvas.addEventListener("keydown", move);
        function move(_event) {
            mtxTranslator.translateZ(0.1 *
                (_event.code == ƒ.KEYBOARD_CODE.W ? -1 :
                    _event.code == ƒ.KEYBOARD_CODE.S ? 1 :
                        0));
            mtxTranslator.translateX(0.1 *
                (_event.code == ƒ.KEYBOARD_CODE.A ? -1 :
                    _event.code == ƒ.KEYBOARD_CODE.D ? 1 :
                        0));
            mtxTranslator.translateY(0.1 *
                (_event.code == ƒ.KEYBOARD_CODE.X ? -1 :
                    _event.code == ƒ.KEYBOARD_CODE.E ? 1 :
                        0));
            switch (_event.code) {
                case ƒ.KEYBOARD_CODE.SPACE:
                    mtxRotatorX.set(ƒ.Matrix4x4.IDENTITY());
                    mtxRotatorY.set(ƒ.Matrix4x4.IDENTITY());
                    mtxTranslator.set(ƒ.Matrix4x4.IDENTITY());
                    break;
                case ƒ.KEYBOARD_CODE.ARROW_RIGHT:
                    mtxRotatorY.rotateY(5);
                    break;
                case ƒ.KEYBOARD_CODE.ARROW_LEFT:
                    mtxRotatorY.rotateY(-5);
                    break;
                case ƒ.KEYBOARD_CODE.ARROW_UP:
                    mtxRotatorX.rotateX(-5);
                    break;
                case ƒ.KEYBOARD_CODE.ARROW_DOWN:
                    mtxRotatorX.rotateX(5);
                    break;
            }
        }
    }
})(Mesh || (Mesh = {}));
//# sourceMappingURL=Mesh.js.map