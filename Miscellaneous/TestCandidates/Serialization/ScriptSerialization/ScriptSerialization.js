var ScriptSerialization;
(function (ScriptSerialization) {
    var ƒ = FudgeCore;
    var ƒAid = FudgeAid;
    ƒ.Serializer.registerNamespace(ScriptSerialization);
    window.addEventListener("DOMContentLoaded", init);
    async function init() {
        ƒ.Debug.log("Start");
        let root = new ƒ.Node("Root");
        let graph = new ƒ.Node("Graph");
        let cmpCamera = new ƒ.ComponentCamera();
        cmpCamera.pivot.translation = new ƒ.Vector3(5, 7, 10);
        cmpCamera.pivot.lookAt(ƒ.Vector3.ZERO());
        let canvas = document.querySelector("canvas");
        let coSys = new ƒAid.NodeCoordinateSystem();
        root.addChild(coSys);
        let test = createTest();
        graph.addChild(test);
        test.name = "Original";
        let resource = await ƒ.Project.registerAsGraph(test, false);
        resource.name = "Resource";
        let instance = await ƒ.Project.createGraphInstance(resource);
        instance.name = "Instance";
        graph.addChild(instance);
        let cmpScript = instance.getComponent(ScriptSerialization.Test);
        let mutator = cmpScript.getMutator();
        mutator.startPosition["x"] = 1;
        cmpScript.mutate(mutator);
        let srlResources = ƒ.Project.serialize();
        let srlGraph = ƒ.Serializer.serialize(graph);
        console.groupCollapsed("Resources");
        console.log(srlResources);
        console.groupEnd();
        console.groupCollapsed("Scene");
        console.log(srlGraph);
        console.groupEnd();
        console.group("Serialization/Deserialization");
        ƒ.Debug.log("Original graph", graph);
        let json = ƒ.Serializer.stringify(srlGraph);
        console.groupCollapsed("Json");
        ƒ.Debug.log("JSON", json);
        console.groupEnd();
        let parsed = ƒ.Serializer.parse(json);
        ƒ.Debug.log("Parsed", parsed);
        let reconstruct = await ƒ.Serializer.deserialize(parsed);
        ƒ.Debug.log("Reconstructed graph", reconstruct);
        console.groupEnd();
        root.addChild(reconstruct);
        let viewport = new ƒ.Viewport();
        viewport.initialize("Viewport", graph, cmpCamera, canvas);
        // ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
        // ƒ.Loop.start();
        Compare.compare(graph, reconstruct);
        update(null);
        function update(_event) {
            viewport.draw();
        }
    }
    function createTest() {
        let mtrOrange = new ƒ.Material("Orange", ƒ.ShaderUniColor, new ƒ.CoatColored(new ƒ.Color(1, 0.5, 0, 1)));
        let mtrCyan = new ƒ.Material("Cyan", ƒ.ShaderUniColor, new ƒ.CoatColored(new ƒ.Color(0, 0.5, 1, 1)));
        let pyramid = new ƒ.MeshPyramid();
        let cube = new ƒ.MeshCube();
        ƒ.Project.register(pyramid);
        ƒ.Project.register(cube);
        ƒ.Project.register(mtrOrange);
        ƒ.Project.register(mtrCyan);
        let node = new ƒAid.Node("Test", ƒ.Matrix4x4.IDENTITY(), mtrOrange, pyramid);
        node.addComponent(new ScriptSerialization.Test());
        return node;
    }
})(ScriptSerialization || (ScriptSerialization = {}));
//# sourceMappingURL=ScriptSerialization.js.map