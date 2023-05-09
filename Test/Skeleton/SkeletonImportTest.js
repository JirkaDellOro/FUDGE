var SkeletonTest;
(function (SkeletonTest) {
    var ƒ = FudgeCore;
    window.addEventListener("load", init);
    let timeSpan;
    let arm;
    async function init() {
        timeSpan = document.querySelector("span");
        const canvas = document.querySelector("canvas");
        // setup scene
        const scene = new ƒ.Node("Scene");
        const rotatorX = new ƒ.Node("RotatorX");
        rotatorX.addComponent(new ƒ.ComponentTransform());
        const rotatorY = new ƒ.Node("RotatorY");
        rotatorY.addComponent(new ƒ.ComponentTransform());
        arm = await loadAnimatedArm();
        console.log(arm);
        scene.addChild(rotatorX);
        rotatorX.addChild(rotatorY);
        rotatorY.addChild(arm);
        // setup camera
        const camera = new ƒ.Node("Camera");
        camera.addComponent(new ƒ.ComponentCamera());
        camera.addComponent(new ƒ.ComponentTransform());
        camera.getComponent(ƒ.ComponentCamera).clrBackground.setHex("4472C4FF");
        camera.mtxLocal.translateZ(10);
        camera.mtxLocal.lookAt(ƒ.Vector3.ZERO(), camera.mtxLocal.getY());
        scene.addChild(camera);
        // setup light
        const cmpLightDirectional = new ƒ.ComponentLight(new ƒ.LightDirectional(new ƒ.Color(0.5, 0.5, 0.5)));
        cmpLightDirectional.mtxPivot.rotateY(180);
        scene.addComponent(cmpLightDirectional);
        const cmpLightAmbient = new ƒ.ComponentLight(new ƒ.LightAmbient(new ƒ.Color(0.5, 0.5, 0.5)));
        scene.addComponent(cmpLightAmbient);
        // setup viewport
        const viewport = new ƒ.Viewport();
        viewport.initialize("Viewport", scene, camera.getComponent(ƒ.ComponentCamera), canvas);
        viewport.draw();
        console.log(viewport);
        // run loop
        ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, () => update(viewport, rotatorX.mtxLocal, rotatorY.mtxLocal));
        ƒ.Loop.start();
    }
    async function loadAnimatedArm() {
        // const loader: ƒ.GLTFLoader = await ƒ.GLTFLoader.LOAD("./animated_arm.gltf");
        const loader = await ƒ.GLTFLoader.LOAD("./arm_from_fbx.gltf");
        // const loader: ƒ.GLTFLoader = await ƒ.GLTFLoader.LOAD("./arm.gltf");
        const arm = await loader.getNode("ArmModel");
        const anime = await loader.getAnimationByIndex(0);
        arm.addComponent(new ƒ.ComponentAnimator(anime));
        // const loader: ƒ.GLTFLoader = await ƒ.GLTFLoader.LOAD("./unarmed_walk.gltf");
        // const arm: ƒ.Node = await loader.getNode("Armature");
        console.log(loader);
        // const meshSerialization: ƒ.Serialization = ƒ.Serializer.serialize(arm.getComponent(ƒ.ComponentMesh).mesh);
        // console.log(meshSerialization);
        // arm.getComponent(ƒ.ComponentMesh).mesh = await ƒ.Serializer.deserialize(meshSerialization) as ƒ.MeshSkin;
        // arm.addComponent(new ƒ.ComponentTransform());
        // arm.mtxLocal.translateY(-2);
        return arm;
    }
    function update(_viewport, _mtxRotatorX, _mtxRotatorY) {
        if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_RIGHT]))
            _mtxRotatorY.rotateY(3);
        if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_UP]))
            _mtxRotatorX.rotateX(-3);
        if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_LEFT]))
            _mtxRotatorY.rotateY(-3);
        if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_DOWN]))
            _mtxRotatorX.rotateX(3);
        if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.SPACE])) {
            _mtxRotatorX.set(ƒ.Matrix4x4.IDENTITY());
            _mtxRotatorY.set(ƒ.Matrix4x4.IDENTITY());
        }
        if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.P]))
            ƒ.Time.game.setScale(0);
        if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.W]))
            ƒ.Time.game.setScale(0.1);
        if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.S]))
            ƒ.Time.game.setScale(1);
        // let cmpAnimator: ƒ.ComponentAnimator = arm.getChild(0)?.getChild(0).getComponent(ƒ.ComponentAnimator);
        // if (cmpAnimator)
        // timeSpan.innerText = cmpAnimator.time.toFixed();
        // if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.F])) _material.setShader(ƒ.ShaderFlatSkin);
        // if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.G])) _material.setShader(ƒ.ShaderGouraudSkin);
        // if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.H])) _material.setShader(ƒ.ShaderPhongSkin);
        _viewport.draw();
    }
})(SkeletonTest || (SkeletonTest = {}));
//# sourceMappingURL=SkeletonImportTest.js.map