var Picking;
(function (Picking) {
    var ƒ = FudgeCore;
    window.addEventListener("load", start);
    async function start(_event) {
        ƒ.Debug.fudge("Start Picking");
        await FudgeCore.Project.loadResourcesFromHTML();
        // pick the graph to show
        let graph = await ƒ.Project.getResource("Graph|2021-02-03T16:20:47.935Z|07303");
        // setup the viewport
        let cmpCamera = new ƒ.ComponentCamera();
        cmpCamera.pivot.translateZ(3);
        cmpCamera.pivot.rotateY(180);
        let canvas = document.querySelector("canvas");
        let viewport = new ƒ.Viewport();
        viewport.initialize("Viewport", graph, cmpCamera, canvas);
        // FudgeAid.Viewport.expandCameraToInteractiveOrbit(viewport);
        viewport.draw();
    }
})(Picking || (Picking = {}));
//# sourceMappingURL=Picking.js.map