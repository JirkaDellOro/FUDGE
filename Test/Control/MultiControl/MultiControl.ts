namespace MultiControl {
  import ƒ = FudgeCore;
  import ƒAid = FudgeAid;
  window.addEventListener("DOMContentLoaded", init);
  let controlled: Controlled;
  let viewport: ƒ.Viewport;

  let cntKeyHorizontal: ƒ.Control = new ƒ.Control("Keyboard", 1, ƒ.CONTROL_TYPE.PROPORTIONAL, true);
  let cntKeyVertical: ƒ.Control = new ƒ.Control("Keyboard", 4, ƒ.CONTROL_TYPE.PROPORTIONAL, true);
  let cntMouseHorizontal: ƒ.Control = new ƒ.Control("Pointer", -1e-2, ƒ.CONTROL_TYPE.INTEGRAL, true);
  let cntMouseVertical: ƒ.Control = new ƒ.Control("Pointer", -0.1, ƒ.CONTROL_TYPE.INTEGRAL, true);
  cntKeyHorizontal.setDelay(500);
  cntKeyVertical.setDelay(500);

  function init(_event: Event): void {
    setupScene(); 
    setupControls();
    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
    ƒ.Loop.start(ƒ.LOOP_MODE.FRAME_REQUEST, 60);
  }

  function update(_event: Event): void {
    hndKeyboardControls();
    let timeFrame: number = ƒ.Loop.timeFrameGame / 1000;
    controlled.update(timeFrame);
    viewport.draw();
  }

  function hndPointerMove(_event: PointerEvent): void {
    cntMouseHorizontal.setInput(_event.movementX);
    cntMouseVertical.setInput(_event.movementY);
    cntMouseHorizontal.setInput(0);
    cntMouseVertical.setInput(0);
  }

  function hndKeyboardControls(): void {
    cntKeyVertical.setInput(
      ƒ.Keyboard.mapToValue(1, 0, [ƒ.KEYBOARD_CODE.W, ƒ.KEYBOARD_CODE.ARROW_UP])
      + ƒ.Keyboard.mapToValue(-1, 0, [ƒ.KEYBOARD_CODE.S, ƒ.KEYBOARD_CODE.ARROW_DOWN])
    );
    cntKeyHorizontal.setInput(
      ƒ.Keyboard.mapToValue(1, 0, [ƒ.KEYBOARD_CODE.A, ƒ.KEYBOARD_CODE.ARROW_LEFT])
      + ƒ.Keyboard.mapToValue(-1, 0, [ƒ.KEYBOARD_CODE.D, ƒ.KEYBOARD_CODE.ARROW_RIGHT])
    );
  }

  function setupScene(): void {
    let root: ƒ.Node = new ƒ.Node("Root");

    let mtrCube: ƒ.Material = new ƒ.Material("mtrCube", ƒ.ShaderUniColor, new ƒ.CoatColored(ƒ.Color.CSS("white")));
    controlled = new Controlled("Cube", ƒ.Matrix4x4.IDENTITY(), mtrCube, new ƒ.MeshCube());
    // controlled.setUpAxis();
    controlled.getComponent(ƒ.ComponentMesh).pivot.translateY(0.5);
    root.addChild(controlled);

    let mtrPlane: ƒ.Material = new ƒ.Material("mtrPlane", ƒ.ShaderUniColor, new ƒ.CoatColored(ƒ.Color.CSS("red")));
    let plane: ƒ.Node = new ƒAid.Node("Plane", ƒ.Matrix4x4.IDENTITY(), mtrPlane, new ƒ.MeshQuad());
    plane.mtxLocal.rotateX(-90);
    plane.mtxLocal.scale(ƒ.Vector3.ONE(20));
    root.addChild(plane);

    let cmpCamera: ƒ.ComponentCamera = new ƒ.ComponentCamera();
    cmpCamera.pivot.translate(new ƒ.Vector3(10, 20, 30));
    cmpCamera.pivot.lookAt(ƒ.Vector3.ZERO());

    let canvas: HTMLCanvasElement = ƒAid.Canvas.create(true);
    document.body.appendChild(canvas);
    viewport = new ƒ.Viewport();
    viewport.initialize("Viewport", root, cmpCamera, canvas);
  }

  function setupControls(): void {
    controlled.axisSpeed.addControl(cntKeyVertical);
    controlled.axisSpeed.addControl(cntMouseVertical);
    controlled.axisRotation.addControl(cntKeyHorizontal);
    controlled.axisRotation.addControl(cntMouseHorizontal);

    viewport.addEventListener(ƒ.EVENT_POINTER.MOVE, hndPointerMove);
    viewport.activatePointerEvent(ƒ.EVENT_POINTER.MOVE, true);
  }
} 