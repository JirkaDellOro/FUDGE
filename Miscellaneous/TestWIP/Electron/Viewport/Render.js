var ElectronViewport;
(function (ElectronViewport) {
    var ƒ = FudgeCore;
    window.addEventListener("DOMContentLoaded", init);
    function init() {
        // create asset
        let graph = Scenes.createAxisCross();
        // initialize viewport
        let cmpCamera = Scenes.createCamera(new ƒ.Vector3(3, 3, 5));
        cmpCamera.projectCentral(1, 45);
        let canvas = Scenes.createCanvas();
        document.body.appendChild(canvas);
        let viewPort = new ƒ.Viewport();
        viewPort.initialize("TestViewport", graph, cmpCamera, canvas);
        viewPort.draw();
    }
})(ElectronViewport || (ElectronViewport = {}));
//# sourceMappingURL=Render.js.map