var ScriptSerialization;
(function (ScriptSerialization) {
    var ƒ = FudgeCore;
    ƒ.Serializer.registerNamespace(ScriptSerialization);
    window.addEventListener("DOMContentLoaded", init);
    function init() {
        ƒ.Debug.log("Start");
        let root = new ƒ.Node("Root");
        let branch = new ƒ.Node("Branch");
        let cmpCamera = Scenes.createCamera(new ƒ.Vector3(5, 7, 10));
        let canvas = Scenes.createCanvas();
        document.body.appendChild(canvas);
        let coSys = Scenes.createCoordinateSystem();
        root.appendChild(coSys);
        // root.appendChild(branch);
        let test = createTest();
        branch.appendChild(test);
        test.name = "Original";
        let resource = ƒ.ResourceManager.registerNodeAsResource(test, false);
        resource.name = "Resource";
        let instance = new ƒ.NodeResourceInstance(resource);
        instance.name = "Instance";
        branch.appendChild(instance);
        let cmpScript = instance.getComponent(ScriptSerialization.Test);
        let mutator = cmpScript.getMutator();
        mutator.startPosition["x"] = 1;
        cmpScript.mutate(mutator);
        let srlResources = ƒ.ResourceManager.serialize();
        let srlBranch = ƒ.Serializer.serialize(branch);
        console.groupCollapsed("Resources");
        console.log(srlResources);
        console.groupEnd();
        console.groupCollapsed("Scene");
        console.log(srlBranch);
        console.groupEnd();
        console.group("Serialization/Deserialization");
        ƒ.Debug.log("Original branch", branch);
        let json = ƒ.Serializer.stringify(srlBranch);
        console.groupCollapsed("Json");
        ƒ.Debug.log("JSON", json);
        console.groupEnd();
        let parsed = ƒ.Serializer.parse(json);
        ƒ.Debug.log("Parsed", parsed);
        let reconstruct = ƒ.Serializer.deserialize(parsed);
        ƒ.Debug.log("Reconstructed branch", reconstruct);
        console.groupEnd();
        root.appendChild(reconstruct);
        ƒ.RenderManager.initialize();
        let viewport = new ƒ.Viewport();
        viewport.initialize("Viewport", branch, cmpCamera, canvas);
        // ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
        // ƒ.Loop.start();
        Compare.compare(branch, reconstruct);
        update(null);
        function update(_event) {
            ƒ.RenderManager.update();
            viewport.draw();
        }
    }
    function createTest() {
        let mtrOrange = new ƒ.Material("Orange", ƒ.ShaderUniColor, new ƒ.CoatColored(new ƒ.Color(1, 0.5, 0, 1)));
        let mtrCyan = new ƒ.Material("Cyan", ƒ.ShaderUniColor, new ƒ.CoatColored(new ƒ.Color(0, 0.5, 1, 1)));
        let pyramid = new ƒ.MeshPyramid();
        let cube = new ƒ.MeshCube();
        ƒ.ResourceManager.register(pyramid);
        ƒ.ResourceManager.register(cube);
        ƒ.ResourceManager.register(mtrOrange);
        ƒ.ResourceManager.register(mtrCyan);
        let node = Scenes.createCompleteMeshNode("Test", mtrOrange, pyramid);
        // (<ƒ.ComponentMesh>center.getComponent(ƒ.ComponentMesh)).pivot.scale(ƒ.Vector3.ONE(0.5));
        // let satellite: ƒ.Node = Scenes.createCompleteMeshNode("Satellite", mtrCyan, cube);
        // center.appendChild(satellite);
        node.addComponent(new ScriptSerialization.Test());
        return node;
    }
})(ScriptSerialization || (ScriptSerialization = {}));
//# sourceMappingURL=ScriptSerialization.js.map