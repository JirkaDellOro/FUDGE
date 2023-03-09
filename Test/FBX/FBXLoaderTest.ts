///<reference path="./../../Core/Build/FudgeCore.d.ts"/>
namespace SkeletonTest {
  import ƒ = FudgeCore;

  const mouse: {
    position: ƒ.Vector2
  } = {
    position: new ƒ.Vector2()
  };

  window.addEventListener("load", init);

  async function init(): Promise<void> {
    const canvas: HTMLCanvasElement = document.querySelector("canvas") as HTMLCanvasElement;
    // const loader: ƒ.FBXLoader = await ƒ.FBXLoader.LOAD("./TriangularPrism.fbx");
    const loader1: ƒ.FBXLoader = await ƒ.FBXLoader.LOAD("./animated_arm.fbx");
    const loader: ƒ.FBXLoader = await ƒ.FBXLoader.LOAD("./Unarmed Walk Forward.fbx");

    // track mouse position relative to canvas center
    window.addEventListener("mousemove", (_event: MouseEvent) => {
      mouse.position.x = _event.clientX - canvas.width / 2;
      mouse.position.y = _event.clientY - canvas.height / 2;
    });

    // test loading a mesh
    console.log(await loader.getMesh(0));

    // load scene
    const scene: ƒ.Node = await loader.getScene(0);
    console.log(scene);

    // const skeleton: ƒ.Node = scene.getChildrenByName("Skeleton0")[0];
    // const meshBone: ƒ.Mesh = new ƒ.MeshRotation("bone", [
    //   new ƒ.Vector2(1, 0),
    //   new ƒ.Vector2(0, 0.2),
    //   new ƒ.Vector2(0, 0)
    // ]);
    // const materialBone: ƒ.Material = new ƒ.Material("bone");
    // for (const bone of skeleton) {
    //   if (bone != skeleton) {
    //     bone.addComponent(new ƒ.ComponentMesh(meshBone));
    //     bone.addComponent(new ƒ.ComponentMaterial(materialBone));
    //   }
    // }
    
    // test loading all documents and objects
    // loader.fbx.documents.forEach(_document => _document.load());
    // loader.fbx.objects.all.forEach(_object => _object.load());
    // console.log(loader.nodes);
    // console.log(loader.fbx);

    // setup camera
    const rotatorX: ƒ.Node = new ƒ.Node("RotatorX");
    rotatorX.addComponent(new ƒ.ComponentTransform());
    scene.addChild(rotatorX);

    const rotatorY: ƒ.Node = new ƒ.Node("RotatorY");
    rotatorY.addComponent(new ƒ.ComponentTransform());
    rotatorX.addChild(rotatorY);

    const camera: ƒ.Node = new ƒ.Node("Camera");
    camera.addComponent(new ƒ.ComponentCamera());
    camera.addComponent(new ƒ.ComponentTransform());
    camera.getComponent(ƒ.ComponentCamera).clrBackground.setHex("4472C4FF");
    camera.mtxLocal.translateY(0);  // 80
    camera.mtxLocal.translateZ(300); // 30
    camera.mtxLocal.lookAt(ƒ.Vector3.Y(camera.mtxLocal.translation.y), camera.mtxLocal.getY());
    rotatorY.addChild(camera);

    // setup light
    const cmpLightDirectional: ƒ.ComponentLight = new ƒ.ComponentLight(new ƒ.LightDirectional(new ƒ.Color(0.5, 0.5, 0.5)));
    cmpLightDirectional.mtxPivot.rotateY(180);
    rotatorY.addComponent(cmpLightDirectional);

    const cmpLightAmbient: ƒ.ComponentLight = new ƒ.ComponentLight(new ƒ.LightAmbient(new ƒ.Color(0.5, 0.5, 0.5)));
    scene.addComponent(cmpLightAmbient);

    // setup viewport
    const viewport: ƒ.Viewport = new ƒ.Viewport();
    viewport.initialize("Viewport", scene, camera.getComponent(ƒ.ComponentCamera), canvas);
    viewport.draw();
    console.log(viewport);

    // run loop
    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, () =>
      update(viewport, rotatorX.mtxLocal, rotatorY.mtxLocal, camera.mtxLocal));
    ƒ.Loop.start();
  }

  let gPressed: boolean = false;
  let iShader: number = 0;
  const shaders: typeof ƒ.Shader[] = [ƒ.ShaderFlatSkin, ƒ.ShaderGouraudSkin, ƒ.ShaderPhongSkin];
  function update(_viewport: ƒ.Viewport, _mtxRotatorX: ƒ.Matrix4x4, _mtxRotatorY: ƒ.Matrix4x4, _mtxCamera: ƒ.Matrix4x4): void {
    if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_RIGHT])) _mtxRotatorY.rotateY(3);
    if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_UP])) _mtxRotatorX.rotateX(-3);
    if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_LEFT])) _mtxRotatorY.rotateY(-3);
    if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_DOWN])) _mtxRotatorX.rotateX(3);
    if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.SPACE])) {
      _mtxRotatorX.set(ƒ.Matrix4x4.IDENTITY());
      _mtxRotatorY.set(ƒ.Matrix4x4.IDENTITY());
    }
    if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.PAGE_UP])) {
      // _mtxCamera.translateX(-mouse.position.x / _mtxCamera.translation.z);
      // _mtxCamera.translateY(-mouse.position.y / _mtxCamera.translation.z);
      _mtxCamera.translateZ(_mtxCamera.translation.z * 0.1);
    }
    if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.PAGE_DOWN])) {
      // _mtxCamera.translateX(mouse.position.x / _mtxCamera.translation.z);
      // _mtxCamera.translateY(mouse.position.y / _mtxCamera.translation.z);
      _mtxCamera.translateZ(-_mtxCamera.translation.z * 0.1);
    }
    const setShader: (_shader: typeof ƒ.Shader) => void = _shader => {
      for (const node of _viewport.getBranch()) {
        if (node.getComponent(ƒ.ComponentMaterial))
          node.getComponent(ƒ.ComponentMaterial).material.setShader(_shader);
      }
    };
    if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.G])) {
      if (!gPressed) {
        gPressed = true;
        setShader(shaders[iShader = (iShader + 1) % shaders.length]);
      }
    }
    else gPressed = false;
    if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.H])) setShader(ƒ.ShaderPhong);
    _viewport.draw();
  }
}