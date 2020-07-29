///<reference types="../../Core/Build/FudgeCore"/>
///<reference types="../../Aid/Build/FudgeAid"/>

namespace ParticleSystemTest {
  import f = FudgeCore;
  import fAid = FudgeAid;

  window.addEventListener("load", hndLoad);

  let root: f.Node = new f.Node("Root");
  let particlesSystem1: f.Node;
  let particlesSystem2: f.Node;
  let viewport: f.Viewport;
  let camera: fAid.CameraOrbit;
  let speedCameraRotation: number = 0.2;
  let speedCameraTranslation: number = 0.02;

  let inputParticleNum1: HTMLInputElement;
  let inputParticleNum2: HTMLInputElement;
  let inputEffectName: HTMLInputElement;

  let cmpParticleSystem1: f.ComponentParticleSystem;
  let cmpParticleSystem2: f.ComponentParticleSystem;

  async function hndLoad(_event: Event): Promise<void> {
    f.RenderManager.initialize(true, false);
    f.RenderManager.setDepthTest(false);
    f.RenderManager.setBlendMode(f.BLEND.PARTICLE);

    inputParticleNum1 = <HTMLInputElement>document.getElementById("particleNum1");
    inputParticleNum2 = <HTMLInputElement>document.getElementById("particleNum2");
    inputEffectName = <HTMLInputElement>document.getElementById("effectName");
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
    particlesSystem1 = new fAid.Node("Particles", f.Matrix4x4.TRANSLATION(new f.Vector3(-1, 0, 0)), material, mesh);
    particlesSystem2 = new fAid.Node("Particles", f.Matrix4x4.TRANSLATION(new f.Vector3(1, 0, 0)), material, mesh);

    particlesSystem1.getComponent(f.ComponentMesh).pivot.scale(new f.Vector3(0.2, 0.2, 0.2));
    particlesSystem1.getComponent(f.ComponentMesh).showToCamera = true;
    particlesSystem1.getComponent(f.ComponentMaterial).clrPrimary = new f.Color(1, 0.5, 0.2);

    particlesSystem2.getComponent(f.ComponentMesh).pivot.scale(new f.Vector3(0.2, 0.2, 0.2));
    // particlesSystem2.getComponent(f.ComponentMesh).showToCamera = true;
    particlesSystem2.getComponent(f.ComponentMaterial).clrPrimary = new f.Color(0.5, 1, 0.2);

    let particleEffect: f.ParticleEffect = new f.ParticleEffect();
    await particleEffect.load(inputEffectName.value);
    console.log(particleEffect);

    cmpParticleSystem1 = new f.ComponentParticleSystem(particleEffect, inputParticleNum1.valueAsNumber);
    cmpParticleSystem2 = new f.ComponentParticleSystem(particleEffect, inputParticleNum2.valueAsNumber);
    particlesSystem1.addComponent(cmpParticleSystem1);
    particlesSystem2.addComponent(cmpParticleSystem2);
    root.addChild(particlesSystem1);
    root.addChild(particlesSystem2);

    // setup input
    let changeSize: (_event: Event) => void = async (_event: Event) => {
      if (cmpParticleSystem1.size != inputParticleNum1.valueAsNumber)
        cmpParticleSystem1.size = inputParticleNum1.valueAsNumber;
      if (cmpParticleSystem2.size != inputParticleNum2.valueAsNumber)
        cmpParticleSystem2.size = inputParticleNum2.valueAsNumber;
    };

    let changeEffect: (_event: Event) => void = async (_event: Event) => {
      let newParticleEffect: f.ParticleEffect = new f.ParticleEffect();
      await newParticleEffect.load(inputEffectName.value);
      console.log(newParticleEffect);

      cmpParticleSystem1.particleEffect = newParticleEffect;
      cmpParticleSystem2.particleEffect = newParticleEffect;
    };

    inputParticleNum1.addEventListener("input", changeSize);
    inputParticleNum2.addEventListener("input", changeSize);
    inputEffectName.addEventListener("keydown", (_event: KeyboardEvent) => {
      if (_event.key == "Enter")
        changeEffect(_event);
    });

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