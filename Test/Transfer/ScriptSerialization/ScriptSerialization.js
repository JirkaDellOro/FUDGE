var ScriptSerialization;
(function (ScriptSerialization) {
    var ƒ = Fudge;
    ƒ.Serializer.registerNamespace(ScriptSerialization);
    window.addEventListener("DOMContentLoaded", init);
    function init() {
        ƒ.Debug.log("Start");
        ƒ.RenderManager.initialize();
        let root = new ƒ.Node("Root");
        let branch = new ƒ.Node("Branch");
        let camera = Scenes.createCamera(new ƒ.Vector3(5, 7, 10));
        let canvas = Scenes.createCanvas();
        document.body.appendChild(canvas);
        let coSys = Scenes.createCoordinateSystem();
        root.appendChild(coSys);
        root.appendChild(branch);
        let viewport = new ƒ.Viewport();
        viewport.initialize("Viewport", branch, camera.getComponent(ƒ.ComponentCamera), canvas);
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
        // ƒ.Debug.log("Mutator", mutator);
        mutator.startPosition["x"] = 1;
        cmpScript.mutate(mutator);
        update(null);
        let srlResources = ƒ.ResourceManager.serialize();
        let srlBranch = ƒ.Serializer.serialize(branch);
        console.groupCollapsed("Resources");
        console.log(srlResources);
        console.groupEnd();
        console.groupCollapsed("Scene");
        console.log(srlBranch);
        console.groupEnd();
        // ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
        // ƒ.Loop.start();
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