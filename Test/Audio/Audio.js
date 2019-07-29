var AudioTest;
(function (AudioTest) {
    var ƒ = Fudge;
    let out;
    // tslint:disable-next-line: typedef
    let parameter = {
        xAmplitude: 0,
        zAmplitude: 0,
        frequency: 1,
        cameraPosition: new ƒ.Vector3(0, 0, 5)
    };
    window.addEventListener("load", init);
    function init(_event) {
        out = document.querySelector("output");
        let material = new ƒ.Material("Red", ƒ.ShaderUniColor, new ƒ.CoatColored(new ƒ.Color(1, 1, 1, 1)));
        const body = Scenes.createCompleteMeshNode("Body", material, new ƒ.MeshCube());
        const mtxBody = body.cmpTransform.local;
        /* So sollte die Einbindung der Audio Componente aussehen
        let audioAsset: ƒ.AudioAsset = new ƒ.AudioAsset(filename); // <- wobei diese Zeile vollständig geraten ist, aber so ähnlich wird es wohl werden
        let cmpAudio: ƒ.ComponentAudio = new ƒ.ComponentAudio(audioAsset, ...);
        body.appendChild(cmpAudio);
        */
        let branch = new ƒ.Node("Branch");
        branch.appendChild(body);
        branch.appendChild(Scenes.createCoordinateSystem());
        ƒ.RenderManager.initialize();
        ƒ.RenderManager.addBranch(branch);
        ƒ.RenderManager.update();
        let viewport = new ƒ.Viewport();
        let camera = Scenes.createCamera(parameter.cameraPosition, ƒ.Vector3.ZERO());
        viewport.initialize("Viewport", branch, camera.getComponent(ƒ.ComponentCamera), document.querySelector("canvas"));
        startInteraction(viewport, body);
        viewport.setFocus(true);
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
            ƒ.RenderManager.update();
            // let ctxCamera: ƒ.Matrix4x4 = viewport.camera.getContainer().cmpTransform.local;
            // ctxCamera.lookAt(position);
            viewport.draw();
            printInfo(body, viewport.camera.getContainer());
        }
    }
    function printInfo(_body, _camera) {
        let posBody = _body.cmpTransform.local.translation;
        let posCamera = _camera.cmpTransform.local.translation;
        let info = "<fieldset><legend>Info</legend>";
        info += `camera [${posCamera.x.toFixed(2)} |${posCamera.y.toFixed(2)} |${posCamera.z.toFixed(2)}] `;
        info += ` body [${posBody.x.toFixed(2)} |${posBody.y.toFixed(2)} |${posBody.z.toFixed(2)}]`;
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
                case ƒ.KEYBOARD_CODE.PAGE_UP:
                    mtxCamera.translateY(0.2);
                    break;
                case ƒ.KEYBOARD_CODE.PAGE_DOWN:
                    mtxCamera.translateY(-0.2);
                    break;
                case ƒ.KEYBOARD_CODE.Q:
                    parameter.frequency *= 0.8;
                    break;
                case ƒ.KEYBOARD_CODE.E:
                    parameter.frequency *= 1 / 0.8;
                    break;
            }
        }
    }
})(AudioTest || (AudioTest = {}));
//# sourceMappingURL=Audio.js.map