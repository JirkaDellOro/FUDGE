///<reference path="../../Core/Build/FudgeCore.d.ts"/>
///<reference path="../../Aid/Build/FudgeAid.d.ts"/>
namespace SkeletonTest {
  import ƒ = FudgeCore;
  import ƒAid = FudgeAid;

  let camera: ƒAid.CameraOrbit;
  let speedCameraRotation: number = 0.2;
  let speedCameraTranslation: number = 0.1;
  let cntMouseX: ƒ.Control = new ƒ.Control("MouseX", speedCameraRotation);
  let cntMouseY: ƒ.Control = new ƒ.Control("MouseY", speedCameraRotation);

  window.addEventListener("load", init);
  async function init(): Promise<void> {

    // const loader: ƒ.FBXLoader = await ƒ.FBXLoader.LOAD("./TriangularPrism.fbx");
    // const loader: ƒ.FBXLoader = await ƒ.FBXLoader.LOAD("./animated_arm.fbx");
    const loader: ƒ.FBXLoader = await ƒ.FBXLoader.LOAD("./Unarmed Walk Forward.fbx");

    // test loading a mesh
    // console.log(await loader.getMesh(0));

    // load scene
    const graph: ƒ.Node = await loader.getScene(0);
    console.log(graph);

    // camera setup
    const cmpCamera: ƒ.ComponentCamera = new ƒ.ComponentCamera();
    camera = new ƒAid.CameraOrbit(cmpCamera, 500, 80, 2, 1000);
    camera.axisRotateX.addControl(cntMouseY);
    camera.axisRotateY.addControl(cntMouseX);
    cmpCamera.clrBackground.setHex("4472C4FF")
    graph.addChild(camera);
    camera.mtxLocal.translateY(100);

    // let skeleton: ƒ.Node = scene;
    // for (const node of scene)
    //   if (node != scene && node.name == "Skeleton0")
    //     skeleton = node;
    // const meshBone: ƒ.Mesh = new ƒ.MeshRotation(
    //   "bone",
    //   [
    //     new ƒ.Vector2(0, 5),
    //     new ƒ.Vector2(1, 0),
    //     new ƒ.Vector2(0, 0)
    //   ],
    //   3
    // );
    // const materialBone: ƒ.Material = new ƒ.Material("bone", ƒ.ShaderLit, new ƒ.CoatColored(ƒ.Color.CSS("green")));
    // for (const bone of skeleton) {
    //   if (bone != skeleton) {
    //     bone.addComponent(new ƒ.ComponentMesh(meshBone));
    //     bone.addComponent(new ƒ.ComponentMaterial(materialBone));
    //     if (bone.getChild(0) /*&& bone.getChild(0).mtxLocal.translation.y >
    //         Math.abs(bone.getChild(0).mtxLocal.translation.x) + Math.abs(bone.getChild(0).mtxLocal.translation.z)*/)
    //       bone.getComponent(ƒ.ComponentMesh).mtxPivot.scaleY(bone.getChild(0).mtxLocal.translation.y);
    //   }
    // }
    // for (const node of scene) {
    //   const cmpMaterial: ƒ.ComponentMaterial = node.getComponent(ƒ.ComponentMaterial);
    //   if (cmpMaterial && cmpMaterial.material.name != "bone")
    //     cmpMaterial.activate(false);
    // }
    
    // test loading all documents and objects
    // loader.fbx.documents.forEach(_document => _document.load());
    // loader.fbx.objects.all.forEach(_object => _object.load());
    // console.log(loader.nodes);
    // console.log(loader.fbx);

    // setup light
    const cmpLightDirectional: ƒ.ComponentLight = new ƒ.ComponentLight(new ƒ.LightDirectional(new ƒ.Color(0.5, 0.5, 0.5)));
    // cmpLightDirectional.mtxPivot.rotateY(180);
    graph.addComponent(cmpLightDirectional);

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

    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
    ƒ.Loop.start();

    function update(_event: Event): void {
      cmpLightDirectional.mtxPivot.rotation = new ƒ.Vector3(0, camera.rotationY + 180, 0);
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
      let cmpAnimator: ƒ.ComponentAnimator = graph.getComponent(ƒ.ComponentAnimator);
      if (cmpAnimator)
        timeSpan.innerText = cmpAnimator.time.toFixed(0);
      viewport.draw();
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