///<reference types="../../../../Core/Build/FudgeCore"/>
///<reference types="../../../../Aid/Build/FudgeAid"/>

namespace MutatorGeneration {
  import f = FudgeCore;
  import fAid = FudgeAid;

  window.addEventListener("load", hndLoad);

  let root: f.Node = new f.Node("Root");
  let particle: f.Node;
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

    // setup particle
    let img: HTMLImageElement = document.querySelector("img");
    let txtImage: f.TextureImage = new f.TextureImage();
    txtImage.image = img;
    let coat: f.CoatTextured = new f.CoatTextured();
    coat.texture = txtImage;
    let material: f.Material = new f.Material("Material", f.ShaderTexture, coat);
    let mesh: f.Mesh = new f.MeshQuad();
    particle = new fAid.Node("Particle", f.Matrix4x4.IDENTITY(), material, mesh);
    root.addChild(particle);

    let storedValues: f.StoredValues = {
      "time": 0,
      "index": 0,
      "size": 1
    };
    let functionData: Data;
    let randomNumbers: number[] = [];

    for (let i: number = 0; i < 1000; i++) {
      randomNumbers.push(Math.random());
    }
    // console.log(particle.getComponent(f.ComponentTransform).getMutator());
    // console.log(particle.getComponent(f.ComponentMaterial).getMutator());

    let importer: ParticleEffectImporter = new ParticleEffectImporter(storedValues, randomNumbers);

    functionData = importer.importFile("data.json");

    f.Loop.addEventListener(f.EVENT.LOOP_FRAME, update);
    // update();
    f.Loop.start(f.LOOP_MODE.TIME_GAME, 30);

    function update(_event: f.Eventƒ = null): void {
      storedValues["time"] = f.Time.game.get() / 1000;
      // particleSystem.updateParticleEffect(time);
      // console.log(particle.getComponent(f.ComponentTransform).getMutator());

      // evalute update storage
      let storage: Data = <Data>functionData["Storage"];
      let update: Data = <Data>storage["update"];
      for (const key in update) {
        storedValues[key] = (<Function>update[key])();
      }

      // evalute closures
      for (const componentKey in functionData) {
        let component: f.Component;
        switch (componentKey) {
          case "ComponentTransform":
            component = particle.getComponent(f.ComponentTransform);
            break;
          case "ComponentMaterial":
            component = particle.getComponent(f.ComponentMaterial);
            break;
          default:
            continue;
        }
        component.mutate(getMutator(<Data>functionData[componentKey]));
      }

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

  function getMutator(_functionData: Data): f.Mutator {
    let mutator: f.Mutator = {};
    for (const attribute in _functionData) {
      let value: Object = <Data>_functionData[attribute];
      if (typeof value === "function") {
        mutator[attribute] = (<Function>value)();
      } else {
        mutator[attribute] = getMutator(<Data>value);
      }
    } 
    return mutator;
  }
}