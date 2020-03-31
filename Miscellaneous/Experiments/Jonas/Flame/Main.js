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
    let particleNum;
    let particleOffset;
    let randomNumbers = [];
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
        // setup random 100 random numbers
        for (let i = 0; i < 100; i++) {
            randomNumbers.push(Math.random());
        }
        // setup particles
        let mesh = new f.MeshCube();
        let material = new f.Material("Alpha", f.ShaderUniColor, new f.CoatColored(f.Color.CSS("YELLOW")));
        particleNum = input.valueAsNumber;
        particleOffset = 1 / particleNum;
        root.addChild(createParticles(mesh, material));
        // setup input
        input.addEventListener("input", (_event) => {
            particleNum = input.valueAsNumber;
            particleOffset = 1 / particleNum;
            let newParticles = createParticles(mesh, material);
            root.replaceChild(getParticles(), newParticles);
        });
        viewport.draw();
        f.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        f.Loop.start(f.LOOP_MODE.TIME_GAME, 60);
        function update(_event) {
            let time = f.Time.game.get() / 1000;
            updateParticles(time);
            viewport.draw();
        }
    }
    function updateParticles(_time) {
        let effectFactor = _time * .7 % 1;
        let particleIndex = 1;
        for (const child of getParticles().getChildren()) {
            // console.log("Child: " + particleIndex + "-------");
            let currentOffset = particleIndex * particleOffset - particleOffset / 2;
            // console.log("Offset: " + currentOffset);
            let y = (effectFactor + currentOffset + randomNumbers[(particleIndex - 1) % 100]) % 1;
            let x = ((-2 + currentOffset * 4) * Math.pow(1 - y, 3) + (2 - currentOffset * 4) * Math.pow(1 - y, 2));
            let z = 0;
            // y = slowDown(y);
            let translation = new f.Vector3(x, y, z);
            // console.log(translation.toString());
            child.cmpTransform.local.translation = translation;
            particleIndex++;
        }
        // function slowDown(_value: number): number {
        //     return _value * _value;
        // }
    }
    function createParticle(_mesh, _material) {
        let node = new fAid.Node("Alpha", f.Matrix4x4.TRANSLATION(new f.Vector3(0, 0, 0)), _material, _mesh);
        node.getComponent(f.ComponentMesh).pivot.scale(new f.Vector3(0.05, 0.05, 0.05));
        return node;
    }
    function createParticles(_mesh, _material) {
        let newParticles = new fAid.Node("Particles", f.Matrix4x4.TRANSLATION(new f.Vector3(0, -.5, 0)));
        for (let i = 0; i < particleNum; i++) {
            newParticles.addChild(createParticle(_mesh, _material));
        }
        return newParticles;
    }
    function getParticles() {
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