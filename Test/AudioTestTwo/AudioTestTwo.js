/// <reference types="../../Core/Build/FudgeCore"/>
var AudioTest;
/// <reference types="../../Core/Build/FudgeCore"/>
(function (AudioTest) {
    var ƒ = FudgeCore;
    let out;
    // tslint:disable-next-line: typedef
    let parameter = {
        xAmplitude: 0,
        zAmplitude: 0,
        frequency: 1,
        cameraPosition: new ƒ.Vector3(0, 0, 5)
    };
    let audioSettings;
    let componentAudio;
    let componentAudioListener;
    window.addEventListener("load", init);
    function init(_event) {
        out = document.querySelector("output");
        let material = new ƒ.Material("Red", ƒ.ShaderUniColor, new ƒ.CoatColored(new ƒ.Color(0, .5, .5, 1)));
        const body = Scenes.createCompleteMeshNode("Body", material, new ƒ.MeshCube());
        const mtxBody = body.cmpTransform.local;
        ƒ.RenderManager.initialize();
        // #region Audio Setup
        let audio;
        let audioLocalisation;
        let audioSource = "hypnotic.mp3";
        audioSettings = new ƒ.AudioSettings();
        audio = new ƒ.Audio(audioSettings, audioSource, .5, true);
        componentAudio = new ƒ.ComponentAudio(audio);
        audioLocalisation = new ƒ.AudioLocalisation(audioSettings);
        componentAudio.setLocalisation(audioLocalisation);
        body.addComponent(componentAudio);
        // #endregion
        // camera setup
        let camera = new ƒ.Node("Camera");
        let cmpCamera = new ƒ.ComponentCamera();
        componentAudioListener = new ƒ.ComponentAudioListener(audioSettings);
        let mtxCamera = ƒ.Matrix4x4.TRANSLATION(parameter.cameraPosition);
        mtxCamera.lookAt(ƒ.Vector3.ZERO());
        camera.addComponent(cmpCamera);
        camera.addComponent(new ƒ.ComponentTransform(mtxCamera));
        camera.addComponent(componentAudioListener);
        // scene setup
        let branch = new ƒ.Node("Branch");
        branch.appendChild(Scenes.createCoordinateSystem());
        branch.appendChild(body);
        branch.appendChild(camera);
        let viewport = new ƒ.Viewport();
        viewport.initialize("Viewport", branch, cmpCamera, document.querySelector("canvas"));
        viewport.setFocus(true);
        startInteraction(viewport, body);
        ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        ƒ.Loop.start();
        function update(_event) {
            let time = performance.now() / 1000;
            let position = mtxBody.translation;
            if (parameter.xAmplitude)
                position.x = parameter.xAmplitude * Math.sin(parameter.frequency * time);
            if (parameter.zAmplitude)
                position.z = parameter.zAmplitude * Math.cos(parameter.frequency * time);
            mtxBody.translation = position;
            componentAudioListener.updatePositions(mtxCamera.translation);
            mtxCamera.lookAt(ƒ.Vector3.ZERO());
            componentAudio.getLocalisation().updatePositions(mtxBody.translation, mtxCamera.translation);
            ƒ.RenderManager.update();
            viewport.draw();
            printInfo(mtxBody, mtxCamera);
        }
    }
    function printInfo(_mtxBody, _mtxCamera) {
        // let posBody: ƒ.Vector3 = _body.cmpTransform.local.translation;
        let info = "<fieldset><legend>Info</legend>";
        info += `camera [${_mtxCamera.translation.toString()}] `;
        info += ` body [${_mtxBody.translation.toString()}]`;
        info += `<br/>`;
        info += `xAmplitude ${parameter.xAmplitude.toFixed(2)} `;
        info += `zAmplitude ${parameter.zAmplitude.toFixed(2)} `;
        info += `frequency ${parameter.frequency.toFixed(2)} `;
        info += "</fieldset>";
        out.innerHTML = info;
    }
    function startInteraction(_viewport, _body) {
        _viewport.activateKeyboardEvent("\u0192keydown" /* DOWN */, true);
        _viewport.addEventListener("\u0192keydown" /* DOWN */, move);
        function move(_event) {
            const mtxBody = _body.cmpTransform.local;
            let mtxCamera = _viewport.camera.getContainer().cmpTransform.local;
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
                        componentAudio.stop();
                    else
                        componentAudio.playAudio(audioSettings, 0);
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
})(AudioTest || (AudioTest = {}));
//# sourceMappingURL=AudioTestTwo.js.map