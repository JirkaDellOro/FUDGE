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
    let mtxInner;
    let mtxOuter;
    let cntMouseX = new ƒ.Control("MouseX", speedCameraRotation);
    let cntMouseY = new ƒ.Control("MouseY", speedCameraRotation);
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
        const mtrWhite = new ƒ.Material("White", ƒ.ShaderUniColor, new ƒ.CoatColored(ƒ.Color.CSS("white")));
        const mtrGrey = new ƒ.Material("White", ƒ.ShaderUniColor, new ƒ.CoatColored(ƒ.Color.CSS("slategrey")));
        const inner = new ƒAid.Node("Inner", ƒ.Matrix4x4.IDENTITY(), mtrWhite, new ƒ.MeshPyramid());
        const outer = new ƒAid.Node("Outer", ƒ.Matrix4x4.IDENTITY(), mtrGrey, new ƒ.MeshPyramid());
        const mtxMesh = inner.mtxMeshPivot;
        mtxMesh.rotateX(-90);
        mtxMesh.translateZ(1, false);
        outer.mtxMeshPivot.set(inner.mtxMeshPivot);
        const speaker = new ƒAid.Node("Speaker", ƒ.Matrix4x4.IDENTITY());
        speaker.addChild(inner);
        speaker.addChild(outer);
        speaker.addChild(new ƒAid.NodeCoordinateSystem("SpeakerSystem", ƒ.Matrix4x4.SCALING(ƒ.Vector3.ONE(2))));
        const rotator = new ƒAid.Node("Rotator", ƒ.Matrix4x4.IDENTITY());
        const translator = new ƒAid.Node("Translator", ƒ.Matrix4x4.IDENTITY());
        rotator.addChild(speaker);
        translator.addChild(rotator);
        mtxRotatorX = speaker.mtxLocal;
        mtxRotatorY = rotator.mtxLocal;
        mtxTranslator = translator.mtxLocal;
        mtxInner = inner.mtxLocal;
        mtxOuter = outer.mtxLocal;
        // audio setup
        const audio = new ƒ.Audio("hypnotic.mp3");
        cmpAudio = new ƒ.ComponentAudio(audio, true);
        speaker.addComponent(cmpAudio);
        cmpAudio.setPanner(ƒ.AUDIO_PANNER.CONE_OUTER_ANGLE, 180);
        cmpAudio.setPanner(ƒ.AUDIO_PANNER.CONE_INNER_ANGLE, 30);
        ƒ.Debug.log(cmpAudio.getMutatorOfNode(ƒ.AUDIO_NODE_TYPE.SOURCE));
        ƒ.Debug.log(cmpAudio.getMutatorOfNode(ƒ.AUDIO_NODE_TYPE.PANNER));
        ƒ.Debug.log(cmpAudio.getMutatorOfNode(ƒ.AUDIO_NODE_TYPE.GAIN));
        // camera setup
        const cmpCamera = new ƒ.ComponentCamera();
        camera = new ƒAid.CameraOrbit(cmpCamera, 3, 80, 0.1, 20);
        camera.nodeCamera.addComponent(new ƒ.ComponentAudioListener());
        camera.axisRotateX.addControl(cntMouseY);
        camera.axisRotateY.addControl(cntMouseX);
        // scene setup
        const graph = new ƒ.Node("Graph");
        graph.addChild(new ƒAid.NodeCoordinateSystem());
        graph.addChild(translator);
        graph.addChild(camera);
        const viewport = new ƒ.Viewport();
        const canvas = document.querySelector("canvas");
        viewport.initialize("Viewport", graph, cmpCamera, canvas);
        ƒ.AudioManager.default.listenTo(graph);
        ƒ.AudioManager.default.listenWith(camera.nodeCamera.getComponent(ƒ.ComponentAudioListener));
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
            let panner = cmpAudio.getMutatorOfNode(ƒ.AUDIO_NODE_TYPE.PANNER);
            {
                let sin = Math.sin(Math.PI * panner["coneInnerAngle"] / 360);
                let cos = Math.cos(Math.PI * panner["coneInnerAngle"] / 360);
                mtxInner.set(ƒ.Matrix4x4.IDENTITY());
                mtxInner.scaling = new ƒ.Vector3(2 * sin, 2 * sin, cos);
            }
            {
                let sin = Math.sin(Math.PI * panner["coneOuterAngle"] / 360);
                let cos = Math.cos(Math.PI * panner["coneOuterAngle"] / 360);
                mtxOuter.set(ƒ.Matrix4x4.IDENTITY());
                mtxOuter.scaling = new ƒ.Vector3(2 * sin, 2 * sin, cos);
            }
            // mtxTranslator.translation = position;
            ƒ.AudioManager.default.update();
            viewport.draw();
            // printInfo(mtxBody, mtxCamera);
        }
    }
    function hndPointerMove(_event) {
        if (!_event.buttons)
            return;
        // camera.rotateY(_event.movementX * speedCameraRotation);
        // camera.rotateX(_event.movementY * speedCameraRotation);
        cntMouseX.setInput(_event.movementX);
        cntMouseY.setInput(_event.movementY);
    }
    function hndWheelMove(_event) {
        let panner = cmpAudio.getMutatorOfNode(ƒ.AUDIO_NODE_TYPE.PANNER);
        if (_event.shiftKey || _event.altKey) {
            let inner = panner["coneInnerAngle"] - (_event.altKey ? _event.deltaY / 10 : 0);
            inner = Math.min(360, Math.max(inner, 0));
            cmpAudio.setPanner(ƒ.AUDIO_PANNER.CONE_INNER_ANGLE, inner);
            let outer = panner["coneOuterAngle"] - (_event.shiftKey ? _event.deltaY / 10 : 0);
            outer = Math.min(360, Math.max(inner, outer));
            cmpAudio.setPanner(ƒ.AUDIO_PANNER.CONE_OUTER_ANGLE, outer);
        }
        else
            camera.distance += _event.deltaY * speedCameraTranslation;
    }
    // function printInfo(_mtxBody: ƒ.Matrix4x4, _mtxCamera: ƒ.Matrix4x4): void {
    //   // let posBody: ƒ.Vector3 = _body.mtxLocal.translation;
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
                    mtxRotatorX.set(ƒ.Matrix4x4.IDENTITY());
                    mtxRotatorY.set(ƒ.Matrix4x4.IDENTITY());
                    mtxTranslator.set(ƒ.Matrix4x4.IDENTITY());
                    // parameter.xAmplitude = parameter.zAmplitude = 0;
                    break;
                // case ƒ.KEYBOARD_CODE.PLUS+:
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
//# sourceMappingURL=SpatialSound.js.map