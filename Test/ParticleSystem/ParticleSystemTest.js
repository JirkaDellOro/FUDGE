///<reference types="../../Core/Build/FudgeCore"/>
///<reference types="../../Aid/Build/FudgeAid"/>
var ParticleSystemTest;
///<reference types="../../Core/Build/FudgeCore"/>
///<reference types="../../Aid/Build/FudgeAid"/>
(function (ParticleSystemTest) {
    var f = FudgeCore;
    var fAid = FudgeAid;
    window.addEventListener("load", hndLoad);
    let root = new f.Node("Root");
    let particles;
    let viewport;
    let camera;
    let speedCameraRotation = 0.2;
    let speedCameraTranslation = 0.02;
    let input;
    let particleSystem;
    function hndLoad(_event) {
        f.RenderManager.initialize(true, false);
        f.RenderManager.setDepthTest(false);
        f.RenderManager.setBlendMode(f.BLEND.PARTICLE);
        input = document.getElementById("particleNum");
        const canvas = document.querySelector("canvas");
        f.Debug.log("Canvas", canvas);
        f.Debug.setFilter(f.DebugConsole, f.DEBUG_FILTER.ERROR);
        // enable unlimited mouse-movement (user needs to click on canvas first)
        canvas.addEventListener("mousedown", canvas.requestPointerLock);
        canvas.addEventListener("mouseup", () => document.exitPointerLock());
        // set lights
        // let cmpLight: f.ComponentLight = new f.ComponentLight(new f.LightDirectional(f.Color.CSS("WHITE")));
        // cmpLight.pivot.lookAt(new f.Vector3(0.5, -1, -0.8));
        // game.addComponent(cmpLight);
        // let cmpLightAmbient: f.ComponentLight = new f.ComponentLight(new f.LightAmbient(new f.Color(0.25, 0.25, 0.25, 1)));
        // root.addComponent(cmpLightAmbient);
        // setup orbiting camera
        camera = new fAid.CameraOrbit(new f.ComponentCamera(), 4);
        camera.component.backgroundColor = f.Color.CSS("black");
        root.addChild(camera);
        // setup coordinate axes
        let coordinateSystem = new fAid.NodeCoordinateSystem("Coordinates", f.Matrix4x4.SCALING(new f.Vector3(1, 1, 1)));
        root.addChild(coordinateSystem);
        // setup viewport
        viewport = new f.Viewport();
        viewport.initialize("Viewport", root, camera.component, canvas);
        f.Debug.log("Viewport", viewport);
        // setup event handling
        viewport.activatePointerEvent("\u0192pointermove" /* MOVE */, true);
        viewport.activateWheelEvent("\u0192wheel" /* WHEEL */, true);
        viewport.addEventListener("\u0192pointermove" /* MOVE */, hndPointerMove);
        viewport.addEventListener("\u0192wheel" /* WHEEL */, hndWheelMove);
        // setup particles
        let img = document.querySelector("img");
        let txtImage = new f.TextureImage();
        txtImage.image = img;
        let coat = new f.CoatTextured();
        coat.texture = txtImage;
        let material = new f.Material("Material", f.ShaderTexture, coat);
        // let material: ƒ.Material = new ƒ.Material("Material", ƒ.ShaderUniColor, new ƒ.CoatColored(ƒ.Color.CSS("WHITE")));
        let mesh = new f.MeshQuad();
        particles = new fAid.Node("Paritcles", f.Matrix4x4.TRANSLATION(new f.Vector3(0, 1, 0)), material, mesh);
        particleSystem = new f.ComponentParticleSystem("data.json", input.valueAsNumber);
        particles.addComponent(particleSystem);
        root.addChild(particles);
        // setup input
        input.addEventListener("input", (_event) => {
            let newParticleSystem = new f.ComponentParticleSystem("data.json", input.valueAsNumber);
            particles.removeComponent(particleSystem);
            particles.addComponent(newParticleSystem);
            particleSystem = newParticleSystem;
        });
        input.dispatchEvent(new Event("input"));
        f.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        f.Loop.start(f.LOOP_MODE.TIME_GAME, 30);
        function update(_event) {
            let time = f.Time.game.get() / 1000;
            particleSystem.updateParticleEffect(time);
            // console.log(particles.getComponent(f.ComponentTransform).local);
            viewport.draw();
        }
    }
    function hndPointerMove(_event) {
        if (!_event.buttons)
            return;
        camera.rotateY(_event.movementX * speedCameraRotation);
        camera.rotateX(_event.movementY * speedCameraRotation);
    }
    function hndWheelMove(_event) {
        camera.distance = camera.distance + _event.deltaY * speedCameraTranslation;
    }
})(ParticleSystemTest || (ParticleSystemTest = {}));
//# sourceMappingURL=ParticleSystemTest.js.map