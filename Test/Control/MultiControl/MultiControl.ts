namespace MultiControl {
  import ƒ = FudgeCore;
  import ƒAid = FudgeAid;
  window.addEventListener("DOMContentLoaded", init);
  let axisSpeed: ƒ.Axis = new ƒ.Axis(1, ƒ.AXIS_TYPE.PROPORTIONAL);
  let axisRotation: ƒ.Axis = new ƒ.Axis(1, ƒ.AXIS_TYPE.PROPORTIONAL);
  let cube: ƒ.Node;
  let viewport: ƒ.Viewport;
  let maxSpeed: number = 2; // units per second

  function init(_event: Event): void {
    setupScene();
    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
    ƒ.Loop.start(ƒ.LOOP_MODE.FRAME_REQUEST, 60);
  }

  function update(_event: Event): void {
    let distance: number = maxSpeed * ƒ.Loop.timeFrameGame / 1000;
    cube.mtxLocal.rotateY(0.5 , true);
    cube.mtxLocal.translateZ(distance);
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