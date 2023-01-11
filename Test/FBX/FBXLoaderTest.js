///<reference path="./../../Core/Build/FudgeCore.d.ts"/>
var SkeletonTest;
///<reference path="./../../Core/Build/FudgeCore.d.ts"/>
(function (SkeletonTest) {
    var ƒ = FudgeCore;
    const mouse = {
        position: new ƒ.Vector2()
    };
    window.addEventListener("load", init);
    async function init() {
        const canvas = document.querySelector("canvas");
        const loader = await ƒ.FBXLoader.LOAD("./Unarmed Walk Forward.fbx");
        // const loader: ƒ.FBXLoader = await ƒ.FBXLoader.LOAD("./TriangularPrism.fbx");
        // track mouse position relative to canvas center
        window.addEventListener("mousemove", (_event) => {
            mouse.position.x = _event.clientX - canvas.width / 2;
            mouse.position.y = _event.clientY - canvas.height / 2;
        });
        // test loading a mesh
        console.log(await loader.getMesh(0));
        // load scene
        const scene = await loader.getScene(0);
        for (const node of scene) {
            if (node.getComponent(ƒ.ComponentMaterial))
                node.getComponent(ƒ.ComponentMaterial).material.setShader(ƒ.ShaderPhong);
        }
        // const scene: ƒ.Node = new ƒ.Node("Scene");
        // scene.addComponent(new ƒ.ComponentMesh(await loader.getMesh(0)));
        // scene.addComponent(new ƒ.ComponentMaterial(
        //   new ƒ.Material("Material", ƒ.ShaderFlat, new ƒ.CoatRemissive(ƒ.Color.CSS("white")))
        // ));
        console.log(scene);
        // test loading all documents and objects
        // loader.fbx.documents.forEach(_document => _document.load());
        // loader.fbx.objects.all.forEach(_object => _object.load());
        // console.log(loader.nodes);
        // console.log(loader.fbx);
        // setup camera
        const rotatorX = new ƒ.Node("RotatorX");
        rotatorX.addComponent(new ƒ.ComponentTransform());
        scene.addChild(rotatorX);
        const rotatorY = new ƒ.Node("RotatorY");
        rotatorY.addComponent(new ƒ.ComponentTransform());
        rotatorX.addChild(rotatorY);
        const camera = new ƒ.Node("Camera");
        camera.addComponent(new ƒ.ComponentCamera());
        camera.addComponent(new ƒ.ComponentTransform());
        camera.getComponent(ƒ.ComponentCamera).clrBackground.setHex("4472C4FF");
        camera.mtxLocal.translateY(80); // 0
        camera.mtxLocal.translateZ(300); // 30
        camera.mtxLocal.lookAt(ƒ.Vector3.Y(camera.mtxLocal.translation.y), camera.mtxLocal.getY());
        rotatorY.addChild(camera);
        // setup light
        const cmpLightDirectional = new ƒ.ComponentLight(new ƒ.LightDirectional(new ƒ.Color(0.5, 0.5, 0.5)));
        cmpLightDirectional.mtxPivot.rotateY(180);
        rotatorY.addComponent(cmpLightDirectional);
        const cmpLightAmbient = new ƒ.ComponentLight(new ƒ.LightAmbient(new ƒ.Color(0.5, 0.5, 0.5)));
        scene.addComponent(cmpLightAmbient);
        // setup viewport
        const viewport = new ƒ.Viewport();
        viewport.initialize("Viewport", scene, camera.getComponent(ƒ.ComponentCamera), canvas);
        viewport.draw();
        console.log(viewport);
        // run loop
        ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, () => update(viewport, rotatorX.mtxLocal, rotatorY.mtxLocal, camera.mtxLocal));
        ƒ.Loop.start();
    }
    function update(_viewport, _mtxRotatorX, _mtxRotatorY, _mtxCamera) {
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
        if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.PAGE_UP])) {
            // _mtxCamera.translateX(-mouse.position.x / _mtxCamera.translation.z);
            // _mtxCamera.translateY(-mouse.position.y / _mtxCamera.translation.z);
            _mtxCamera.translateZ(_mtxCamera.translation.z * 0.1);
        }
        if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.PAGE_DOWN])) {
            // _mtxCamera.translateX(mouse.position.x / _mtxCamera.translation.z);
            // _mtxCamera.translateY(mouse.position.y / _mtxCamera.translation.z);
            _mtxCamera.translateZ(-_mtxCamera.translation.z * 0.1);
        }
        _viewport.draw();
    }
})(SkeletonTest || (SkeletonTest = {}));
//# sourceMappingURL=FBXLoaderTest.js.map