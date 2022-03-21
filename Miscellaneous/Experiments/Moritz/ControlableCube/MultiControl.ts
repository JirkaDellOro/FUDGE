///<reference types="../../../../Core/Build/FudgeCore"/>
///<reference types="../../../../Aid/Build/FudgeAid"/>

namespace ControlableCube {
  import f = FudgeCore;
  import ƒAid = FudgeAid;

  window.addEventListener("DOMContentLoaded", init);

  const clrWhite: f.Color = f.Color.CSS("white");
  
  let controlled: Controlled;
  let viewport: f.Viewport;

  let cntKeyHorizontal: f.Control = new f.Control("Keyboard", 1, f.CONTROL_TYPE.PROPORTIONAL, true);
  let cntKeyVertical: f.Control = new f.Control("Keyboard", 4, f.CONTROL_TYPE.PROPORTIONAL, true);
  // let cntMouseHorizontal: f.Control = new f.Control("Pointer", -1e-2, f.CONTROL_TYPE.INTEGRAL, true);
  // let cntMouseVertical: f.Control = new f.Control("Pointer", -0.1, f.CONTROL_TYPE.INTEGRAL, true);
  cntKeyHorizontal.setDelay(500);
  cntKeyVertical.setDelay(500);

  let cameraAnker: f.Node = new f.Node("CameraAnker");

  function init(_event: Event): void {
    setupScene(); 
    setupControls();
    f.Loop.addEventListener(f.EVENT.LOOP_FRAME, update);
    f.Loop.start(f.LOOP_MODE.FRAME_REQUEST, 60);
  }

  function update(_event: Event): void {
    hndKeyboardControls();
    let timeFrame: number = f.Loop.timeFrameGame / 1000;
    controlled.update(timeFrame);
    viewport.draw();
  }

  // function hndPointerMove(_event: PointerEvent): void {
  //   cntMouseHorizontal.setInput(_event.movementX);
  //   cntMouseVertical.setInput(_event.movementY);
  //   cntMouseHorizontal.setInput(0);
  //   cntMouseVertical.setInput(0);
  // }

  function hndKeyboardControls(): void {
    cntKeyVertical.setInput(
      f.Keyboard.mapToValue(1, 0, [f.KEYBOARD_CODE.W, f.KEYBOARD_CODE.ARROW_UP])
      + f.Keyboard.mapToValue(-1, 0, [f.KEYBOARD_CODE.S, f.KEYBOARD_CODE.ARROW_DOWN])
    );
    cntKeyHorizontal.setInput(
      f.Keyboard.mapToValue(1, 0, [f.KEYBOARD_CODE.A, f.KEYBOARD_CODE.ARROW_LEFT])
      + f.Keyboard.mapToValue(-1, 0, [f.KEYBOARD_CODE.D, f.KEYBOARD_CODE.ARROW_RIGHT])
    );
  }

  function setupScene(): void {
    let root: f.Node = new f.Node("Root");

    let mtrCube: f.Material = new f.Material("mtrCube", f.ShaderUniColor, new f.CoatColored(f.Color.CSS("white")));
    controlled = new Controlled("Cube", f.Matrix4x4.IDENTITY(), mtrCube, new f.MeshCube());
    // controlled.setUpAxis();
    controlled.getComponent(f.ComponentMesh).mtxPivot.translateY(0.5);
    root.addChild(controlled);

    let txtFloor: ƒ.TextureImage = new ƒ.TextureImage("../Textures/DEM1_5.png");
    let mtrFloor: ƒ.Material = new ƒ.Material("Floor", ƒ.ShaderTexture, new ƒ.CoatTextured(clrWhite, txtFloor));

    // let mtrPlane: f.Material = new f.Material("mtrPlane", f.ShaderUniColor, new f.CoatColored(f.Color.CSS("red")));
    let plane: f.Node = new ƒAid.Node("Plane", f.Matrix4x4.IDENTITY(), mtrFloor, new f.MeshQuad());
    plane.mtxLocal.rotateX(-90);
    plane.mtxLocal.scale(f.Vector3.ONE(20));
    root.addChild(plane);

    let cmpCamera: f.ComponentCamera = new f.ComponentCamera();
    // cmpCamera.mtxPivot.translate(new ƒ.Vector3(0, 20, 30));
    // cmpCamera.mtxPivot.lookAt(ƒ.Vector3.ZERO());

    cameraAnker.addComponent(new f.ComponentTransform);
    cameraAnker.mtxLocal.rotateY(180);
    
    cmpCamera.mtxPivot.translate(new f.Vector3(0, 30, 30));
    cmpCamera.mtxPivot.rotateY(0);
    cmpCamera.mtxPivot.rotateX(-30);
    cmpCamera.mtxPivot.lookAt(ƒ.Vector3.ZERO());

    cameraAnker.addComponent(cmpCamera);
    controlled.addChild(cameraAnker);

    let canvas: HTMLCanvasElement = ƒAid.Canvas.create(true);
    document.body.appendChild(canvas);
    viewport = new f.Viewport();
    viewport.initialize("Viewport", root, cmpCamera, canvas);
  }

  function setupControls(): void {
    controlled.axisSpeed.addControl(cntKeyVertical);
    // controlled.axisSpeed.addControl(cntMouseVertical);
    controlled.axisRotation.addControl(cntKeyHorizontal);
    // controlled.axisRotation.addControl(cntMouseHorizontal);

    // viewport.addEventListener(ƒ.EVENT_POINTER.MOVE, hndPointerMove);
    viewport.activatePointerEvent(f.EVENT_POINTER.MOVE, true);
  }
} 