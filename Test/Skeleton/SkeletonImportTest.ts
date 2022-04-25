///<reference path="./../../Core/Build/FudgeCore.d.ts"/>
namespace SkeletonTest {
  import ƒ = FudgeCore;

  window.addEventListener("load", init);

  async function init(): Promise<void> {
    const canvas: HTMLCanvasElement = document.querySelector("canvas");

    // setup scene
    const scene: ƒ.Node = new ƒ.Node("Scene");

    const rotatorX: ƒ.Node = new ƒ.Node("RotatorX");
    rotatorX.addComponent(new ƒ.ComponentTransform());

    const rotatorY: ƒ.Node = new ƒ.Node("RotatorY");
    rotatorY.addComponent(new ƒ.ComponentTransform());

    const zylinder: ƒ.Node = await loadAnimatedArm();
    console.log(zylinder);

    scene.addChild(rotatorX);
    rotatorX.addChild(rotatorY);
    rotatorY.addChild(zylinder);

    // setup camera
    const camera: ƒ.Node = new ƒ.Node("Camera");
    camera.addComponent(new ƒ.ComponentCamera());
    camera.addComponent(new ƒ.ComponentTransform());
    camera.getComponent(ƒ.ComponentCamera).clrBackground.setHex("4472C4FF");
    camera.mtxLocal.translateZ(10);
    camera.mtxLocal.lookAt(ƒ.Vector3.ZERO(), camera.mtxLocal.getY());
    scene.addChild(camera);

    // setup light
    const cmpLightDirectional: ƒ.ComponentLight = new ƒ.ComponentLight(new ƒ.LightDirectional(new ƒ.Color(0.5, 0.5, 0.5)));
    cmpLightDirectional.mtxPivot.rotateY(180);
    scene.addComponent(cmpLightDirectional);

    const cmpLightAmbient: ƒ.ComponentLight = new ƒ.ComponentLight(new ƒ.LightAmbient(new ƒ.Color(0.5, 0.5, 0.5)));
    scene.addComponent(cmpLightAmbient);

    // setup viewport
    const viewport: ƒ.Viewport = new ƒ.Viewport();
    viewport.initialize("Viewport", scene, camera.getComponent(ƒ.ComponentCamera), canvas);
    viewport.draw();
    console.log(viewport);

    // run loop
    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, () => update(viewport, rotatorX.mtxLocal, rotatorY.mtxLocal));
    ƒ.Loop.start();
  }

  async function loadAnimatedArm(): Promise<ƒ.Node> {
    const loader: ƒ.GLTFLoader = await ƒ.GLTFLoader.LOAD("./animated_arm.gltf");
    const arm: ƒ.Node = await loader.getNode("ArmModel");
    const meshSerialization: ƒ.Serialization = ƒ.Serializer.serialize(arm.getComponent(ƒ.ComponentMesh).mesh);
    console.log(meshSerialization);
    arm.getComponent(ƒ.ComponentMesh).mesh = await ƒ.Serializer.deserialize(meshSerialization) as ƒ.MeshSkin;
    arm.addComponent(new ƒ.ComponentTransform());
    arm.mtxLocal.translateY(-2);
    return arm;
  }

  function update(_viewport: ƒ.Viewport, _mtxRotatorX: ƒ.Matrix4x4, _mtxRotatorY: ƒ.Matrix4x4): void {
    if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_RIGHT])) _mtxRotatorY.rotateY(3);
    if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_UP])) _mtxRotatorX.rotateX(-3);
    if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_LEFT])) _mtxRotatorY.rotateY(-3);
    if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_DOWN])) _mtxRotatorX.rotateX(3);
    if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.SPACE])) {
      _mtxRotatorX.set(ƒ.Matrix4x4.IDENTITY());
      _mtxRotatorY.set(ƒ.Matrix4x4.IDENTITY());
    }
    _viewport.draw();
  }
}