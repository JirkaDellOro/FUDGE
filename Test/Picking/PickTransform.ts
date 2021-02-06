namespace PickTransform {
  import ƒ = FudgeCore;
  import ƒUi = FudgeUserInterface;
  import ƒAid = FudgeAid;

  window.addEventListener("load", start);
  let cmpCamera: ƒ.ComponentCamera;
  let viewport: ƒ.Viewport;

  let mouse: ƒ.Vector2 = new ƒ.Vector2();
  let cursor: ƒ.Vector2;
  let crc2: CanvasRenderingContext2D;
  let cube: ƒ.Node;
  let cubeTransformed: ƒ.Node;

  // class Data extends ƒ.Mutable {
  //   public red: number = 100;
  //   public green: number = 100;
  //   public blue: number = 100;
  //   public yellow: number = 100;
  //   protected reduceMutator(_mutator: ƒ.Mutator): void {/* */ }
  // }
  // let data: Data = new Data();
  // let uiController: ƒUi.Controller;

  async function start(_event: Event): Promise<void> {
    ƒ.Debug.fudge("Start Picking");

    // let domHud: HTMLDivElement = document.querySelector("div#ui");
    // uiController = new ƒUi.Controller(data, domHud);

    let canvas: HTMLCanvasElement = document.querySelector("canvas");
    crc2 = canvas.getContext("2d");

    // pick the graph to show
    let graph: ƒ.Node = new ƒ.Node("Graph");
    // graph.appendChild(cursor);
    cube = new ƒAid.Node(
      "Cube",
      ƒ.Matrix4x4.SCALING(ƒ.Vector3.ONE(0.2)),
      new ƒ.Material("Cube", ƒ.ShaderUniColor, new ƒ.CoatColored(ƒ.Color.CSS("green"))),
      new ƒ.MeshCube("Cube")
    );
    cubeTransformed = new ƒAid.Node(
      "CubeTransformed",
      ƒ.Matrix4x4.SCALING(ƒ.Vector3.ONE(0.2)),
      new ƒ.Material("Cube", ƒ.ShaderUniColor, new ƒ.CoatColored(ƒ.Color.CSS("red"))),
      new ƒ.MeshCube("Cube")
    );
    graph.appendChild(cube);
    graph.appendChild(cubeTransformed);

    // setup the viewport
    cmpCamera = new ƒ.ComponentCamera();
    // Reflect.set(cmpCamera, "fieldOfView", 170);
    cmpCamera.pivot.translateZ(2.1);
    cmpCamera.pivot.rotateY(180);
    viewport = new ƒ.Viewport();
    viewport.initialize("Viewport", graph, cmpCamera, canvas);
    // FudgeAid.Viewport.expandCameraToInteractiveOrbit(viewport);
    viewport.draw();

    cursor = viewport.pointWorldToClient(ƒ.Vector3.ZERO());
    // cursor = ƒ.Vector2.ZERO();

    // viewport.createPickBuffers();
    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
    ƒ.Loop.start(ƒ.LOOP_MODE.TIME_GAME, 30);
    canvas.addEventListener("mousemove", mouseMove);
    document.addEventListener("keydown", cursorMove);
    // window.addEventListener("resize", viewport.createPickBuffers.bind(viewport));

    function update(_event: Event): void {
      calculate();
      viewport.draw();
      cursorDraw();
    }

    function calculate(): void {
      // TODO: work in projection-space, not client...
      let p: ƒ.Vector2 = viewport.pointClientToProjection(mouse);
      let pT: ƒ.Vector2 = viewport.pointClientToProjection(new ƒ.Vector2(cursor.x, cursor.y));
      let p0: ƒ.Vector2 = viewport.pointClientToProjection(viewport.pointWorldToClient(cube.mtxLocal.translation));
      let r: ƒ.Vector2 = ƒ.Vector2.DIFFERENCE(p0, p);
      let p0T: ƒ.Vector2 = ƒ.Vector2.SUM(pT, r);
    
      
      let v: ƒ.Vector3 = ƒ.Vector3.NORMALIZATION(p.toVector3(1));
      let v0: ƒ.Vector3 = ƒ.Vector3.NORMALIZATION(p0.toVector3(1));
      let vT: ƒ.Vector3 = ƒ.Vector3.NORMALIZATION(pT.toVector3(1));
      let v0T: ƒ.Vector3 = ƒ.Vector3.NORMALIZATION(p0T.toVector3(1));
      
      let vL: ƒ.Vector3 = ƒ.Vector3.TRANSFORMATION(cube.mtxLocal.translation, ƒ.Matrix4x4.INVERSION(viewport.camera.pivot));
      let l: number = vL.magnitude;

      let vLT: ƒ.Vector3 = ƒ.Vector3.SCALE(v0T, l);
      let pos: ƒ.Vector3 = ƒ.Vector3.TRANSFORMATION(vLT, viewport.camera.pivot);
      cubeTransformed.mtxLocal.translation = pos;

      // let vL: ƒ.Vector3 = ƒ.Vector3.DIFFERENCE(cube.mtxLocal.translation, viewport.camera.pivot.translation);

      // let rayP0: ƒ.Ray = viewport.getRayFromClient(p0);
      // let rayP0: ƒ.Ray = new ƒ.Ray(ƒ.Vector3.NORMALIZATION(vL), viewport.camera.pivot.translation, 1);
      // console.log(rayP0.toString());

      // console.log(p0T.toString());

      // let vP: ƒ.Vector3 = 
    }

    function cursorDraw(): void {
      crc2.strokeStyle = "white";
      crc2.strokeRect(cursor.x - 1, cursor.y - 1, 3, 3);
    }

    function cursorMove(_event: KeyboardEvent): void {
      let step: number = _event.shiftKey ? 10 : 1;
      cursor.x += (_event.code == ƒ.KEYBOARD_CODE.D ? step : 0) - (_event.code == ƒ.KEYBOARD_CODE.A ? step : 0);
      cursor.y += (_event.code == ƒ.KEYBOARD_CODE.S ? step : 0) - (_event.code == ƒ.KEYBOARD_CODE.W ? step : 0);
    }

    function mouseMove(_event: MouseEvent): void {
      mouse = new ƒ.Vector2(_event.clientX, _event.clientY);
    }
  }
}