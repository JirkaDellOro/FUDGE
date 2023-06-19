var SkeletonTest;
(function (SkeletonTest) {
    var ƒ = FudgeCore;
    var ƒAid = FudgeAid;
    window.addEventListener("load", init);
    let camera;
    let speedCameraRotation = 0.2;
    let speedCameraTranslation = 0.002;
    let cntMouseX = new ƒ.Control("MouseX", speedCameraRotation);
    let cntMouseY = new ƒ.Control("MouseY", speedCameraRotation);
    async function init() {
        const loader = await ƒ.GLTFLoader.LOAD("./animated_arm.gltf");
        // load scene
        const graph = await loader.getScene();
        // graph.getComponent(ƒ.ComponentAnimator)?.activate(false);
        console.log(graph);
        // camera setup
        const cmpCamera = new ƒ.ComponentCamera();
        camera = new ƒAid.CameraOrbit(cmpCamera, 7, 80, 2, 15);
        camera.axisRotateX.addControl(cntMouseY);
        camera.axisRotateY.addControl(cntMouseX);
        cmpCamera.clrBackground.setHex("4472C4FF");
        graph.addChild(camera);
        camera.mtxLocal.translateY(1);
        // setup light
        let cmpLight;
        cmpLight = new ƒ.ComponentLight(new ƒ.LightDirectional(new ƒ.Color(0.5, 0.5, 0.5)));
        graph.addComponent(cmpLight);
        const cmpLightAmbient = new ƒ.ComponentLight(new ƒ.LightAmbient(new ƒ.Color(0.5, 0.5, 0.5)));
        graph.addComponent(cmpLightAmbient);
        const viewport = new ƒ.Viewport();
        const canvas = document.querySelector("canvas");
        viewport.initialize("Viewport", graph, cmpCamera, canvas);
        viewport.canvas.addEventListener("pointermove", hndPointerMove);
        viewport.canvas.addEventListener("wheel", hndWheelMove);
        canvas.addEventListener("mousedown", canvas.requestPointerLock);
        canvas.addEventListener("mouseup", () => document.exitPointerLock());
        let timeSpan = document.querySelector("span");
        let gPressed = false;
        let iShader = 0;
        const shaders = [ƒ.ShaderFlatSkin, ƒ.ShaderGouraudSkin, ƒ.ShaderPhongSkin];
        let lastUpdateTime = 0;
        const updateInterval = 200;
        ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        ƒ.Loop.start();
        function update(_event) {
            cmpLight.mtxPivot.rotation = new ƒ.Vector3(0, camera.rotationY + 180, 0);
            if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.P]))
                ƒ.Time.game.setScale(0);
            if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.W]))
                ƒ.Time.game.setScale(0.1);
            if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.S]))
                ƒ.Time.game.setScale(1);
            const setShader = _shader => {
                for (const node of graph) {
                    if (node.getComponent(ƒ.ComponentMaterial))
                        node.getComponent(ƒ.ComponentMaterial).material.setShader(_shader);
                }
            };
            if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.G])) {
                if (!gPressed) {
                    gPressed = true;
                    setShader(shaders[iShader = (iShader + 1) % shaders.length]);
                }
            }
            else
                gPressed = false;
            if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.H]))
                setShader(ƒ.ShaderPhong);
            if (ƒ.Loop.timeFrameStartReal - lastUpdateTime > updateInterval) {
                timeSpan.innerText = ƒ.Loop.fpsRealAverage.toFixed(2);
                lastUpdateTime = ƒ.Loop.timeFrameStartReal;
            }
            viewport.draw();
        }
    }
    function hndPointerMove(_event) {
        if (!_event.buttons)
            return;
        cntMouseX.setInput(-_event.movementX);
        cntMouseY.setInput(-_event.movementY);
    }
    function hndWheelMove(_event) {
        camera.distance += _event.deltaY * speedCameraTranslation;
    }
})(SkeletonTest || (SkeletonTest = {}));
//# sourceMappingURL=SkeletonImportTest.js.map