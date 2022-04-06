namespace Graph {
  import ƒ = FudgeCore;
  import ƒAid = FudgeAid;

  ƒ.Serializer.registerNamespace(Graph);
  window.addEventListener("DOMContentLoaded", init);

  async function init(): Promise<void> {
    ƒ.Debug.log("Start");

    let root: ƒ.Node = new ƒ.Node("Root");

    let cmpCamera: ƒ.ComponentCamera = new ƒ.ComponentCamera();
    cmpCamera.mtxPivot.translation = new ƒ.Vector3(5, 7, 20);
    cmpCamera.mtxPivot.lookAt(ƒ.Vector3.ZERO());

    let canvas: HTMLCanvasElement = document.querySelector("canvas");

    document.body.appendChild(canvas);

    let viewport: ƒ.Viewport = new ƒ.Viewport();
    viewport.initialize("Viewport", root, cmpCamera, canvas);

    let center: ƒ.Node = createCenterAndSatellite();

    let resource: ƒ.Graph = await ƒ.Project.registerAsGraph(center, false);

    let dim: ƒ.Vector3 = new ƒ.Vector3(2, 2, 2);

    for (let z: number = -dim.z; z < dim.z + 1; z++)
      for (let y: number = -dim.y; y < dim.y + 1; y++)
        for (let x: number = -dim.x; x < dim.x + 1; x++) {
          let instance: ƒ.GraphInstance = await ƒ.Project.createGraphInstance(resource);
          root.addChild(instance);
          instance.mtxLocal.translate(new ƒ.Vector3(2 * x, 2 * y, -2 * z));
          (<ƒ.ComponentMesh>instance.getComponent(ƒ.ComponentMesh)).mtxPivot.scale(ƒ.Vector3.ONE(1));
        }


    root.getChild(1).addComponent(new ƒ.ComponentGraphFilter());
    root.broadcastEvent(new Event("startSatellite"));

    let srlResources: ƒ.SerializationOfResources = ƒ.Project.serialize();
    let srlInstance: ƒ.Serialization = ƒ.Serializer.serialize(new ƒ.GraphInstance(resource));

    {
      console.groupCollapsed("Resources");
      console.log(ƒ.Serializer.stringify(srlResources));
      console.groupEnd();
    }
    {
      console.groupCollapsed("NodeInstance unfiltered");
      console.log(ƒ.Serializer.stringify(srlInstance));
      console.groupEnd();
    }
    {
      console.groupCollapsed("NodeInstance filtered");
      let instance: ƒ.GraphInstance = new ƒ.GraphInstance(resource);
      instance.addComponent(new ƒ.ComponentGraphFilter());
      console.log(instance);
      srlInstance = ƒ.Serializer.serialize(instance);
      console.log(ƒ.Serializer.stringify(srlInstance));
      console.groupEnd();
    }

    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
    // debugger;
    ƒ.Loop.start(ƒ.LOOP_MODE.TIME_GAME, 10);

    async function update(_event: Event): Promise<void> {
      let time: number = ƒ.Time.game.get() % 1000 / 1000;
      // await root.getChild(0).getComponent(ƒ.ComponentMaterial).mutate({ clrPrimary: { r: time } });
      await root.getChild(0).getComponent(ƒ.ComponentMesh).mutate({ mtxPivot: { rotation: { y: time * 100 } } });
      root.getChild(0).getComponent(ƒ.ComponentMaterial).clrPrimary.r = time;
      // root.getChild(0).getComponent(ƒ.ComponentMesh).mtxPivot.rotateZ(10);
      viewport.draw();
    }
  }

  function createCenterAndSatellite(): ƒ.Node {
    let mtrOrange: ƒ.Material = new ƒ.Material("Orange", ƒ.ShaderLit, new ƒ.CoatColored(new ƒ.Color(1, 0.5, 0, 1)));
    let mtrCyan: ƒ.Material = new ƒ.Material("Cyan", ƒ.ShaderLit, new ƒ.CoatColored(new ƒ.Color(0, 0.5, 1, 1)));
    let pyramid: ƒ.MeshPyramid = new ƒ.MeshPyramid();
    let cube: ƒ.MeshCube = new ƒ.MeshCube();

    let center: ƒ.Node = new ƒAid.Node("Center", ƒ.Matrix4x4.IDENTITY(), mtrOrange, pyramid);
    center.getComponent(ƒ.ComponentMesh).mtxPivot.scale(ƒ.Vector3.ONE(0.5));
    let satellite: ƒ.Node = new ƒAid.Node("Satellite", ƒ.Matrix4x4.IDENTITY(), mtrCyan, cube);
    center.addChild(satellite);
    satellite.addComponent(new AnimateSatellite());
    return center;
  }
}