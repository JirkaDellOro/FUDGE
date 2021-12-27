///<reference path="./../../Core/Build/FudgeCore.d.ts"/>
var SkeletonTest;
///<reference path="./../../Core/Build/FudgeCore.d.ts"/>
(function (SkeletonTest) {
    var ƒ = FudgeCore;
    window.addEventListener("load", init);
    async function init() {
        const canvas = document.querySelector("canvas");
        // setup scene
        const scene = new ƒ.Node("Scene");
        const rotatorX = new ƒ.Node("RotatorX");
        rotatorX.addComponent(new ƒ.ComponentTransform());
        const rotatorY = new ƒ.Node("RotatorY");
        rotatorY.addComponent(new ƒ.ComponentTransform());
        const zylinder = await loadAnimatedArm();
        console.log(zylinder);
        scene.addChild(rotatorX);
        rotatorX.addChild(rotatorY);
        rotatorY.addChild(zylinder);
        // setup camera
        const camera = new ƒ.Node("Camera");
        camera.addComponent(new ƒ.ComponentCamera());
        camera.addComponent(new ƒ.ComponentTransform());
        camera.mtxLocal.translateZ(10);
        camera.mtxLocal.showTo(ƒ.Vector3.ZERO(), camera.mtxLocal.getY());
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
        const arm = new ƒ.Node("Arm");
        // import assets
        const loader = await ƒ.GLTFLoader.LOAD("./animated_arm.gltf");
        const mesh = await loader.getMeshByName("ArmMesh");
        console.log(mesh instanceof ƒ.MeshSkin);
        const skeleton = await loader.getSkeletonByName("ArmSkeleton");
        const animation = await loader.getAnimationByName("ArmLift");
        // setup skeleton
        const cmpAnimator = new ƒ.ComponentAnimator(animation);
        skeleton.addComponent(cmpAnimator);
        cmpAnimator.activate(true);
        arm.addChild(skeleton);
        // setup component mesh
        const cmpMesh = new ƒ.ComponentMesh(mesh);
        cmpMesh.mtxPivot.translateY(-2);
        cmpMesh.bindSkeleton(skeleton);
        arm.addComponent(cmpMesh);
        // setup component material
        const material = new ƒ.Material("MaterialArm", ƒ.ShaderFlatSkin, new ƒ.CoatColored(ƒ.Color.CSS("grey")));
        const cmpMaterial = new ƒ.ComponentMaterial(material);
        arm.addComponent(cmpMaterial);
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
        _viewport.draw();
    }
})(SkeletonTest || (SkeletonTest = {}));
//# sourceMappingURL=SkeletonImportTest.js.map