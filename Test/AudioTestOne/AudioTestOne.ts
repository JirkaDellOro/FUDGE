/// <reference types="../../Core/Build/FudgeCore"/>
namespace AudioTest {
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

  let componentAudioOne: ƒ.ComponentAudio;
  let audioFileOne: string = "Beep.mp3";
  let audioOne: ƒ.Audio;
  let filterOne: ƒ.AudioFilter;
  let delayOne: ƒ.AudioDelay;

  let componentAudioTwo: ƒ.ComponentAudio;
  let audioFileTwo: string = "Baby.mp3";
  let audioTwo: ƒ.Audio;
  let filterTwo: ƒ.AudioFilter;
  let delayTwo: ƒ.AudioDelay;

  window.addEventListener("load", init);

  function init(_event: Event): void {
    document.addEventListener("click", start);
  }
  function start(): void {
    document.removeEventListener("click", start);
    out = document.querySelector("output");

    let material: ƒ.Material = new ƒ.Material("Red", ƒ.ShaderUniColor, new ƒ.CoatColored(new ƒ.Color(0, .5, .5, 1)));
    const body: ƒ.Node = Scenes.createCompleteMeshNode("Body", material, new ƒ.MeshCube());
    const mtxBody: ƒ.Matrix4x4 = body.cmpTransform.local;


    // #region Audio Setup
    /*
    * Einbindung der Audio Component
    * 1. AudioSettings anlegen 
    * 2. ComponentAudio anlegen mit Audio
    * 3. Sound Layer hinzufügen (Filter, Delay)
    * 4. ComponentAudio zur Node hinzufügen
    */

    audioSettings = new ƒ.AudioSettings();

    //Press P-Key for this sound
    audioOne = new ƒ.Audio(audioSettings, audioFileOne, 1, false);
    componentAudioOne = new ƒ.ComponentAudio(audioOne);
    filterOne = new ƒ.AudioFilter(audioSettings, "highpass", 100, 100, 1);
    componentAudioOne.setFilter(filterOne);
    delayOne = new ƒ.AudioDelay(audioSettings, .5);
    componentAudioOne.setDelay(delayOne);
    body.addComponent(componentAudioOne);

    //Press M-Key for this sound
    audioTwo = new ƒ.Audio(audioSettings, audioFileTwo, 0.5, false);
    componentAudioTwo = new ƒ.ComponentAudio(audioTwo);
    filterTwo = new ƒ.AudioFilter(audioSettings, "lowpass", 10, 100, 1);
    componentAudioTwo.setFilter(filterTwo);
    delayTwo = new ƒ.AudioDelay(audioSettings, 1);
    componentAudioTwo.setDelay(delayTwo);
    body.addComponent(componentAudioTwo);

    // #endregion

    let branch: ƒ.Node = new ƒ.Node("Branch");
    branch.appendChild(body);
    branch.appendChild(Scenes.createCoordinateSystem());

    ƒ.RenderManager.initialize();
    ƒ.RenderManager.addBranch(branch);
    ƒ.RenderManager.update();

    let viewport: ƒ.Viewport = new ƒ.Viewport();
    let camera: ƒ.ComponentCamera = Scenes.createCamera(parameter.cameraPosition, ƒ.Vector3.ZERO());
    viewport.initialize("Viewport", branch, camera, document.querySelector("canvas"));


    startInteraction(viewport, body);
    viewport.setFocus(true);

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


      ƒ.RenderManager.update();
      viewport.draw();
      printInfo(body, viewport.camera.getContainer());
    }
  }

  function printInfo(_body: ƒ.Node, _camera: ƒ.Node): void {
    let posBody: ƒ.Vector3 = _body.cmpTransform.local.translation;
    //let posCamera: ƒ.Vector3 = _camera.cmpTransform.local.translation;
    let info: string = "<fieldset><legend>Info</legend>";
    //info += `camera [${posCamera.x.toFixed(2)} |${posCamera.y.toFixed(2)} |${posCamera.z.toFixed(2)}] `;
    info += ` body [${posBody.x.toFixed(2)} |${posBody.y.toFixed(2)} |${posBody.z.toFixed(2)}]`;
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
      // let mtxCamera: ƒ.Matrix4x4 = _viewport.camera.getContainer().cmpTransform.local;

      mtxBody.translateZ(0.1 *
        (_event.code == ƒ.KEYBOARD_CODE.ARROW_UP || _event.code == ƒ.KEYBOARD_CODE.W ? -1 :
          _event.code == ƒ.KEYBOARD_CODE.ARROW_DOWN || _event.code == ƒ.KEYBOARD_CODE.S ? 1 :
            0));
      mtxBody.translateX(0.1 *
        (_event.code == ƒ.KEYBOARD_CODE.ARROW_LEFT || _event.code == ƒ.KEYBOARD_CODE.A ? -1 :
          _event.code == ƒ.KEYBOARD_CODE.ARROW_RIGHT || _event.code == ƒ.KEYBOARD_CODE.D ? 1 :
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
        // case ƒ.KEYBOARD_CODE.PAGE_UP:
        //     mtxCamera.translateY(0.2);
        //     break;
        // case ƒ.KEYBOARD_CODE.PAGE_DOWN:
        //     mtxCamera.translateY(-0.2);
        //     break;
        // case ƒ.KEYBOARD_CODE.NUMPAD_ADD:
        //     mtxCamera.translateX(0.2);
        //     break;
        // case ƒ.KEYBOARD_CODE.NUMPAD_SUBTRACT:
        //     mtxCamera.translateX(-0.2);
        //     break;
        case ƒ.KEYBOARD_CODE.Q:
          parameter.frequency *= 0.8;
          break;
        case ƒ.KEYBOARD_CODE.E:
          parameter.frequency *= 1 / 0.8;
          break;
        case ƒ.KEYBOARD_CODE.P:
          //play Sound
          console.log("pressed p - beep");
          componentAudioOne.playAudio(audioSettings);
          break;
        case ƒ.KEYBOARD_CODE.M:
          //play Sound
          console.log("pressed m - baby");
          componentAudioTwo.playAudio(audioSettings, 0, 3);
          break;
        case ƒ.KEYBOARD_CODE.L:
          //play Sound
          console.log("pressed l");
          // Look at Data Array
          audioSettings.getAudioSession().showDataInArray();
          break;
        case ƒ.KEYBOARD_CODE.I:
          console.log("pressed l");
          break;
      }
    }
  }
}