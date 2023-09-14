var SkeletonTest;
(function (SkeletonTest) {
    var ƒ = FudgeCore;
    var ƒAid = FudgeAid;
    window.addEventListener("load", init);
    async function init() {
        let graphId = document.head.querySelector("meta[autoView]").getAttribute("autoView");
        // load resources referenced in the link-tag
        await ƒ.Project.loadResourcesFromHTML();
        ƒ.Debug.log("Project:", ƒ.Project.resources);
        // pick the graph to show
        let graph = ƒ.Project.resources[graphId];
        ƒ.Debug.log("Graph:", graph);
        if (!graph) {
            alert("Nothing to render. Create a graph with at least a mesh, material and probably some light");
            return;
        }
        // setup the viewport
        let cmpCamera = new ƒ.ComponentCamera();
        // cmpCamera.clrBackground = ƒ.Color.CSS("SKYBLUE");
        let canvas = document.querySelector("canvas");
        let viewport = new ƒ.Viewport();
        viewport.initialize("InteractiveViewport", graph, cmpCamera, canvas);
        ƒ.Debug.log("Viewport:", viewport);
        // hide the cursor when interacting, also suppressing right-click menu
        canvas.addEventListener("mousedown", canvas.requestPointerLock);
        canvas.addEventListener("mouseup", function () { document.exitPointerLock(); });
        // make the camera interactive (complex method in ƒAid)
        ƒAid.Viewport.expandCameraToInteractiveOrbit(viewport);
        // load scene
        const loader = await ƒ.GLTFLoader.LOAD("./animated_arm.gltf");
        const loaded = await loader.getScene();
        // loaded.getComponent(ƒ.ComponentAnimator)?.activate(false);
        ƒ.Debug.log("Loader:", loader);
        ƒ.Debug.log("Loaded:", loaded);
        graph.addChild(loaded);
        let timeSpan = document.getElementById("time");
        let fpsSpan = document.getElementById("fps");
        let gPressed = false;
        let iShader = 0;
        const shaders = [ƒ.ShaderFlatSkin, ƒ.ShaderGouraudSkin, ƒ.ShaderPhongSkin];
        let lastUpdateTime = 0;
        const updateInterval = 200;
        let cmpLightDirectional = graph.getChildrenByName("Light")[0]?.getComponents(ƒ.ComponentLight)[1];
        ƒ.Loop.addEventListener("loopFrame" /* ƒ.EVENT.LOOP_FRAME */, update);
        ƒ.Loop.start();
        function update(_event) {
            cmpLightDirectional.mtxPivot.rotation = new ƒ.Vector3(0, cmpCamera.mtxWorld.rotation.y, 0);
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
                fpsSpan.innerText = "FPS: " + ƒ.Loop.fpsRealAverage.toFixed(0);
                lastUpdateTime = ƒ.Loop.timeFrameStartReal;
            }
            if (loaded.getComponent(ƒ.ComponentAnimator))
                timeSpan.innerText = "TIME: " + loaded.getComponent(ƒ.ComponentAnimator).time.toFixed(0);
            viewport.draw();
        }
    }
})(SkeletonTest || (SkeletonTest = {}));
//# sourceMappingURL=SkeletonImportTest.js.map