var AmbientOcclusionTest;
(function (AmbientOcclusionTest) {
    var ƒ = FudgeCore;
    var ƒui = FudgeUserInterface;
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
        AmbientOcclusionTest.viewport = new ƒ.Viewport();
        AmbientOcclusionTest.viewport.initialize("InteractiveViewport", graph, cmpCamera, canvas);
        ƒ.Debug.log("Viewport:", AmbientOcclusionTest.viewport);
        // hide the cursor when interacting, also suppressing right-click menu
        canvas.addEventListener("mousedown", canvas.requestPointerLock);
        canvas.addEventListener("mouseup", function () { document.exitPointerLock(); });
        // make the camera interactive (complex method in ƒAid)
        ƒAid.Viewport.expandCameraToInteractiveOrbit(AmbientOcclusionTest.viewport);
        let cmpAmbientOcclusion = new ƒ.ComponentAmbientOcclusion();
        cmpCamera.node.addComponent(cmpAmbientOcclusion);
        let ui = ƒui.Generator.createInterfaceFromMutable(cmpAmbientOcclusion);
        let controller = new ƒui.Controller(cmpAmbientOcclusion, ui);
        document.body.appendChild(ui);
        let fpsSpan = document.getElementById("fps");
        let lastUpdateTime = 0;
        const updateInterval = 200;
        ƒ.Loop.addEventListener("loopFrame" /* ƒ.EVENT.LOOP_FRAME */, update);
        ƒ.Loop.start();
        function update(_event) {
            if (ƒ.Loop.timeFrameStartReal - lastUpdateTime > updateInterval) {
                fpsSpan.innerText = "FPS: " + ƒ.Loop.fpsRealAverage.toFixed(0);
                lastUpdateTime = ƒ.Loop.timeFrameStartReal;
            }
            AmbientOcclusionTest.viewport.draw();
        }
    }
})(AmbientOcclusionTest || (AmbientOcclusionTest = {}));
//# sourceMappingURL=Main.js.map