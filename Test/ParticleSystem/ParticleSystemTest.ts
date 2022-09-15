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

  let inputParticleNum1: HTMLInputElement;
  let inputParticleNum2: HTMLInputElement;
  let inputEffectName: HTMLInputElement;

  let cmpParticleSystem1: f.ComponentParticleSystem;
  let cmpParticleSystem2: f.ComponentParticleSystem;

  async function hndLoad(_event: Event): Promise<void> {
    f.Render.initialize(true, false);
    f.Render.setDepthTest(false);
    f.Render.setBlendMode(f.BLEND.PARTICLE);

    inputParticleNum1 = <HTMLInputElement>document.getElementById("particleNum1");
    inputParticleNum2 = <HTMLInputElement>document.getElementById("particleNum2");
    inputEffectName = <HTMLInputElement>document.getElementById("effectName");
    const canvas: HTMLCanvasElement = document.querySelector("canvas");
    f.Debug.log("Canvas", canvas);
    f.Debug.setFilter(f.DebugConsole, f.DEBUG_FILTER.ERROR);

    canvas.addEventListener("mousedown", canvas.requestPointerLock);
    canvas.addEventListener("mouseup", () => document.exitPointerLock());

    // setup viewport
    viewport = new f.Viewport();
    viewport.initialize("Viewport", root, new f.ComponentCamera(), canvas);
    f.Debug.log("Viewport", viewport);
    fAid.Viewport.expandCameraToInteractiveOrbit(viewport);

    // setup particles
    let txtImage: f.TextureImage = new f.TextureImage("particle.png");
    let coat: f.CoatTextured = new f.CoatTextured();
    coat.texture = txtImage;

    let material: f.Material = new f.Material("Material", f.ShaderLitTextured, coat);
    // let material: ƒ.Material = new ƒ.Material("Material", ƒ.ShaderUniColor, new ƒ.CoatColored(ƒ.Color.CSS("WHITE")));
    let mesh: f.Mesh = new f.MeshQuad();
    particlesSystem1 = new fAid.Node("Particles", f.Matrix4x4.TRANSLATION(new f.Vector3(-1, 0, 0)), material, mesh);
    particlesSystem2 = new fAid.Node("Particles", f.Matrix4x4.TRANSLATION(new f.Vector3(1, 0, 0)), material, mesh);

    particlesSystem1.getComponent(f.ComponentMesh).mtxPivot.scale(new f.Vector3(0.2, 0.2, 0.2));
    particlesSystem1.getComponent(f.ComponentMesh).showToCamera = true;
    particlesSystem1.getComponent(f.ComponentMaterial).clrPrimary = new f.Color(1, 0.5, 0.2);

    particlesSystem2.getComponent(f.ComponentMesh).mtxPivot.scale(new f.Vector3(0.2, 0.2, 0.2));
    // particlesSystem2.getComponent(f.ComponentMesh).showToCamera = true;
    particlesSystem2.getComponent(f.ComponentMaterial).clrPrimary = new f.Color(0.5, 1, 0.2);

    let particleSystem: f.ParticleSystem = new f.ParticleSystem();
    await particleSystem.load(inputEffectName.value);
    console.log(particleSystem);

    cmpParticleSystem1 = new f.ComponentParticleSystem(particleSystem, inputParticleNum1.valueAsNumber);
    cmpParticleSystem2 = new f.ComponentParticleSystem(particleSystem, inputParticleNum2.valueAsNumber);
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
      let newParticleEffect: f.ParticleSystem = new f.ParticleSystem();
      await newParticleEffect.load(inputEffectName.value);
      console.log(newParticleEffect);

      cmpParticleSystem1.particleSystem = newParticleEffect;
      cmpParticleSystem2.particleSystem = newParticleEffect;
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
}