var NodeResource;
(function (NodeResource) {
    var ƒ = Fudge;
    window.addEventListener("DOMContentLoaded", init);
    function init() {
        ƒ.Debug.log("Start");
        ƒ.RenderManager.initialize();
        let branch = new ƒ.Node("Root");
        let camera = Scenes.createCamera(new ƒ.Vector3(5, 7, 20));
        let canvas = Scenes.createCanvas();
        document.body.appendChild(canvas);
        let coSys = Scenes.createCoordinateSystem();
        branch.appendChild(coSys);
        let viewport = new ƒ.Viewport();
        viewport.initialize("Viewport", branch, camera.getComponent(ƒ.ComponentCamera), canvas);
        let center = createCenterAndSatellite();
        // branch.appendChild(center);
        Fudge["AnimateSatellite"] = NodeResource.AnimateSatellite;
        let resource = ƒ.ResourceManager.registerNodeAsResource(center, false);
        for (let z = -3; z < 4; z++)
            for (let y = -3; y < 4; y++)
                for (let x = -3; x < 4; x++) {
                    let instance = new ƒ.NodeResourceInstance(resource);
                    branch.appendChild(instance);
                    instance.cmpTransform.local.translate(new ƒ.Vector3(2 * x, 2 * y, 2 * z));
                    instance.getComponent(ƒ.ComponentMesh).pivot.scale(ƒ.Vector3.ONE(1));
                    instance.broadcastEvent(new Event("startSatellite"));
                }
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
        center.getComponent(ƒ.ComponentMesh).pivot.scale(ƒ.Vector3.ONE(0.5));
        let satellite = Scenes.createCompleteMeshNode("Satellite", mtrCyan, new ƒ.MeshCube());
        center.appendChild(satellite);
        satellite.addComponent(new NodeResource.AnimateSatellite());
        return center;
    }
})(NodeResource || (NodeResource = {}));
//# sourceMappingURL=NodeResource.js.map