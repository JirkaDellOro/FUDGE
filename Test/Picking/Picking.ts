namespace Picking {
  import ƒ = FudgeCore;
  import ƒUi = FudgeUserInterface;
  import ƒAid = FudgeAid;

  window.addEventListener("load", start);
  let cmpCamera: ƒ.ComponentCamera;
  let viewport: ƒ.Viewport;

  let mouse: ƒ.Vector2 = new ƒ.Vector2();

  let cursor: ƒAid.Node = new ƒAid.Node(
    "Cursor",
    ƒ.Matrix4x4.SCALING(ƒ.Vector3.ONE(0.05)),
    new ƒ.Material("Cursor", ƒ.ShaderUniColor, new ƒ.CoatColored(ƒ.Color.CSS("darkgray"))),
    new ƒ.MeshSphere("Cursor", 5, 5)
  );

  class Data extends ƒ.Mutable {
    public red: number = 100;
    public green: number = 100;
    public blue: number = 100;
    public yellow: number = 100;
    protected reduceMutator(_mutator: ƒ.Mutator): void {/* */ }
  }
  let data: Data = new Data();
  let uiController: ƒUi.Controller;

  async function start(_event: Event): Promise<void> {
    ƒ.Debug.fudge("Start Picking");

    // let domHud: HTMLDivElement = document.querySelector("div#ui");
    // uiController = new ƒUi.Controller(data, domHud);

    await FudgeCore.Project.loadResourcesFromHTML();
    let canvas: HTMLCanvasElement = document.querySelector("canvas");
    canvas.addEventListener("mousemove", setCursorPosition);

    // pick the graph to show
    let graph: ƒ.Graph = <ƒ.Graph>await ƒ.Project.getResource("Graph|2021-02-03T16:20:47.935Z|07303");
    graph.appendChild(cursor);

    // setup the viewport
    cmpCamera = new ƒ.ComponentCamera();
    Reflect.set(cmpCamera, "far", 4.3);
    // Reflect.set(cmpCamera, "fieldOfView", 170);
    cmpCamera.pivot.translateZ(2.1);
    cmpCamera.pivot.rotateY(180);
    viewport = new ƒ.Viewport();
    viewport.initialize("Viewport", graph, cmpCamera, canvas);
    // FudgeAid.Viewport.expandCameraToInteractiveOrbit(viewport);
    viewport.draw();

    viewport.createPickBuffers();
    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
    ƒ.Loop.start(ƒ.LOOP_MODE.TIME_GAME, 30);
    // canvas.addEventListener("mousemove", update);
    // window.addEventListener("resize", viewport.createPickBuffers.bind(viewport));

    function update(_event: Event): void {
      viewport.draw();
      pickNodeAt(mouse);
    }
  }

  function pickNodeAt(_pos: ƒ.Vector2): void {
    let mouseUp: ƒ.Vector2 = new ƒ.Vector2(_pos.x, viewport.getClientRectangle().height - _pos.y);
    let posRender: ƒ.Vector2 = viewport.pointClientToRender(mouseUp);

    let hits: ƒ.RayHit[] = viewport.pickNodeAt(posRender);
    for (let hit of hits) {
      data[hit.node.name] = hit.zBuffer / 128 - 1 || -1;
    }

    viewport.pointClipToClient

    let posClip: ƒ.Vector3 = new ƒ.Vector3(
      2 * mouse.x / viewport.getClientRectangle().width - 1,
      1 - 2 * mouse.y / viewport.getClientRectangle().height,
      hits[0].zBuffer / 128 - 1
    );

    let mtxViewProjectionInverse: ƒ.Matrix4x4 = ƒ.Matrix4x4.INVERSION(cmpCamera.ViewProjectionMatrix);
    let m: Float32Array = mtxViewProjectionInverse.get();
    let rayWorld: ƒ.Vector3 = ƒ.Vector3.TRANSFORMATION(posClip, mtxViewProjectionInverse, true);
    let w: number = m[3] * posClip.x + m[7] * posClip.y + m[11] * posClip.z + m[15];
    rayWorld.scale(1 / w);
    cursor.mtxLocal.translation = rayWorld;
  }


  function setCursorPosition(_event: MouseEvent): void {
    mouse = new ƒ.Vector2(_event.clientX, _event.clientY);
  }

}