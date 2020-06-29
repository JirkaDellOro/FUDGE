///<reference types="../../Core/Build/FudgeCore"/>
///<reference types="../../Aid/Build/FudgeAid"/>

namespace ParticleSystemTest {
  import f = FudgeCore;
  import fAid = FudgeAid;

  window.addEventListener("load", hndLoad);

  let root: f.Node = new f.Node("Root");
  let particles: f.Node;
  let viewport: f.Viewport;
  let camera: fAid.CameraOrbit;
  let speedCameraRotation: number = 0.2;
  let speedCameraTranslation: number = 0.02;

  let input: HTMLInputElement;

  let particleSystem: f.ComponentParticleSystem;

  function hndLoad(_event: Event): void {
    f.RenderManager.initialize(true, false);
    f.RenderManager.setDepthTest(false);
    f.RenderManager.setBlendMode(f.BLEND.PARTICLE);

    input = <HTMLInputElement>document.getElementById("particleNum");
    const canvas: HTMLCanvasElement = document.querySelector("canvas");
    f.Debug.log("Canvas", canvas);
    f.Debug.setFilter(f.DebugConsole, f.DEBUG_FILTER.ERROR);

    // enable unlimited mouse-movement (user needs to click on canvas first)
    canvas.addEventListener("mousedown", canvas.requestPointerLock);
    canvas.addEventListener("mouseup", () => document.exitPointerLock());

    // setup orbiting camera
    camera = new fAid.CameraOrbit(new f.ComponentCamera(), 4);
    camera.component.backgroundColor = f.Color.CSS("black");
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

    let material: f.Material = new f.Material("Material", f.ShaderTexture, coat);
    // let material: ƒ.Material = new ƒ.Material("Material", ƒ.ShaderUniColor, new ƒ.CoatColored(ƒ.Color.CSS("WHITE")));
    let mesh: f.Mesh = new f.MeshQuad();
    particles = new fAid.Node("Particles", f.Matrix4x4.TRANSLATION(new f.Vector3(0, 1, 0)), material, mesh);
    
    // particles.getComponent(f.ComponentMesh).pivot.translate(new f.Vector3(1, 0, 0));
    particles.getComponent(f.ComponentMesh).pivot.scale(new f.Vector3(0.1, 0.1, 0.1));
    particles.getComponent(f.ComponentMaterial).clrPrimary = new f.Color(1, 0.2, 0.2);

    let particleEffect: f.ParticleEffect = new f.ParticleEffect("data.json", input.valueAsNumber);

    particleSystem = new f.ComponentParticleSystem(particleEffect);
    particles.addComponent(particleSystem);
    root.addChild(particles);

    // setup input
    input.addEventListener("input", (_event: Event) => {
      let newParticleEffect: f.ParticleEffect = new f.ParticleEffect("data.json", input.valueAsNumber);
      let newParticleSystem: f.ComponentParticleSystem = new f.ComponentParticleSystem(newParticleEffect);
      particles.removeComponent(particleSystem);
      particles.addComponent(newParticleSystem);
      particleSystem = newParticleSystem;
    });

    input.dispatchEvent(new Event("input"));

    f.Loop.addEventListener(f.EVENT.LOOP_FRAME, update);
    f.Loop.start(f.LOOP_MODE.TIME_GAME, 30);

    function update(_event: f.Eventƒ): void {
      // console.log(particles.getComponent(f.ComponentTransform).local);
      viewport.draw();
    }

  }

  function hndPointerMove(_event: PointerEvent): void {
    if (!_event.buttons)
      return;
    camera.rotateY(_event.movementX * speedCameraRotation);
    camera.rotateX(_event.movementY * speedCameraRotation);
  }

  function hndWheelMove(_event: WheelEvent): void {
    camera.distance = camera.distance + _event.deltaY * speedCameraTranslation;
  }
}