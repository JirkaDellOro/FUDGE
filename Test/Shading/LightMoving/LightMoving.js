var TextureTest;
(function (TextureTest) {
    var ƒ = Fudge;
    window.addEventListener("load", init);
    function init(_event) {
        let coatRed = new ƒ.CoatColored(new ƒ.Color(1, 0, 0, 1));
        let material = new ƒ.Material("Red", ƒ.ShaderFlat, coatRed);
        let body = Scenes.createCompleteMeshNode("Body", material, new ƒ.MeshPyramid());
        body.cmpTransform.translate(0, 0, 0);
        body.cmpTransform.scale(0.8, 0.8, 0.8);
        let lights = new ƒ.Node("Lights");
        lights.addComponent(new ƒ.ComponentTransform());
        let cmpLightAmbient = new ƒ.ComponentLight(new ƒ.LightAmbient(new ƒ.Color(.1, .0, .0, 1)));
        lights.addComponent(cmpLightAmbient);
        let cmpLightDirectionalRed = new ƒ.ComponentLight(new ƒ.LightDirectional(new ƒ.Color(1, 0, 0, 1), new ƒ.Vector3(1, 0.2, 0)));
        lights.addComponent(cmpLightDirectionalRed);
        let cmpLightDirectionalGreen = new ƒ.ComponentLight(new ƒ.LightDirectional(new ƒ.Color(0, 1, 0, 1), new ƒ.Vector3(-1, 0.2, -1)));
        lights.addComponent(cmpLightDirectionalGreen);
        let cmpLightDirectionalBlue = new ƒ.ComponentLight(new ƒ.LightDirectional(new ƒ.Color(0, 0, 1, 1), new ƒ.Vector3(0, 0.2, 1)));
        lights.addComponent(cmpLightDirectionalBlue);
        let branch = new ƒ.Node("Branch");
        branch.appendChild(body);
        branch.appendChild(Scenes.createCoordinateSystem());
        branch.appendChild(lights);
        ƒ.RenderManager.initialize();
        ƒ.RenderManager.addBranch(branch);
        ƒ.RenderManager.update();
        let viewport = new ƒ.Viewport();
        let camera = Scenes.createCamera(new ƒ.Vector3(1.5, 1.5, 1.5), new ƒ.Vector3(0, 0, 0));
        viewport.initialize("Viewport", branch, camera.getComponent(ƒ.ComponentCamera), document.querySelector("canvas"));
        dollyViewportCamera(viewport);
        viewport.setFocus(true);
        viewport.draw();
        //*/
        window.setInterval(function () {
            // body.cmpTransform.rotateY(-1.1);
            lights.cmpTransform.rotateY(-1);
            // body.cmpTransform.rotateZ(-0.9);
            ƒ.RenderManager.update();
            viewport.draw();
        }, 20);
        //*/
    }
    function dollyViewportCamera(_viewport) {
        _viewport.activateKeyboardEvent("\u0192keydown" /* DOWN */, true);
        _viewport.addEventListener("\u0192keydown" /* DOWN */, rotate);
        function rotate(_event) {
            let cmpCameraTransform = _viewport.camera.getContainer().cmpTransform;
            cmpCameraTransform.translateY(0.1 *
                (_event.code == ƒ.KEYBOARD_CODE.ARROW_UP || _event.code == ƒ.KEYBOARD_CODE.W ? 1 :
                    _event.code == ƒ.KEYBOARD_CODE.ARROW_DOWN || _event.code == ƒ.KEYBOARD_CODE.S ? -1 :
                        0));
            cmpCameraTransform.translateX(0.1 *
                (_event.code == ƒ.KEYBOARD_CODE.ARROW_LEFT || _event.code == ƒ.KEYBOARD_CODE.A ? 1 :
                    _event.code == ƒ.KEYBOARD_CODE.ARROW_RIGHT || _event.code == ƒ.KEYBOARD_CODE.D ? -1 :
                        0));
            cmpCameraTransform.lookAt(new ƒ.Vector3());
            _viewport.draw();
            ƒ.Debug.log(cmpCameraTransform.position.get().toString());
        }
    }
})(TextureTest || (TextureTest = {}));
//# sourceMappingURL=LightMoving.js.map