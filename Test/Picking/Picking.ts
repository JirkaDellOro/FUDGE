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

    let domHud: HTMLDivElement = document.querySelector("div#ui");
    uiController = new ƒUi.Controller(data, domHud);

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
    ƒ.Loop.start();
    // canvas.addEventListener("mousemove", update);
    window.addEventListener("resize", viewport.createPickBuffers.bind(viewport));

    function update(_event: Event): void {
      viewport.draw();
      pickNodeAt(mouse);
    }
  }
  function pickNodeAt(_pos: ƒ.Vector2): void {
    let mouseUp: ƒ.Vector2 = new ƒ.Vector2(_pos.x, viewport.getClientRectangle().height - _pos.y);
    let posRender: ƒ.Vector2 = viewport.pointClientToRender(mouseUp);


    // let ray: ƒ.Ray =  viewport.getRayFromClient(mouse);
    let posProjection: ƒ.Vector2 = viewport.pointClientToProjection(mouse);
    // viewport.getRayFromClient()
    let direction: ƒ.Vector3 = new ƒ.Vector3(-posProjection.x, posProjection.y, 1); // understand the negation of x
    // direction.normalize();
    // let ray: ƒ.Ray = new ƒ.Ray();

    let mtxProjection: ƒ.Matrix4x4 = Reflect.get(cmpCamera, "transform");
    let rayClip: ƒ.Vector3 = ƒ.Vector3.TRANSFORMATION(direction, mtxProjection);
    // console.log(rayClip.toString());

    let hits: ƒ.RayHit[] = viewport.pickNodeAt(posRender);
    for (let hit of hits) {
      data[hit.node.name] = hit.zBuffer / 128 - 1;
    }


    rayClip.z = hits[0].zBuffer / 128 - 1;
    let mtxViewProjectionInverse: ƒ.Matrix4x4 = ƒ.Matrix4x4.INVERSION(cmpCamera.ViewProjectionMatrix);
    let m: Float32Array = mtxViewProjectionInverse.get();
    let rayWorld: ƒ.Vector3 = ƒ.Vector3.TRANSFORMATION(rayClip, mtxViewProjectionInverse, true);
    let w: number = m[3] * rayClip.x + m[7] * rayClip.y + m[11] * rayClip.z + m[15];
    rayWorld.scale(1 / w);
    // console.log(hits[0].node.name, rayWorld.toString());
    cursor.mtxLocal.translation = rayWorld;


    // console.log(data.red);
    // console.groupEnd();
  }


  function setCursorPosition(_event: MouseEvent): void {
    mouse = new ƒ.Vector2(_event.clientX, _event.clientY);
  }

}