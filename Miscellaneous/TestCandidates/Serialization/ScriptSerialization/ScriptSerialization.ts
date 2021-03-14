namespace ScriptSerialization {
  import ƒ = FudgeCore;
  import ƒAid = FudgeAid;
  

  ƒ.Serializer.registerNamespace(ScriptSerialization);
  window.addEventListener("DOMContentLoaded", init);

  async function init(): Promise<void> {
    ƒ.Debug.log("Start");

    let root: ƒ.Node = new ƒ.Node("Root");
    let graph: ƒ.Node = new ƒ.Node("Graph");
    let cmpCamera: ƒ.ComponentCamera = new ƒ.ComponentCamera();
    cmpCamera.pivot.translation = new ƒ.Vector3(5, 7, 10);
    cmpCamera.pivot.lookAt(ƒ.Vector3.ZERO());
    let canvas: HTMLCanvasElement = document.querySelector("canvas");
    let coSys: ƒ.Node = new ƒAid.NodeCoordinateSystem();
    root.addChild(coSys);

    let test: ƒ.Node = createTest();
    graph.addChild(test);
    test.name = "Original";

    let resource: ƒ.Graph = await ƒ.Project.registerAsGraph(test, false);
    resource.name = "Resource";

    let instance: ƒ.GraphInstance = await ƒ.Project.createGraphInstance(resource);
    instance.name = "Instance";
    graph.addChild(instance);

    let cmpScript: Test = instance.getComponent(Test);
    let mutator: ƒ.Mutator = cmpScript.getMutator();
    mutator.startPosition["x"] = 1;
    cmpScript.mutate(mutator);


    let srlResources: ƒ.SerializationOfResources = ƒ.Project.serialize();
    let srlGraph: ƒ.Serialization = ƒ.Serializer.serialize(graph);

    console.groupCollapsed("Resources");
    console.log(srlResources);
    console.groupEnd();
    console.groupCollapsed("Scene");
    console.log(srlGraph);
    console.groupEnd();

    console.group("Serialization/Deserialization");
    ƒ.Debug.log("Original graph", graph);
    let json: string = ƒ.Serializer.stringify(srlGraph);
    console.groupCollapsed("Json");
    ƒ.Debug.log("JSON", json);
    console.groupEnd();
    let parsed: ƒ.Serialization = ƒ.Serializer.parse(json);
    ƒ.Debug.log("Parsed", parsed);
    let reconstruct: ƒ.Node = <ƒ.Node> await ƒ.Serializer.deserialize(parsed);
    ƒ.Debug.log("Reconstructed graph", reconstruct);
    console.groupEnd();

    root.addChild(reconstruct);

    let viewport: ƒ.Viewport = new ƒ.Viewport();
    viewport.initialize("Viewport", graph, cmpCamera, canvas);
    // ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
    // ƒ.Loop.start();
    Compare.compare(graph, reconstruct);

    update(null);
    function update(_event: Event): void {
      viewport.draw();
    }
  }

  function createTest(): ƒ.Node {
    let mtrOrange: ƒ.Material = new ƒ.Material("Orange", ƒ.ShaderUniColor, new ƒ.CoatColored(new ƒ.Color(1, 0.5, 0, 1)));
    let mtrCyan: ƒ.Material = new ƒ.Material("Cyan", ƒ.ShaderUniColor, new ƒ.CoatColored(new ƒ.Color(0, 0.5, 1, 1)));
    let pyramid: ƒ.MeshPyramid = new ƒ.MeshPyramid();
    let cube: ƒ.MeshCube = new ƒ.MeshCube();
    ƒ.Project.register(pyramid);
    ƒ.Project.register(cube);
    ƒ.Project.register(mtrOrange);
    ƒ.Project.register(mtrCyan);
    let node: ƒ.Node = new ƒAid.Node("Test", ƒ.Matrix4x4.IDENTITY(), mtrOrange, pyramid);
    node.addComponent(new Test());
    return node;
  }
}