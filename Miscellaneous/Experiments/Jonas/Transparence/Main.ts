///<reference types="../../../../Core/Build/FudgeCore"/>
///<reference types="../../../../Aid/Build/FudgeAid"/>

namespace Transparence {
  export import f = FudgeCore;
  export import fAid = FudgeAid;

  window.addEventListener("load", hndLoad);

  let root: f.Node = new f.Node("Root");
  let viewport: f.Viewport;
  let camera: fAid.CameraOrbit;
  let speedCameraRotation: number = 0.2;
  let speedCameraTranslation: number = 0.02;

  function hndLoad(_event: Event): void {
    f.RenderManager.initialize(true, false);
    f.RenderManager.setDepthTest(false);
    f.RenderManager.setBlendMode(f.BLEND.PARTICLE);
    
    const canvas: HTMLCanvasElement = document.querySelector("canvas");
    f.Debug.log("Canvas", canvas);
    f.Debug.setFilter(f.DebugConsole, f.DEBUG_FILTER.NONE);

    // enable unlimited mouse-movement (user needs to click on canvas first)
    canvas.addEventListener("mousedown", canvas.requestPointerLock);
    canvas.addEventListener("mouseup", () => document.exitPointerLock());

    fAid.addStandardLightComponents(root);

    // setup orbiting camera
    camera = new fAid.CameraOrbit(new f.ComponentCamera(), 4);
    camera.component.backgroundColor = ƒ.Color.CSS("black");
    root.addChild(camera);

    // setup coordinate axes
    let coordinateSystem: fAid.NodeCoordinateSystem = new fAid.NodeCoordinateSystem("Coordinates", f.Matrix4x4.SCALING(new f.Vector3(1, 1, 1)));
    root.addChild(coordinateSystem);

    // setup viewport
    viewport = new f.Viewport();
    viewport.initialize("Viewport", root, camera.component, canvas);
    f.Debug.log("Viewport", viewport);

    // setup event handling
    viewport.activatePointerEvent(f.EVENT_POINTER.MOVE, true);
    viewport.activateWheelEvent(f.EVENT_WHEEL.WHEEL, true);
    viewport.addEventListener(f.EVENT_POINTER.MOVE, hndPointerMove);
    viewport.addEventListener(f.EVENT_WHEEL.WHEEL, hndWheelMove);

    // setup particles
    let img: HTMLImageElement = document.querySelector("img");
    let txtImage: f.TextureImage = new f.TextureImage();
    txtImage.image = img;
    let coat: f.CoatTextured = new f.CoatTextured();
    coat.texture = txtImage;

    // TODO: Relevant part is here
    let mesh: f.Mesh = new f.MeshQuad();
    // let material: f.Material = new f.Material("Material", f.ShaderUniColor, new f.CoatColored(f.Color.CSS("WHITE")));
    // let material: f.Material = new f.Material("Material", f.ShaderFlat, new f.CoatColored(f.Color.CSS("WHITE")));
    let material: f.Material = new f.Material("Material", f.ShaderTexture, coat);

    let back: f.Node = new fAid.Node("back", f.Matrix4x4.TRANSLATION(new f.Vector3(0, 0.5, -1)), material, mesh);
    back.getComponent(f.ComponentMaterial).clrPrimary = f.Color.CSS("orangered", 1);
    let middle: f.Node = new fAid.Node("middle", f.Matrix4x4.TRANSLATION(f.Vector3.Z(0)), material, mesh);
    middle.getComponent(f.ComponentMaterial).clrPrimary = f.Color.CSS("orangered", 1); // only middle is set to be transparent
    let front: f.Node = new fAid.Node("front", f.Matrix4x4.TRANSLATION(new f.Vector3(0.5, 0, 1)), material, mesh);
    front.getComponent(f.ComponentMaterial).clrPrimary = f.Color.CSS("orangered", 1);

    let quads: f.Node = new f.Node("quads");
    root.addChild(quads);
    quads.addChild(back);
    quads.addChild(middle);
    quads.addChild(front);

    f.Loop.addEventListener(f.EVENT.LOOP_FRAME, update);
    f.Loop.start(f.LOOP_MODE.TIME_GAME, 30);

    function update(_event: f.Eventƒ): void {
      try {
        let mtxCamera: f.Matrix4x4 = f.Matrix4x4.MULTIPLICATION(camera.component.getContainer().mtxWorld, camera.component.pivot);
        for (let quad of root.getChildrenByName("quads")[0].getChildren()) {
          // quad.mtxLocal.lookAt(mtxCamera.translation); //, f.Vector3.Y());
          quad.mtxLocal.showTo(mtxCamera.translation); //, f.Vector3.Y());
        }
      } catch (_error) {
        ƒ.Debug.warn(_error);
      }
      viewport.draw();
    }

  }

  function hndPointerMove(_event: f.EventPointer): void {
    if (!_event.buttons)
      return;
    camera.rotateY(_event.movementX * speedCameraRotation);
    camera.rotateX(_event.movementY * speedCameraRotation);

  }

  function hndWheelMove(_event: WheelEvent): void {
    camera.distance = camera.distance + _event.deltaY * speedCameraTranslation;
  }
}