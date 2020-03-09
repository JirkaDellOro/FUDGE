namespace MultiControl {
  import ƒ = FudgeCore;
  import ƒAid = FudgeAid;
  window.addEventListener("DOMContentLoaded", init);
  let axisSpeed: ƒ.Axis = new ƒ.Axis(1, ƒ.AXIS_TYPE.PROPORTIONAL);
  let axisRotation: ƒ.Axis = new ƒ.Axis(1, ƒ.AXIS_TYPE.PROPORTIONAL);
  let cube: ƒ.Node;
  let viewport: ƒ.Viewport;
  let maxSpeed: number = 5; // units per second
  let maxRotSpeed: number = 180; // degrees per second

  function init(_event: Event): void {
    setupScene();
    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
    ƒ.Loop.start(ƒ.LOOP_MODE.FRAME_REQUEST, 60);

    axisSpeed.setDelay(500);
    axisRotation.setDelay(200);
  }

  function update(_event: Event): void {

    axisSpeed.setInput(ƒ.Keyboard.valueFor(1, 0, [ƒ.KEYBOARD_CODE.W]) + ƒ.Keyboard.valueFor(-1, 0, [ƒ.KEYBOARD_CODE.S]));
    axisRotation.setInput(ƒ.Keyboard.valueFor(1, 0, [ƒ.KEYBOARD_CODE.A]) + ƒ.Keyboard.valueFor(-1, 0, [ƒ.KEYBOARD_CODE.D]));

    let timeFrame: number = ƒ.Loop.timeFrameGame / 1000;
    let distance: number = axisSpeed.getValue() * maxSpeed * timeFrame ;
    let angle: number = axisRotation.getValue() * maxRotSpeed * timeFrame;
    cube.mtxLocal.translateZ(distance);
    cube.mtxLocal.rotateY(angle);

    viewport.draw();

  }

  function setupScene(): void {
    let root: ƒ.Node = new ƒ.Node("Root");

    //, new ƒ.CoatTextured()
    let mtrPlane: ƒ.Material = new ƒ.Material("mtrPlane", ƒ.ShaderUniColor, new ƒ.CoatColored(ƒ.Color.CSS("red")));
    let plane: ƒ.Node = new ƒAid.Node("Plane", ƒ.Matrix4x4.IDENTITY(), mtrPlane, new ƒ.MeshQuad());
    plane.mtxLocal.rotateX(-90);
    plane.mtxLocal.scale(ƒ.Vector3.ONE(20));

    let mtrCube: ƒ.Material = new ƒ.Material("mtrCube", ƒ.ShaderUniColor, new ƒ.CoatColored(ƒ.Color.CSS("white")));
    cube = new ƒAid.Node("Cube", ƒ.Matrix4x4.IDENTITY(), mtrCube, new ƒ.MeshCube());
    cube.getComponent(ƒ.ComponentMesh).pivot.translateY(0.5);

    root.addChild(plane);
    root.addChild(cube);

    let cmpCamera: ƒ.ComponentCamera = new ƒ.ComponentCamera();
    cmpCamera.pivot.translate(new ƒ.Vector3(10, 20, 30));
    cmpCamera.pivot.lookAt(ƒ.Vector3.ZERO());

    let canvas: HTMLCanvasElement = ƒAid.Canvas.create(true);
    document.body.appendChild(canvas);
    viewport = new ƒ.Viewport();
    viewport.initialize("Viewport", root, cmpCamera, canvas);
  }
} 