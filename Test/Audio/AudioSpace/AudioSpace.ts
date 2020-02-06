/// <reference types="../../../Core/Build/FudgeCore"/>
/// <reference types="../../../Aid/Build/FudgeAid"/>

namespace AudioSpace {
  import ƒ = FudgeCore;
  import ƒAid = FudgeAid;
  let out: HTMLOutputElement;

  let camera: ƒAid.CameraOrbit;
  let speedCameraRotation: number = 0.2;
  let speedCameraTranslation: number = 0.01;

  // tslint:disable-next-line: typedef
  let parameter = {
    xAmplitude: 0,
    zAmplitude: 0,
    frequency: 1,
    cameraPosition: new ƒ.Vector3(0, 0, 5)
  };

  let cmpAudio: ƒ.ComponentAudio;

  window.addEventListener("load", init);

  async function init(_event: Event): Promise<void> {
    out = document.querySelector("output");

    let material: ƒ.Material = new ƒ.Material("Red", ƒ.ShaderUniColor, new ƒ.CoatColored(new ƒ.Color(0, .5, .5, 1)));
    const body: ƒAid.NodeGeometry = new ƒAid.NodeGeometry("Body", material, new ƒ.MeshPyramid());
    const mtxBody: ƒ.Matrix4x4 = body.cmpTransform.local;

    ƒ.RenderManager.initialize();

    // audio setup
    let audio: ƒ.Audio = await ƒ.Audio.load("hypnotic.mp3");
    cmpAudio = new ƒ.ComponentAudio(audio, true, true);
    body.addComponent(cmpAudio);

    // camera setup
    let cmpCamera: ƒ.ComponentCamera = new ƒ.ComponentCamera();
    camera = new ƒAid.CameraOrbit(cmpCamera, 1.5, 80, 0.1, 20);
    camera.node.addComponent(new ƒ.ComponentAudioListener());

    // scene setup
    let branch: ƒ.Node = new ƒ.Node("Branch");
    branch.appendChild(new ƒAid.NodeCoordinateSystem());
    branch.appendChild(body);
    branch.appendChild(camera);

    let viewport: ƒ.Viewport = new ƒ.Viewport();
    let canvas: HTMLCanvasElement =  document.querySelector("canvas");
    viewport.initialize("Viewport", branch, cmpCamera, canvas);
    ƒ.AudioManager.default.listenTo(branch);
    ƒ.AudioManager.default.listen(camera.node.getComponent(ƒ.ComponentAudioListener));

    // setup event handling
    viewport.setFocus(true);
    viewport.activatePointerEvent(ƒ.EVENT_POINTER.MOVE, true);
    viewport.activateWheelEvent(ƒ.EVENT_WHEEL.WHEEL, true);
    viewport.addEventListener(ƒ.EVENT_POINTER.MOVE, hndPointerMove);
    viewport.addEventListener(ƒ.EVENT_WHEEL.WHEEL, hndWheelMove);

    canvas.addEventListener("mousedown", canvas.requestPointerLock);
    canvas.addEventListener("mouseup", () => document.exitPointerLock());

    startInteraction(viewport, body);

    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
    ƒ.Loop.start();

    function update(_event: Event): void {
      let time: number = performance.now() / 1000;
      let position: ƒ.Vector3 = mtxBody.translation;

      if (parameter.xAmplitude)
        position.x = parameter.xAmplitude * Math.sin(parameter.frequency * time);
      if (parameter.zAmplitude)
        position.z = parameter.zAmplitude * Math.cos(parameter.frequency * time);

      mtxBody.translation = position;
      ƒ.AudioManager.default.update();
      viewport.draw();
      // printInfo(mtxBody, mtxCamera);
    }
  }

  function hndPointerMove(_event: ƒ.EventPointer): void {
    if (!_event.buttons)
      return;
    camera.rotateY(_event.movementX * speedCameraRotation);
    camera.rotateX(_event.movementY * speedCameraRotation);
  }

  function hndWheelMove(_event: WheelEvent): void {
    camera.distance += _event.deltaY * speedCameraTranslation;
  }

  function printInfo(_mtxBody: ƒ.Matrix4x4, _mtxCamera: ƒ.Matrix4x4): void {
    // let posBody: ƒ.Vector3 = _body.cmpTransform.local.translation;
    let info: string = "<fieldset><legend>Info</legend>";
    info += `camera [${_mtxCamera.translation.toString()}] `;
    info += ` body [${_mtxBody.translation.toString()}]`;
    info += `<br/>`;
    info += `xAmplitude ${parameter.xAmplitude.toFixed(2)} `;
    info += `zAmplitude ${parameter.zAmplitude.toFixed(2)} `;
    info += `frequency ${parameter.frequency.toFixed(2)} `;
    info += "</fieldset>";
    out.innerHTML = info;
  }

  function startInteraction(_viewport: ƒ.Viewport, _body: ƒ.Node): void {
    _viewport.activateKeyboardEvent(ƒ.EVENT_KEYBOARD.DOWN, true);
    _viewport.addEventListener(ƒ.EVENT_KEYBOARD.DOWN, move);

    function move(_event: ƒ.EventKeyboard): void {
      const mtxBody: ƒ.Matrix4x4 = _body.cmpTransform.local;
      let mtxCamera: ƒ.Matrix4x4 = _viewport.camera.getContainer().cmpTransform.local;

      mtxBody.translateZ(0.1 *
        (_event.code == ƒ.KEYBOARD_CODE.W ? -1 :
          _event.code == ƒ.KEYBOARD_CODE.S ? 1 :
            0));
      mtxBody.translateX(0.1 *
        (_event.code == ƒ.KEYBOARD_CODE.A ? -1 :
          _event.code == ƒ.KEYBOARD_CODE.D ? 1 :
            0));

      switch (_event.code) {
        case ƒ.KEYBOARD_CODE.SPACE:
          mtxBody.set(ƒ.Matrix4x4.IDENTITY);
          parameter.xAmplitude = parameter.zAmplitude = 0;
          break;
        case ƒ.KEYBOARD_CODE.X:
          if (parameter.xAmplitude)
            parameter.xAmplitude = 0;
          else {
            parameter.xAmplitude = mtxBody.translation.x;
          }
          break;
        case ƒ.KEYBOARD_CODE.Y:
          if (parameter.zAmplitude)
            parameter.zAmplitude = 0;
          else {
            parameter.zAmplitude = mtxBody.translation.z;
          }
          break;
        case ƒ.KEYBOARD_CODE.PAGE_UP:
          mtxCamera.translateY(0.2);
          break;
        case ƒ.KEYBOARD_CODE.PAGE_DOWN:
          mtxCamera.translateY(-0.2);
          break;
        case ƒ.KEYBOARD_CODE.ARROW_RIGHT:
          mtxCamera.translateX(0.2);
          break;
        case ƒ.KEYBOARD_CODE.ARROW_UP:
          mtxCamera.translateZ(-0.2);
          break;
        case ƒ.KEYBOARD_CODE.ARROW_DOWN:
          mtxCamera.translateZ(0.2);
          break;
        case ƒ.KEYBOARD_CODE.ARROW_LEFT:
          mtxCamera.translateX(-0.2);
          break;
        case ƒ.KEYBOARD_CODE.Q:
          parameter.frequency *= 0.8;
          break;
        case ƒ.KEYBOARD_CODE.E:
          parameter.frequency *= 1 / 0.8;
          break;
        case ƒ.KEYBOARD_CODE.P:

          break;
        case ƒ.KEYBOARD_CODE.ENTER:
          //play Sound
          console.log("Play Audio");
          if (cmpAudio.isPlaying)
            cmpAudio.play(false);
          else
            cmpAudio.play(true);
          break;
      }
    }
  }
}