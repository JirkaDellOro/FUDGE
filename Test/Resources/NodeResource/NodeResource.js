var NodeResource;
(function (NodeResource) {
    var ƒ = FudgeCore;
    ƒ.Serializer.registerNamespace(NodeResource);
    window.addEventListener("DOMContentLoaded", init);
    function init() {
        ƒ.Debug.log("Start");
        ƒ.RenderManager.initialize();
        let branch = new ƒ.Node("Root");
        let cmpCamera = Scenes.createCamera(new ƒ.Vector3(5, 7, 20));
        let canvas = Scenes.createCanvas();
        document.body.appendChild(canvas);
        // let coSys: ƒ.Node = Scenes.createCoordinateSystem();
        // branch.appendChild(coSys);
        let viewport = new ƒ.Viewport();
        viewport.initialize("Viewport", branch, cmpCamera, canvas);
        let center = createCenterAndSatellite();
        // branch.appendChild(center);
        // Fudge["AnimateSatellite"] = AnimateSatellite;
        // console.log(AnimateSatellite["namespaceX"]);
        let resource = ƒ.ResourceManager.registerNodeAsResource(center, false);
        let dim = new ƒ.Vector3(2, 2, 2);
        for (let z = -dim.z; z < dim.z + 1; z++)
            for (let y = -dim.y; y < dim.y + 1; y++)
                for (let x = -dim.x; x < dim.x + 1; x++) {
                    let instance = new ƒ.NodeResourceInstance(resource);
                    branch.appendChild(instance);
                    instance.cmpTransform.local.translate(new ƒ.Vector3(2 * x, 2 * y, 2 * z));
                    instance.getComponent(ƒ.ComponentMesh).pivot.scale(ƒ.Vector3.ONE(1));
                    instance.broadcastEvent(new Event("startSatellite"));
                }
        let srlResources = ƒ.ResourceManager.serialize();
        let srlInstance = ƒ.Serializer.serialize(new ƒ.NodeResourceInstance(resource));
        console.groupCollapsed("Resources");
        console.log(ƒ.Serializer.stringify(srlResources));
        console.groupEnd();
        console.groupCollapsed("NodeInstance");
        console.log(ƒ.Serializer.stringify(srlInstance));
        console.groupEnd();
        ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        // debugger;
        ƒ.Loop.start(ƒ.LOOP_MODE.TIME_GAME, 10);
        ƒ.Time.game.setScale(10);
        ƒ.Time.game.setTimeout(() => { ƒ.Debug.log("Timeout!"); }, 50000);
        function update(_event) {
            ƒ.RenderManager.update();
            viewport.draw();
        }
    }
    function createCenterAndSatellite() {
        let mtrOrange = new ƒ.Material("Orange", ƒ.ShaderUniColor, new ƒ.CoatColored(new ƒ.Color(1, 0.5, 0, 1)));
        let mtrCyan = new ƒ.Material("Cyan", ƒ.ShaderUniColor, new ƒ.CoatColored(new ƒ.Color(0, 0.5, 1, 1)));
        let pyramid = new ƒ.MeshPyramid();
        let cube = new ƒ.MeshCube();
        ƒ.ResourceManager.register(pyramid);
        ƒ.ResourceManager.register(cube);
        ƒ.ResourceManager.register(mtrOrange);
        ƒ.ResourceManager.register(mtrCyan);
        let center = Scenes.createCompleteMeshNode("Center", mtrOrange, pyramid);
        center.getComponent(ƒ.ComponentMesh).pivot.scale(ƒ.Vector3.ONE(0.5));
        let satellite = Scenes.createCompleteMeshNode("Satellite", mtrCyan, cube);
        center.appendChild(satellite);
        satellite.addComponent(new NodeResource.AnimateSatellite());
        return center;
    }
})(NodeResource || (NodeResource = {}));
//# sourceMappingURL=NodeResource.js.map