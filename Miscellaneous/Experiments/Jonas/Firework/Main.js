"use strict";
///<reference types="../../../../Core/Build/FudgeCore"/>
///<reference types="../../../../Aid/Build/FudgeAid"/>
var Flame;
///<reference types="../../../../Core/Build/FudgeCore"/>
///<reference types="../../../../Aid/Build/FudgeAid"/>
(function (Flame) {
    var f = FudgeCore;
    var fAid = FudgeAid;
    window.addEventListener("load", hndLoad);
    let root = new f.Node("Root");
    let viewport;
    let camera;
    let speedCameraRotation = 0.2;
    let speedCameraTranslation = 0.02;
    let input;
    let particleSystem;
    function hndLoad(_event) {
        input = document.getElementById("particleNum");
        const canvas = document.querySelector("canvas");
        f.RenderManager.initialize(false, true);
        f.Debug.log("Canvas", canvas);
        // enable unlimited mouse-movement (user needs to click on canvas first)
        canvas.addEventListener("mousedown", canvas.requestPointerLock);
        canvas.addEventListener("mouseup", () => document.exitPointerLock());
        // setup orbiting camera
        camera = new fAid.CameraOrbit(new f.ComponentCamera(), 4);
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
        let mesh = new f.MeshCube();
        let material = new f.Material("Alpha", f.ShaderUniColor, new f.CoatColored(f.Color.CSS("YELLOW")));
        root.addChild(new f.Node("Particles"));
        // setup input
        input.addEventListener("input", (_event) => {
            // let newParticleSystem: ParticleSystem = new ParticleSystem(mesh, material, f.Matrix4x4.TRANSLATION(f.Vector3.Y(-.5)), input.valueAsNumber, 0.5, -2, 2, 0, 0, -1, 1);
            let newParticleSystem = new Flame.ParticleSystem(mesh, material, f.Matrix4x4.TRANSLATION(f.Vector3.Y(-.5)), input.valueAsNumber, 0.5, 0, 0, 5, 0, -1, 1);
            root.replaceChild(getParticleSystem(), newParticleSystem);
            particleSystem = getParticleSystem();
        });
        input.dispatchEvent(new Event("input"));
        f.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        f.Loop.start(f.LOOP_MODE.TIME_GAME, 60);
        function update(_event) {
            let time = f.Time.game.get() / 1000;
            particleSystem.update(time);
            viewport.draw();
        }
    }
    function getParticleSystem() {
        return root.getChildrenByName("Particles")[0];
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
})(Flame || (Flame = {}));
//# sourceMappingURL=Main.js.map