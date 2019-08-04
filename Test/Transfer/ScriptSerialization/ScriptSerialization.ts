namespace ScriptSerialization {
    import ƒ = Fudge;
    ƒ.Serializer.registerNamespace(ScriptSerialization);
    window.addEventListener("DOMContentLoaded", init);

    function init(): void {
        ƒ.Debug.log("Start");
        ƒ.RenderManager.initialize();

        let root: ƒ.Node = new ƒ.Node("Root");
        let branch: ƒ.Node = new ƒ.Node("Branch");
        let camera: ƒ.Node = Scenes.createCamera(new ƒ.Vector3(5, 7, 10));
        let canvas: HTMLCanvasElement = Scenes.createCanvas();
        document.body.appendChild(canvas);
        let coSys: ƒ.Node = Scenes.createCoordinateSystem();
        root.appendChild(coSys);
        root.appendChild(branch);

        let viewport: ƒ.Viewport = new ƒ.Viewport();
        viewport.initialize("Viewport", branch, camera.getComponent(ƒ.ComponentCamera), canvas);

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
        // ƒ.Debug.log("Mutator", mutator);
        mutator.startPosition["x"] = 1;
        cmpScript.mutate(mutator);


        update(null);

        let srlResources: ƒ.SerializationOfResources = ƒ.ResourceManager.serialize();
        let srlBranch: ƒ.Serialization = ƒ.Serializer.serialize(branch);

        console.groupCollapsed("Resources");
        console.log(srlResources);
        console.groupEnd();
        console.groupCollapsed("Scene");
        console.log(srlBranch);
        console.groupEnd();

        // ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
        // ƒ.Loop.start();

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