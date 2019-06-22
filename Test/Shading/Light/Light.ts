namespace TextureTest {
    import ƒ = Fudge;

    window.addEventListener("load", init);

    function init(_event: Event): void {
        let coatRed: ƒ.CoatColored = new ƒ.CoatColored(new ƒ.Color(1, 0, 0, 1));
        let material: ƒ.Material = new ƒ.Material("Red", ƒ.ShaderFlat, coatRed);

        let body: ƒ.Node = Scenes.createCompleteMeshNode("Body", material, new ƒ.MeshPyramid());
        body.cmpTransform.translate(0, 0, 0);
        body.cmpTransform.scale(0.8, 0.8, 0.8);

        let cmpLightAmbient: ƒ.ComponentLight = new ƒ.ComponentLight(new ƒ.LightAmbient(new ƒ.Color(.1, .0, .0, 1)));
        body.addComponent(cmpLightAmbient);

        let cmpLightDirectionalRed: ƒ.ComponentLight = new ƒ.ComponentLight(new ƒ.LightDirectional(new ƒ.Color(1, 0, 0, 1), new ƒ.Vector3(1, 0.2, 0)));
        body.addComponent(cmpLightDirectionalRed);

        let cmpLightDirectionalGreen: ƒ.ComponentLight = new ƒ.ComponentLight(new ƒ.LightDirectional(new ƒ.Color(0, 1, 0, 1), new ƒ.Vector3(-1, 0.2, -1)));
        body.addComponent(cmpLightDirectionalGreen);

        let cmpLightDirectionalBlue: ƒ.ComponentLight = new ƒ.ComponentLight(new ƒ.LightDirectional(new ƒ.Color(0, 0, 1, 1), new ƒ.Vector3(0, 0.2, 1)));
        body.addComponent(cmpLightDirectionalBlue);

        let branch: ƒ.Node = new ƒ.Node("Branch");
        branch.appendChild(body);
        branch.appendChild(Scenes.createCoordinateSystem());

        ƒ.RenderManager.initialize();
        ƒ.RenderManager.addBranch(branch);
        ƒ.RenderManager.update();

        let viewport: ƒ.Viewport = new ƒ.Viewport();
        let camera: ƒ.Node = Scenes.createCamera(new ƒ.Vector3(1.5, 1.5, 1.5), new ƒ.Vector3(0, 0, 0));
        viewport.initialize("Viewport", branch, camera.getComponent(ƒ.ComponentCamera), document.querySelector("canvas"));

        dollyViewportCamera(viewport);
        viewport.setFocus(true);
        viewport.draw();

        //*/
        window.setInterval(function (): void {
            // body.cmpTransform.rotateY(-1.1);
            body.cmpTransform.rotateY(-1);
            // body.cmpTransform.rotateZ(-0.9);
            ƒ.RenderManager.update();
            viewport.draw();
        },                 20);
        //*/
    }

    function dollyViewportCamera(_viewport: ƒ.Viewport): void {
        _viewport.activateKeyboardEvent(ƒ.EVENT_KEYBOARD.DOWN, true);
        _viewport.addEventListener(ƒ.EVENT_KEYBOARD.DOWN, rotate);

        function rotate(_event: ƒ.KeyboardEventƒ): void {
            let cmpCameraTransform: ƒ.ComponentTransform = _viewport.camera.getContainer().cmpTransform;
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

}