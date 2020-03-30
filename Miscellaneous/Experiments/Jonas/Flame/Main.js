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
    let particles = new f.Node("Particles");
    let viewport;
    let camera;
    let speedCameraRotation = 0.2;
    let speedCameraTranslation = 0.02;
    function hndLoad(_event) {
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
        particles.addComponent(new f.ComponentTransform());
        particles.cmpTransform.local.translateY(-0.5);
        root.addChild(particles);
        particles.addChild(createParticle(mesh, material));
        viewport.draw();
        f.Time.game.setTimer(500, 20, () => {
            particles.addChild(createParticle(mesh, material));
        });
        f.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        f.Loop.start(f.LOOP_MODE.TIME_GAME, 60);
        function update(_event) {
            let time = f.Time.game.get() / 1000;
            updateParticles(time);
            // console.log(time);
            viewport.draw();
        }
    }
    function updateParticles(_time) {
        let effectFactor = _time % 1;
        for (const child of particles.getChildren()) {
            let x = 0;
            let y = effectFactor;
            let z = 0;
            let translation = new f.Vector3(x, y, z);
            child.cmpTransform.local.translation = translation;
        }
    }
    function createParticle(_mesh, _material) {
        let node = new fAid.Node("Alpha", f.Matrix4x4.TRANSLATION(new f.Vector3(0, 0, 0)), _material, _mesh);
        node.getComponent(f.ComponentMesh).pivot.scale(new f.Vector3(0.05, 0.05, 0.05));
        return node;
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