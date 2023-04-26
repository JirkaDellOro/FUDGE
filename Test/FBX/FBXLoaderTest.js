///<reference path="./../../Core/Build/FudgeCore.d.ts"/>
var SkeletonTest;
///<reference path="./../../Core/Build/FudgeCore.d.ts"/>
(function (SkeletonTest) {
    var ƒ = FudgeCore;
    const mouse = {
        position: new ƒ.Vector2()
    };
    window.addEventListener("load", init);
    let timeSpan;
    async function init() {
        const canvas = document.querySelector("canvas");
        timeSpan = document.querySelector("span");
        // const loader = await ƒ.FBXLoader.LOAD("./TriangularPrism.fbx");
        // const loader: ƒ.FBXLoader = await ƒ.FBXLoader.LOAD("./animated_arm.fbx");
        const loader = await ƒ.FBXLoader.LOAD("./Unarmed Walk Forward.fbx");
        // track mouse position relative to canvas center
        window.addEventListener("mousemove", (_event) => {
            mouse.position.x = _event.clientX - canvas.width / 2;
            mouse.position.y = _event.clientY - canvas.height / 2;
        });
        // test loading a mesh
        console.log(await loader.getMesh(0));
        // load scene
        const scene = await loader.getScene(0);
        console.log(scene);
        // let skeleton: ƒ.Node = scene;
        // for (const node of scene)
        //   if (node != scene && node.name == "Skeleton0")
        //     skeleton = node;
        // const meshBone: ƒ.Mesh = new ƒ.MeshRotation(
        //   "bone",
        //   [
        //     new ƒ.Vector2(0, 5),
        //     new ƒ.Vector2(1, 0),
        //     new ƒ.Vector2(0, 0)
        //   ],
        //   3
        // );
        // const materialBone: ƒ.Material = new ƒ.Material("bone", ƒ.ShaderLit, new ƒ.CoatColored(ƒ.Color.CSS("green")));
        // for (const bone of skeleton) {
        //   if (bone != skeleton) {
        //     bone.addComponent(new ƒ.ComponentMesh(meshBone));
        //     bone.addComponent(new ƒ.ComponentMaterial(materialBone));
        //     if (bone.getChild(0) /*&& bone.getChild(0).mtxLocal.translation.y >
        //         Math.abs(bone.getChild(0).mtxLocal.translation.x) + Math.abs(bone.getChild(0).mtxLocal.translation.z)*/)
        //       bone.getComponent(ƒ.ComponentMesh).mtxPivot.scaleY(bone.getChild(0).mtxLocal.translation.y);
        //   }
        // }
        // for (const node of scene) {
        //   const cmpMaterial: ƒ.ComponentMaterial = node.getComponent(ƒ.ComponentMaterial);
        //   if (cmpMaterial && cmpMaterial.material.name != "bone")
        //     cmpMaterial.activate(false);
        // }
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
        rotatorX.mtxLocal.translateY(80); // 80
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
        console.log(ƒ.Project.serialize());
        // run loop
        ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, () => update(viewport, rotatorX.mtxLocal, rotatorY.mtxLocal, camera.mtxLocal));
        ƒ.Loop.start();
    }
    let gPressed = false;
    let iShader = 0;
    const shaders = [ƒ.ShaderFlatSkin, ƒ.ShaderGouraudSkin, ƒ.ShaderPhongSkin];
    function update(_viewport, _mtxRotatorX, _mtxRotatorY, _mtxCamera) {
        if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.P]))
            ƒ.Time.game.setScale(0);
        if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.W]))
            ƒ.Time.game.setScale(0.1);
        if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.S]))
            ƒ.Time.game.setScale(1);
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
        const setShader = _shader => {
            for (const node of _viewport.getBranch()) {
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
        let cmpAnimator = _viewport.getBranch().getComponent(ƒ.ComponentAnimator);
        timeSpan.innerText = cmpAnimator.time.toFixed(0);
        _viewport.draw();
    }
})(SkeletonTest || (SkeletonTest = {}));
//# sourceMappingURL=FBXLoaderTest.js.map