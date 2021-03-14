var Graph;
(function (Graph) {
    var ƒ = FudgeCore;
    var ƒAid = FudgeAid;
    ƒ.Serializer.registerNamespace(Graph);
    window.addEventListener("DOMContentLoaded", init);
    async function init() {
        ƒ.Debug.log("Start");
        let graph = new ƒ.Node("Root");
        let cmpCamera = new ƒ.ComponentCamera();
        cmpCamera.pivot.translation = new ƒ.Vector3(5, 7, 20);
        cmpCamera.pivot.lookAt(ƒ.Vector3.ZERO());
        let canvas = document.querySelector("canvas");
        document.body.appendChild(canvas);
        let viewport = new ƒ.Viewport();
        viewport.initialize("Viewport", graph, cmpCamera, canvas);
        let center = createCenterAndSatellite();
        // Fudge["AnimateSatellite"] = AnimateSatellite;
        // console.log(AnimateSatellite["namespaceX"]);
        let resource = await ƒ.Project.registerAsGraph(center, false);
        let dim = new ƒ.Vector3(2, 2, 2);
        for (let z = -dim.z; z < dim.z + 1; z++)
            for (let y = -dim.y; y < dim.y + 1; y++)
                for (let x = -dim.x; x < dim.x + 1; x++) {
                    let instance = await ƒ.Project.createGraphInstance(resource);
                    graph.addChild(instance);
                    instance.mtxLocal.translate(new ƒ.Vector3(2 * x, 2 * y, 2 * z));
                    instance.getComponent(ƒ.ComponentMesh).pivot.scale(ƒ.Vector3.ONE(1));
                    instance.broadcastEvent(new Event("startSatellite"));
                }
        let srlResources = ƒ.Project.serialize();
        let srlInstance = ƒ.Serializer.serialize(new ƒ.GraphInstance(resource));
        console.groupCollapsed("Resources");
        console.log(ƒ.Serializer.stringify(srlResources));
        console.groupEnd();
        console.groupCollapsed("NodeInstance");
        console.log(ƒ.Serializer.stringify(srlInstance));
        console.groupEnd();
        ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
        // debugger;
        ƒ.Loop.start(ƒ.LOOP_MODE.TIME_GAME, 10);
        function update(_event) {
            viewport.draw();
        }
    }
    function createCenterAndSatellite() {
        let mtrOrange = new ƒ.Material("Orange", ƒ.ShaderUniColor, new ƒ.CoatColored(new ƒ.Color(1, 0.5, 0, 1)));
        let mtrCyan = new ƒ.Material("Cyan", ƒ.ShaderUniColor, new ƒ.CoatColored(new ƒ.Color(0, 0.5, 1, 1)));
        let pyramid = new ƒ.MeshPyramid();
        let cube = new ƒ.MeshCube();
        // ƒ.Project.register(pyramid);
        // ƒ.Project.register(cube);
        // ƒ.Project.register(mtrOrange);
        // ƒ.Project.register(mtrCyan);
        let center = new ƒAid.Node("Center", ƒ.Matrix4x4.IDENTITY(), mtrOrange, pyramid);
        center.getComponent(ƒ.ComponentMesh).pivot.scale(ƒ.Vector3.ONE(0.5));
        let satellite = new ƒAid.Node("Satellite", ƒ.Matrix4x4.IDENTITY(), mtrCyan, cube);
        center.addChild(satellite);
        satellite.addComponent(new Graph.AnimateSatellite());
        return center;
    }
})(Graph || (Graph = {}));
//# sourceMappingURL=Graph.js.map