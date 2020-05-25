"use strict";
var Import;
(function (Import) {
    window.addEventListener("load", hndLoad);
    let root = new Import.f.Node("Root");
    let viewport;
    let camera;
    let speedCameraRotation = 0.2;
    let speedCameraTranslation = 0.02;
    let input;
    let particleSystem;
    function hndLoad(_event) {
        input = document.getElementById("particleNum");
        const canvas = document.querySelector("canvas");
        Import.f.RenderManager.initialize(false, true);
        Import.f.Debug.log("Canvas", canvas);
        Import.f.Debug.setFilter(Import.f.DebugConsole, Import.f.DEBUG_FILTER.NONE);
        // enable unlimited mouse-movement (user needs to click on canvas first)
        canvas.addEventListener("mousedown", canvas.requestPointerLock);
        canvas.addEventListener("mouseup", () => document.exitPointerLock());
        // setup orbiting camera
        camera = new Import.fAid.CameraOrbit(new Import.f.ComponentCamera(), 4);
        root.addChild(camera);
        // setup coordinate axes
        let coordinateSystem = new Import.fAid.NodeCoordinateSystem("Coordinates", Import.f.Matrix4x4.SCALING(new Import.f.Vector3(1, 1, 1)));
        root.addChild(coordinateSystem);
        // setup viewport
        viewport = new Import.f.Viewport();
        viewport.initialize("Viewport", root, camera.component, canvas);
        Import.f.Debug.log("Viewport", viewport);
        // setup event handling
        viewport.activatePointerEvent("\u0192pointermove" /* MOVE */, true);
        viewport.activateWheelEvent("\u0192wheel" /* WHEEL */, true);
        viewport.addEventListener("\u0192pointermove" /* MOVE */, hndPointerMove);
        viewport.addEventListener("\u0192wheel" /* WHEEL */, hndWheelMove);
        // setup particles
        let mesh = new Import.f.MeshQuad();
        let material = new Import.f.Material("Material", Import.f.ShaderUniColor, new Import.f.CoatColored(Import.f.Color.CSS("WHITE")));
        root.addChild(new Import.f.Node("Particles"));
        // setup input
        input.addEventListener("input", (_event) => {
            let newParticleSystem = new Import.ParticleSystem(mesh, material, Import.f.Matrix4x4.IDENTITY(), input.valueAsNumber);
            root.replaceChild(getParticleSystem(), newParticleSystem);
            particleSystem = getParticleSystem();
        });
        input.dispatchEvent(new Event("input"));
        Import.f.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        Import.f.Loop.start(Import.f.LOOP_MODE.TIME_GAME, 30);
        function update(_event) {
            let time = Import.f.Time.game.get() / 1000;
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
})(Import || (Import = {}));
//# sourceMappingURL=Main.js.map