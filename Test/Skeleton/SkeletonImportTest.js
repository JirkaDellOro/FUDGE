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
        SkeletonTest.viewport = new ƒ.Viewport();
        SkeletonTest.viewport.initialize("InteractiveViewport", graph, cmpCamera, canvas);
        ƒ.Debug.log("Viewport:", SkeletonTest.viewport);
        // hide the cursor when interacting, also suppressing right-click menu
        canvas.addEventListener("mousedown", canvas.requestPointerLock);
        canvas.addEventListener("mouseup", function () { document.exitPointerLock(); });
        // make the camera interactive (complex method in ƒAid)
        ƒAid.Viewport.expandCameraToInteractiveOrbit(SkeletonTest.viewport);
        graph.addChild(new ƒ.Node("placeholder"));
        let timeSpan = document.getElementById("time");
        let fpsSpan = document.getElementById("fps");
        let gPressed = false;
        let iShader = 0;
        const shaders = [ƒ.ShaderFlatSkin, ƒ.ShaderGouraudSkin, ƒ.ShaderPhongSkin];
        let lastUpdateTime = 0;
        const updateInterval = 200;
        let cmpLightDirectional = graph.getChildrenByName("Light")[0]?.getComponents(ƒ.ComponentLight)?.find((_cmp) => _cmp.light instanceof ƒ.LightDirectional);
        ƒ.Loop.addEventListener("loopFrame" /* ƒ.EVENT.LOOP_FRAME */, update);
        ƒ.Loop.start();
        function update(_event) {
            cmpLightDirectional.mtxPivot.rotation = new ƒ.Vector3(cmpCamera.mtxWorld.rotation.x, cmpCamera.mtxWorld.rotation.y, 0);
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
            if (SkeletonTest.loaded?.getComponent(ƒ.ComponentAnimator))
                timeSpan.innerText = "TIME: " + SkeletonTest.loaded?.getComponent(ƒ.ComponentAnimator).time.toFixed(0);
            SkeletonTest.viewport.draw();
        }
        document.addEventListener("keydown", hndKeydown);
        function hndKeydown(_event) {
            switch (_event.code) {
                case ƒ.KEYBOARD_CODE.SPACE:
                    SkeletonTest.cmpAnimator?.jumpTo(0);
                    break;
                case ƒ.KEYBOARD_CODE.P:
                    ƒ.Time.game.setScale(ƒ.Time.game.getScale() == 0 ? 1 : 0);
                    break;
                case ƒ.KEYBOARD_CODE.D:
                    SkeletonTest.cmpAnimator?.jumpTo(SkeletonTest.cmpAnimator.time + 50);
                    break;
                case ƒ.KEYBOARD_CODE.A:
                    SkeletonTest.cmpAnimator?.jumpTo(SkeletonTest.cmpAnimator.time - 50);
                    break;
                case ƒ.KEYBOARD_CODE.W:
                    ƒ.Time.game.setScale(ƒ.Time.game.getScale() * 2);
                    break;
                case ƒ.KEYBOARD_CODE.S:
                    ƒ.Time.game.setScale(ƒ.Time.game.getScale() / 2);
                    break;
                case ƒ.KEYBOARD_CODE.L:
                    console.log(SkeletonTest.loaded.getChild(0)?.mtxWorld.toString());
                    break;
            }
        }
        SkeletonTest.slcFile = document.getElementById("file");
        SkeletonTest.slcAmount = document.getElementById("amount");
        const selectedFile = parseInt(sessionStorage.getItem('selectedFile'));
        if (selectedFile != undefined)
            SkeletonTest.slcFile.selectedIndex = selectedFile;
        const selectedAmount = parseInt(sessionStorage.getItem('selectedAmount'));
        if (selectedAmount != undefined)
            SkeletonTest.slcAmount.selectedIndex = selectedAmount;
        load();
    }
})(SkeletonTest || (SkeletonTest = {}));
async function load() {
    // load scene
    SkeletonTest.loader = await ƒ.GLTFLoader.LOAD(SkeletonTest.slcFile.value);
    const amount = parseInt(SkeletonTest.slcAmount.value);
    if (amount == 1) {
        SkeletonTest.loaded = await SkeletonTest.loader.getGraph();
    }
    else {
        SkeletonTest.loaded = new ƒ.Node("loaded");
        for (let i = 0; i < amount; i++) {
            let instance = await ƒ.Project.createGraphInstance(await SkeletonTest.loader.getGraph());
            instance.addComponent(new ƒ.ComponentTransform());
            instance.name = "instance" + i;
            instance.mtxLocal.translateX((i * 2 - (amount - 1)) * 1.5);
            SkeletonTest.loaded.addChild(instance);
        }
    }
    SkeletonTest.cmpAnimator = SkeletonTest.loaded?.getComponent(ƒ.ComponentAnimator);
    SkeletonTest.loaded.name = "loaded";
    // loaded.getComponent(ƒ.ComponentAnimator)?.activate(false);
    let root = SkeletonTest.viewport.getBranch();
    let loaded = root.getChildrenByName("loaded")[0];
    if (loaded)
        root.replaceChild(loaded, SkeletonTest.loaded);
    else
        root.appendChild(SkeletonTest.loaded);
    ƒ.Debug.log("Loader:", SkeletonTest.loader);
    ƒ.Debug.log("Loaded:", SkeletonTest.loaded);
    // To store the selected option in sessionStorage
    sessionStorage.setItem('selectedFile', SkeletonTest.slcFile.selectedIndex.toString());
    sessionStorage.setItem('selectedAmount', SkeletonTest.slcAmount.selectedIndex.toString());
}
//# sourceMappingURL=SkeletonImportTest.js.map