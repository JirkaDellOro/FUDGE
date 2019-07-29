var NodeResource;
(function (NodeResource) {
    var ƒ = Fudge;
    window.addEventListener("DOMContentLoaded", init);
    function init() {
        ƒ.Debug.log("Start");
        ƒ.RenderManager.initialize();
        let branch = new ƒ.Node("Root");
        let camera = Scenes.createCamera();
        let canvas = Scenes.createCanvas();
        document.body.appendChild(canvas);
        let coSys = Scenes.createCoordinateSystem();
        branch.appendChild(coSys);
        let viewport = new ƒ.Viewport();
        viewport.initialize("Viewport", branch, camera.getComponent(ƒ.ComponentCamera), canvas);
        let center = createCenterAndSatellite();
        branch.appendChild(center);
        ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        ƒ.Loop.start();
        function update(_event) {
            ƒ.RenderManager.update();
            viewport.draw();
        }
    }
    function createCenterAndSatellite() {
        let mtrOrange = new ƒ.Material("Orange", ƒ.ShaderUniColor, new ƒ.CoatColored(new ƒ.Color(1, 0.5, 0, 1)));
        let mtrCyan = new ƒ.Material("Cyan", ƒ.ShaderUniColor, new ƒ.CoatColored(new ƒ.Color(0, 0.5, 1, 1)));
        let center = Scenes.createCompleteMeshNode("Center", mtrOrange, new ƒ.MeshPyramid());
        let satellite = Scenes.createCompleteMeshNode("Satellite", mtrCyan, new ƒ.MeshCube());
        satellite.addComponent(new NodeResource.AnimateSatellite());
        center.appendChild(satellite);
        return center;
    }
})(NodeResource || (NodeResource = {}));
//# sourceMappingURL=NodeResource.js.map