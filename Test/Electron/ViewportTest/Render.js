var ElectronViewport;
(function (ElectronViewport) {
    var ƒ = FudgeCore;
    window.addEventListener("DOMContentLoaded", init);
    function init() {
        ƒ.RenderManager.initialize();
        // create asset
        let branch = Scenes.createAxisCross();
        ƒ.RenderManager.addBranch(branch);
        ƒ.RenderManager.update();
        // initialize viewport
        let cmpCamera = Scenes.createCamera(new ƒ.Vector3(3, 3, 5));
        cmpCamera.projectCentral(1, 45);
        let canvas = Scenes.createCanvas();
        document.body.appendChild(canvas);
        let viewPort = new ƒ.Viewport();
        viewPort.initialize("TestViewport", branch, cmpCamera, canvas);
        viewPort.draw();
    }
})(ElectronViewport || (ElectronViewport = {}));
//# sourceMappingURL=Render.js.map