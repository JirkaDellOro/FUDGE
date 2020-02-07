/// <reference types="../../../Core/Build/FudgeCore"/>
/// <reference types="../../../Aid/Build/FudgeAid"/>
var AudioSpace;
/// <reference types="../../../Core/Build/FudgeCore"/>
/// <reference types="../../../Aid/Build/FudgeAid"/>
(function (AudioSpace) {
    var ƒ = FudgeCore;
    var ƒAid = FudgeAid;
    let out;
    let camera;
    let speedCameraRotation = 0.2;
    let speedCameraTranslation = 0.01;
    let cmpAudio;
    let mtxRotatorX;
    let mtxRotatorY;
    let mtxTranslator;
    // tslint:disable-next-line: typedef
    let parameter = {
        xAmplitude: 0,
        zAmplitude: 0,
        frequency: 1,
        cameraPosition: new ƒ.Vector3(0, 0, 5)
    };
    window.addEventListener("load", init);
    async function init(_event) {
        out = document.querySelector("output");
        const material = new ƒ.Material("Red", ƒ.ShaderUniColor, new ƒ.CoatColored(new ƒ.Color(0, .5, .5, 1)));
        const speaker = new ƒAid.Node("Speaker", ƒ.Matrix4x4.IDENTITY, material, new ƒ.MeshPyramid());
        const mtxMesh = speaker.pivot;
        mtxMesh.rotateX(-90);
        mtxMesh.translateZ(1);
        speaker.appendChild(new ƒAid.NodeCoordinateSystem("SpeakerSystem", ƒ.Matrix4x4.SCALING(ƒ.Vector3.ONE(2))));
        const rotator = new ƒAid.Node("Rotator", ƒ.Matrix4x4.IDENTITY);
        const translator = new ƒAid.Node("Translator", ƒ.Matrix4x4.IDENTITY);
        rotator.appendChild(speaker);
        translator.appendChild(rotator);
        mtxRotatorX = speaker.local;
        mtxRotatorY = rotator.local;
        mtxTranslator = rotator.local;
        ƒ.RenderManager.initialize();
        // audio setup
        const audio = await ƒ.Audio.load("hypnotic.mp3");
        cmpAudio = new ƒ.ComponentAudio(audio, true);
        speaker.addComponent(cmpAudio);
        cmpAudio.setPanner(ƒ.AUDIO_PANNER.CONE_OUTERANGLE, 40);
        cmpAudio.setPanner(ƒ.AUDIO_PANNER.CONE_INNERANGLE, 20);
        // camera setup
        const cmpCamera = new ƒ.ComponentCamera();
        camera = new ƒAid.CameraOrbit(cmpCamera, 3, 80, 0.1, 20);
        camera.node.addComponent(new ƒ.ComponentAudioListener());
        // scene setup
        const branch = new ƒ.Node("Branch");
        branch.appendChild(new ƒAid.NodeCoordinateSystem());
        branch.appendChild(translator);
        branch.appendChild(camera);
        const viewport = new ƒ.Viewport();
        const canvas = document.querySelector("canvas");
        viewport.initialize("Viewport", branch, cmpCamera, canvas);
        ƒ.AudioManager.default.listenTo(branch);
        ƒ.AudioManager.default.listen(camera.node.getComponent(ƒ.ComponentAudioListener));
        // setup event handling
        viewport.setFocus(true);
        viewport.activatePointerEvent("\u0192pointermove" /* MOVE */, true);
        viewport.activateWheelEvent("\u0192wheel" /* WHEEL */, true);
        viewport.addEventListener("\u0192pointermove" /* MOVE */, hndPointerMove);
        viewport.addEventListener("\u0192wheel" /* WHEEL */, hndWheelMove);
        canvas.addEventListener("mousedown", canvas.requestPointerLock);
        canvas.addEventListener("mouseup", () => document.exitPointerLock());
        startInteraction(viewport);
        ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        ƒ.Loop.start();
        function update(_event) {
            // let time: number = performance.now() / 1000;
            // let position: ƒ.Vector3 = mtxTranslator.translation;
            // if (parameter.xAmplitude)
            //   position.x = parameter.xAmplitude * Math.sin(parameter.frequency * time);
            // if (parameter.zAmplitude)
            //   position.z = parameter.zAmplitude * Math.cos(parameter.frequency * time);
            // mtxTranslator.translation = position;
            ƒ.AudioManager.default.update();
            viewport.draw();
            // printInfo(mtxBody, mtxCamera);
        }
    }
    function hndPointerMove(_event) {
        if (!_event.buttons)
            return;
        camera.rotateY(_event.movementX * speedCameraRotation);
        camera.rotateX(_event.movementY * speedCameraRotation);
    }
    function hndWheelMove(_event) {
        camera.distance += _event.deltaY * speedCameraTranslation;
    }
    // function printInfo(_mtxBody: ƒ.Matrix4x4, _mtxCamera: ƒ.Matrix4x4): void {
    //   // let posBody: ƒ.Vector3 = _body.cmpTransform.local.translation;
    //   let info: string = "<fieldset><legend>Info</legend>";
    //   info += `camera [${_mtxCamera.translation.toString()}] `;
    //   info += ` body [${_mtxBody.translation.toString()}]`;
    //   info += `<br/>`;
    //   info += `xAmplitude ${parameter.xAmplitude.toFixed(2)} `;
    //   info += `zAmplitude ${parameter.zAmplitude.toFixed(2)} `;
    //   info += `frequency ${parameter.frequency.toFixed(2)} `;
    //   info += "</fieldset>";
    //   out.innerHTML = info;
    // }
    function startInteraction(_viewport) {
        _viewport.activateKeyboardEvent("\u0192keydown" /* DOWN */, true);
        _viewport.addEventListener("\u0192keydown" /* DOWN */, move);
        function move(_event) {
            mtxTranslator.translateZ(0.1 *
                (_event.code == ƒ.KEYBOARD_CODE.W ? -1 :
                    _event.code == ƒ.KEYBOARD_CODE.S ? 1 :
                        0));
            mtxTranslator.translateX(0.1 *
                (_event.code == ƒ.KEYBOARD_CODE.A ? -1 :
                    _event.code == ƒ.KEYBOARD_CODE.D ? 1 :
                        0));
            mtxTranslator.translateY(0.1 *
                (_event.code == ƒ.KEYBOARD_CODE.X ? -1 :
                    _event.code == ƒ.KEYBOARD_CODE.E ? 1 :
                        0));
            switch (_event.code) {
                case ƒ.KEYBOARD_CODE.SPACE:
                    mtxRotatorX.set(ƒ.Matrix4x4.IDENTITY);
                    mtxRotatorY.set(ƒ.Matrix4x4.IDENTITY);
                    mtxTranslator.set(ƒ.Matrix4x4.IDENTITY);
                    // parameter.xAmplitude = parameter.zAmplitude = 0;
                    break;
                // case ƒ.KEYBOARD_CODE.X:
                //   if (parameter.xAmplitude)
                //     parameter.xAmplitude = 0;
                //   else {
                //     parameter.xAmplitude = mtxRotatorX.translation.x;
                //   }
                //   break;
                // case ƒ.KEYBOARD_CODE.Y:
                //   if (parameter.zAmplitude)
                //     parameter.zAmplitude = 0;
                //   else {
                //     parameter.zAmplitude = mtxRotatorX.translation.z;
                //   }
                //   break;
                case ƒ.KEYBOARD_CODE.ARROW_RIGHT:
                    mtxRotatorY.rotateY(5);
                    break;
                case ƒ.KEYBOARD_CODE.ARROW_LEFT:
                    mtxRotatorY.rotateY(-5);
                    break;
                case ƒ.KEYBOARD_CODE.ARROW_UP:
                    mtxRotatorX.rotateX(-5);
                    break;
                case ƒ.KEYBOARD_CODE.ARROW_DOWN:
                    mtxRotatorX.rotateX(5);
                    break;
                // case ƒ.KEYBOARD_CODE.Q:
                //   // parameter.frequency *= 0.8;
                //   break;
                // case ƒ.KEYBOARD_CODE.E:
                //   // parameter.frequency *= 1 / 0.8;
                //   break;
                // case ƒ.KEYBOARD_CODE.P:
                //   break;
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
})(AudioSpace || (AudioSpace = {}));
//# sourceMappingURL=AudioSpace.js.map