/// <reference types="../../../Core/Build/FudgeCore"/>
namespace AudioSpace {
  import ƒ = FudgeCore;
  let out: HTMLOutputElement;

  // tslint:disable-next-line: typedef
  let parameter = {
    xAmplitude: 0,
    zAmplitude: 0,
    frequency: 1,
    cameraPosition: new ƒ.Vector3(0, 0, 5)
  };

  let audioSettings: ƒ.AudioSettings;
  let componentAudio: ƒ.ComponentAudio;
  let componentAudioListener: ƒ.ComponentAudioListener;

  window.addEventListener("load", init);

  async function init(_event: Event): Promise<void> {
    out = document.querySelector("output");

    let material: ƒ.Material = new ƒ.Material("Red", ƒ.ShaderUniColor, new ƒ.CoatColored(new ƒ.Color(0, .5, .5, 1)));
    const body: ƒ.Node = Scenes.createCompleteMeshNode("Body", material, new ƒ.MeshCube());
    const mtxBody: ƒ.Matrix4x4 = body.cmpTransform.local;

    ƒ.RenderManager.initialize();

    // #region Audio Setup
    let audio: ƒ.Audio = await ƒ.Audio.load("hypnotic.mp3");
    componentAudio = new ƒ.ComponentAudio(audio, true, true);
    body.addComponent(componentAudio);
    // #endregion


    // camera setup
    let camera: ƒ.Node = new ƒ.Node("Camera");
    let cmpCamera: ƒ.ComponentCamera = new ƒ.ComponentCamera();
    // componentAudioListener = new ƒ.ComponentAudioListener(audioSettings);
    let mtxCamera: ƒ.Matrix4x4 = ƒ.Matrix4x4.TRANSLATION(parameter.cameraPosition);
    mtxCamera.lookAt(ƒ.Vector3.ZERO());
    camera.addComponent(cmpCamera);
    camera.addComponent(new ƒ.ComponentTransform(mtxCamera));
    // camera.addComponent(componentAudioListener);

    // scene setup
    let branch: ƒ.Node = new ƒ.Node("Branch");
    branch.appendChild(Scenes.createCoordinateSystem());
    branch.appendChild(body);
    branch.appendChild(camera);

    let viewport: ƒ.Viewport = new ƒ.Viewport();
    viewport.initialize("Viewport", branch, cmpCamera, document.querySelector("canvas"));
    ƒ.AudioManager.default.listenTo(branch);

    viewport.setFocus(true);
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

      // componentAudioListener.updatePositions(mtxCamera.translation);
      mtxCamera.lookAt(ƒ.Vector3.ZERO());
      ƒ.AudioManager.default.update();
      // componentAudio.getLocalisation().updatePositions(mtxBody.translation, mtxCamera.translation);


      // ƒ.RenderManager.update();
      viewport.draw();
      printInfo(mtxBody, mtxCamera);
    }
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
          if (componentAudio.isPlaying)
            componentAudio.play(false);
          else
            componentAudio.play(true);
          break;
        case ƒ.KEYBOARD_CODE.L:
          //play Sound
          console.log("pressed l");
          // Look at Data Array
          audioSettings.getAudioSession().showDataInArray();
          break;
        case ƒ.KEYBOARD_CODE.I:
          console.log("pressed i");
          // Look at Postions of Listener and Panner
          componentAudioListener.showListenerSettings();
          break;
      }
    }
  }
}