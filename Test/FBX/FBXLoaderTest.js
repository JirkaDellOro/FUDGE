///<reference path="../../Core/Build/FudgeCore.d.ts"/>
///<reference path="../../Aid/Build/FudgeAid.d.ts"/>
var SkeletonTest;
///<reference path="../../Core/Build/FudgeCore.d.ts"/>
///<reference path="../../Aid/Build/FudgeAid.d.ts"/>
(function (SkeletonTest) {
    var ƒ = FudgeCore;
    var ƒAid = FudgeAid;
    let camera;
    let speedCameraRotation = 0.2;
    let speedCameraTranslation = 0.1;
    let cntMouseX = new ƒ.Control("MouseX", speedCameraRotation);
    let cntMouseY = new ƒ.Control("MouseY", speedCameraRotation);
    window.addEventListener("load", init);
    async function init() {
        // const loader: ƒ.FBXLoader = await ƒ.FBXLoader.LOAD("./TriangularPrism.fbx");
        // const loader: ƒ.FBXLoader = await ƒ.FBXLoader.LOAD("./animated_arm.fbx");
        const loader = await ƒ.FBXLoader.LOAD("./Unarmed Walk Forward.fbx");
        // test loading a mesh
        // console.log(await loader.getMesh(0));
        // load scene
        const graph = await loader.getScene(0);
        console.log(graph);
        // camera setup
        const cmpCamera = new ƒ.ComponentCamera();
        camera = new ƒAid.CameraOrbit(cmpCamera, 500, 80, 2, 1000);
        camera.axisRotateX.addControl(cntMouseY);
        camera.axisRotateY.addControl(cntMouseX);
        cmpCamera.clrBackground.setHex("4472C4FF");
        graph.addChild(camera);
        camera.mtxLocal.translateY(100);
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
        // setup light
        const cmpLightDirectional = new ƒ.ComponentLight(new ƒ.LightDirectional(new ƒ.Color(0.5, 0.5, 0.5)));
        // cmpLightDirectional.mtxPivot.rotateY(180);
        graph.addComponent(cmpLightDirectional);
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
        ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        ƒ.Loop.start();
        function update(_event) {
            cmpLightDirectional.mtxPivot.rotation = new ƒ.Vector3(0, camera.rotationY + 180, 0);
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
            let cmpAnimator = graph.getComponent(ƒ.ComponentAnimator);
            if (cmpAnimator)
                timeSpan.innerText = cmpAnimator.time.toFixed(0);
            viewport.draw();
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
//# sourceMappingURL=FBXLoaderTest.js.map