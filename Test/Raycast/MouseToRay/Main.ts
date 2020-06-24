namespace MouseToRay {
  import ƒ = FudgeCore;
  import ƒAid = FudgeAid;
  ƒ.RenderManager.initialize(true);

  window.addEventListener("load", init);

  export let root: ƒ.Node = new ƒ.Node("Root");
  let viewport: ƒ.Viewport;
  let distance: number = 5;
  let ray: ƒ.Ray;

  function init(): void {
    const canvas: HTMLCanvasElement = document.querySelector("canvas");
    ƒ.Debug.log("Canvas", canvas);

    createScene();

    let cmpCamera: ƒ.ComponentCamera = new ƒ.ComponentCamera();
    cmpCamera.pivot.translate(ƒ.Vector3.ONE(5));
    cmpCamera.pivot.lookAt(ƒ.Vector3.ZERO());
    viewport = new ƒ.Viewport();
    viewport.initialize("Viewport", root, cmpCamera, canvas);
    ƒ.Debug.log("Viewport", viewport);

    // setup event handling
    viewport.activatePointerEvent(ƒ.EVENT_POINTER.MOVE, true);
    viewport.activateWheelEvent(ƒ.EVENT_WHEEL.WHEEL, true);
    viewport.addEventListener(ƒ.EVENT_POINTER.MOVE, hndPointerMove);
    viewport.addEventListener(ƒ.EVENT_WHEEL.WHEEL, hndWheelMove);

    ƒ.Debug.log("Game", root);

    viewport.draw();
  }

  function hndPointerMove(_event: ƒ.EventPointer): void {
    ray = viewport.getRayFromScreenPoint(new ƒ.Vector2(_event.pointerX, _event.pointerY));
    positionCube();
  }


  function hndWheelMove(_event: WheelEvent): void {
    distance -= _event.deltaY * 0.01;
    distance = Math.max(3, distance);
    positionCube();
  }

  function positionCube(): void {
    let modifiers: Map<ƒ.KEYBOARD_CODE, ƒ.Vector3> = new Map([
      [ƒ.KEYBOARD_CODE.X, ƒ.Vector3.X()],
      [ƒ.KEYBOARD_CODE.Y, ƒ.Vector3.Y()],
      [ƒ.KEYBOARD_CODE.Z, ƒ.Vector3.Z()]
    ]);

    let normal: ƒ.Vector3;
    for (let entry of modifiers)
      if (ƒ.Keyboard.isPressedOne([entry[0]]))
        normal = entry[1];

    let pos: ƒ.Vector3;

    if (normal)
      pos = ray.intersectPlane(ƒ.Vector3.ZERO(), normal);
    else
      pos = ƒ.Vector3.SUM(ray.origin, ƒ.Vector3.SCALE(ray.direction, distance));
    root.getChildrenByName("Cube")[0].mtxLocal.translation = pos;
    viewport.draw();

  }

  function createScene(): void {
    root.addChild(new ƒAid.NodeCoordinateSystem());
    ƒAid.addStandardLightComponents(root);

    let cube: ƒAid.Node = new ƒAid.Node("Cube", ƒ.Matrix4x4.IDENTITY(), new ƒ.Material("Red", ƒ.ShaderFlat, new ƒ.CoatColored(ƒ.Color.CSS("RED"))), new ƒ.MeshCube());
    root.addChild(cube);
  }
}