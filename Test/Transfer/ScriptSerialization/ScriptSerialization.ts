namespace ScriptSerialization {
    import ƒ = FudgeCore;
    ƒ.Serializer.registerNamespace(ScriptSerialization);
    window.addEventListener("DOMContentLoaded", init);

    function init(): void {
        ƒ.Debug.log("Start");

        let root: ƒ.Node = new ƒ.Node("Root");
        let branch: ƒ.Node = new ƒ.Node("Branch");
        let cmpCamera: ƒ.ComponentCamera = Scenes.createCamera(new ƒ.Vector3(5, 7, 10));
        let canvas: HTMLCanvasElement = Scenes.createCanvas();
        document.body.appendChild(canvas);
        let coSys: ƒ.Node = Scenes.createCoordinateSystem();
        root.appendChild(coSys);
        // root.appendChild(branch);

        let test: ƒ.Node = createTest();
        branch.appendChild(test);
        test.name = "Original";

        let resource: ƒ.NodeResource = ƒ.ResourceManager.registerNodeAsResource(test, false);
        resource.name = "Resource";

        let instance: ƒ.NodeResourceInstance = new ƒ.NodeResourceInstance(resource);
        instance.name = "Instance";
        branch.appendChild(instance);

        let cmpScript: Test = instance.getComponent(Test);
        let mutator: ƒ.Mutator = cmpScript.getMutator();
        mutator.startPosition["x"] = 1;
        cmpScript.mutate(mutator);


        let srlResources: ƒ.SerializationOfResources = ƒ.ResourceManager.serialize();
        let srlBranch: ƒ.Serialization = ƒ.Serializer.serialize(branch);

        console.groupCollapsed("Resources");
        console.log(srlResources);
        console.groupEnd();
        console.groupCollapsed("Scene");
        console.log(srlBranch);
        console.groupEnd();

        console.group("Serialization/Deserialization");
        ƒ.Debug.log("Original branch", branch);
        let json: string = ƒ.Serializer.stringify(srlBranch);
        console.groupCollapsed("Json");
        ƒ.Debug.log("JSON", json);
        console.groupEnd();
        let parsed: ƒ.Serialization = ƒ.Serializer.parse(json);
        ƒ.Debug.log("Parsed", parsed);
        let reconstruct: ƒ.Node = <ƒ.Node>ƒ.Serializer.deserialize(parsed);
        ƒ.Debug.log("Reconstructed branch", reconstruct);
        console.groupEnd();
        
        root.appendChild(reconstruct);

        ƒ.RenderManager.initialize();
        let viewport: ƒ.Viewport = new ƒ.Viewport();
        viewport.initialize("Viewport", branch, cmpCamera, canvas);
        // ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
        // ƒ.Loop.start();
        Compare.compare(branch, reconstruct);

        update(null);
        function update(_event: Event): void {
            ƒ.RenderManager.update();
            viewport.draw();
        }
    }

    function createTest(): ƒ.Node {
        let mtrOrange: ƒ.Material = new ƒ.Material("Orange", ƒ.ShaderUniColor, new ƒ.CoatColored(new ƒ.Color(1, 0.5, 0, 1)));
        let mtrCyan: ƒ.Material = new ƒ.Material("Cyan", ƒ.ShaderUniColor, new ƒ.CoatColored(new ƒ.Color(0, 0.5, 1, 1)));
        let pyramid: ƒ.MeshPyramid = new ƒ.MeshPyramid();
        let cube: ƒ.MeshCube = new ƒ.MeshCube();
        ƒ.ResourceManager.register(pyramid);
        ƒ.ResourceManager.register(cube);
        ƒ.ResourceManager.register(mtrOrange);
        ƒ.ResourceManager.register(mtrCyan);
        let node: ƒ.Node = Scenes.createCompleteMeshNode("Test", mtrOrange, pyramid);
        // (<ƒ.ComponentMesh>center.getComponent(ƒ.ComponentMesh)).pivot.scale(ƒ.Vector3.ONE(0.5));
        // let satellite: ƒ.Node = Scenes.createCompleteMeshNode("Satellite", mtrCyan, cube);
        // center.appendChild(satellite);
        node.addComponent(new Test());
        return node;
    }
}