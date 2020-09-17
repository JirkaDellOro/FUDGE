namespace NodeResource {
  import ƒ = FudgeCore;
  
  ƒ.Serializer.registerNamespace(NodeResource);
  window.addEventListener("DOMContentLoaded", init);

  async function init(): Promise<void> {
    ƒ.Debug.log("Start");

    let graph: ƒ.Node = new ƒ.Node("Root");
    let cmpCamera: ƒ.ComponentCamera = Scenes.createCamera(new ƒ.Vector3(5, 7, 20));
    let canvas: HTMLCanvasElement = Scenes.createCanvas();
    document.body.appendChild(canvas);

    let viewport: ƒ.Viewport = new ƒ.Viewport();
    viewport.initialize("Viewport", graph, cmpCamera, canvas);

    let center: ƒ.Node = createCenterAndSatellite();

    // Fudge["AnimateSatellite"] = AnimateSatellite;
    // console.log(AnimateSatellite["namespaceX"]);
    let resource: ƒ.NodeResource = await ƒ.ResourceManager.registerNodeAsResource(center, false);

    let dim: ƒ.Vector3 = new ƒ.Vector3(2, 2, 2);

    for (let z: number = -dim.z; z < dim.z + 1; z++)
      for (let y: number = -dim.y; y < dim.y + 1; y++)
        for (let x: number = -dim.x; x < dim.x + 1; x++) {
          let instance: ƒ.NodeResourceInstance = new ƒ.NodeResourceInstance(resource);
          graph.addChild(instance);
          instance.mtxLocal.translate(new ƒ.Vector3(2 * x, 2 * y, 2 * z));
          (<ƒ.ComponentMesh>instance.getComponent(ƒ.ComponentMesh)).pivot.scale(ƒ.Vector3.ONE(1));
          instance.broadcastEvent(new Event("startSatellite"));
        }

    let srlResources: ƒ.SerializationOfResources = ƒ.ResourceManager.serialize();
    let srlInstance: ƒ.Serialization = ƒ.Serializer.serialize(new ƒ.NodeResourceInstance(resource));
    console.groupCollapsed("Resources");
    console.log(ƒ.Serializer.stringify(srlResources));
    console.groupEnd();
    console.groupCollapsed("NodeInstance");
    console.log(ƒ.Serializer.stringify(srlInstance));
    console.groupEnd();

    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
    // debugger;
    ƒ.Loop.start(ƒ.LOOP_MODE.TIME_GAME, 10);

    function update(_event: Event): void {
      viewport.draw();
    }
  }

  function createCenterAndSatellite(): ƒ.Node {
    let mtrOrange: ƒ.Material = new ƒ.Material("Orange", ƒ.ShaderUniColor, new ƒ.CoatColored(new ƒ.Color(1, 0.5, 0, 1)));
    let mtrCyan: ƒ.Material = new ƒ.Material("Cyan", ƒ.ShaderUniColor, new ƒ.CoatColored(new ƒ.Color(0, 0.5, 1, 1)));
    let pyramid: ƒ.MeshPyramid = new ƒ.MeshPyramid();
    let cube: ƒ.MeshCube = new ƒ.MeshCube();
    ƒ.ResourceManager.register(pyramid);
    ƒ.ResourceManager.register(cube);
    ƒ.ResourceManager.register(mtrOrange);
    ƒ.ResourceManager.register(mtrCyan);
    let center: ƒ.Node = Scenes.createCompleteMeshNode("Center", mtrOrange, pyramid);
    (<ƒ.ComponentMesh>center.getComponent(ƒ.ComponentMesh)).pivot.scale(ƒ.Vector3.ONE(0.5));
    let satellite: ƒ.Node = Scenes.createCompleteMeshNode("Satellite", mtrCyan, cube);
    center.addChild(satellite);
    satellite.addComponent(new AnimateSatellite());
    return center;
  }
}