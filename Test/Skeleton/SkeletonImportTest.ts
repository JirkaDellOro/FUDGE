namespace SkeletonTest {
  import ƒ = FudgeCore;
  import ƒAid = FudgeAid;

  window.addEventListener("load", init);

  let camera: ƒAid.CameraOrbit;
  let speedCameraRotation: number = 0.2;
  let speedCameraTranslation: number = 0.002;
  let cntMouseX: ƒ.Control = new ƒ.Control("MouseX", speedCameraRotation);
  let cntMouseY: ƒ.Control = new ƒ.Control("MouseY", speedCameraRotation);

  async function init(): Promise<void> {
    const loader: ƒ.GLTFLoader = await ƒ.GLTFLoader.LOAD("./animated_arm.gltf");

    // load scene
    const graph: ƒ.Node = await loader.getScene();
    // graph.getComponent(ƒ.ComponentAnimator)?.activate(false);
    console.log(graph);

    // camera setup
    const cmpCamera: ƒ.ComponentCamera = new ƒ.ComponentCamera();
    camera = new ƒAid.CameraOrbit(cmpCamera, 7, 80, 2, 15);
    camera.axisRotateX.addControl(cntMouseY);
    camera.axisRotateY.addControl(cntMouseX);
    cmpCamera.clrBackground.setHex("4472C4FF");
    graph.addChild(camera);
    camera.mtxLocal.translateY(1);

    // setup light
    let cmpLight: ƒ.ComponentLight;
    cmpLight = new ƒ.ComponentLight(new ƒ.LightDirectional(new ƒ.Color(0.5, 0.5, 0.5)));
    graph.addComponent(cmpLight);

    const cmpLightAmbient: ƒ.ComponentLight = new ƒ.ComponentLight(new ƒ.LightAmbient(new ƒ.Color(0.5, 0.5, 0.5)));
    graph.addComponent(cmpLightAmbient);

    const viewport: ƒ.Viewport = new ƒ.Viewport();
    const canvas: HTMLCanvasElement = document.querySelector("canvas") as HTMLCanvasElement;
    viewport.initialize("Viewport", graph, cmpCamera, canvas);
    viewport.canvas.addEventListener("pointermove", hndPointerMove);
    viewport.canvas.addEventListener("wheel", hndWheelMove);

    canvas.addEventListener("mousedown", canvas.requestPointerLock);
    canvas.addEventListener("mouseup", () => document.exitPointerLock());

    let timeSpan: HTMLSpanElement = document.querySelector("span") as HTMLElement;
    let gPressed: boolean = false;
    let iShader: number = 0;
    const shaders: typeof ƒ.Shader[] = [ƒ.ShaderFlatSkin, ƒ.ShaderGouraudSkin, ƒ.ShaderPhongSkin];

    let lastUpdateTime: number = 0;
    const updateInterval: number = 200;

    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
    ƒ.Loop.start();

    function update(_event: Event): void {
      cmpLight.mtxPivot.rotation = new ƒ.Vector3(0, camera.rotationY + 180, 0);
      if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.P])) ƒ.Time.game.setScale(0);
      if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.W])) ƒ.Time.game.setScale(0.1);
      if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.S])) ƒ.Time.game.setScale(1);
      const setShader: (_shader: typeof ƒ.Shader) => void = _shader => {
        for (const node of graph) {
          if (node.getComponent(ƒ.ComponentMaterial))
            node.getComponent(ƒ.ComponentMaterial).material.setShader(_shader);
        }
      };
      if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.G])) {
        if (!gPressed) {
          gPressed = true;
          setShader(shaders[iShader = (iShader + 1) % shaders.length]);
        }
      } else
        gPressed = false;
      if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.H])) setShader(ƒ.ShaderPhong);
      
      if (ƒ.Loop.timeFrameStartReal - lastUpdateTime > updateInterval) {
        timeSpan.innerText = ƒ.Loop.fpsRealAverage.toFixed(2);
        lastUpdateTime = ƒ.Loop.timeFrameStartReal;
      }
      
      viewport.draw();
    }
  }

  function hndPointerMove(_event: PointerEvent): void {
    if (!_event.buttons)
      return;
    cntMouseX.setInput(-_event.movementX);
    cntMouseY.setInput(-_event.movementY);
  }

  function hndWheelMove(_event: WheelEvent): void {
    camera.distance += _event.deltaY * speedCameraTranslation;
  }


}