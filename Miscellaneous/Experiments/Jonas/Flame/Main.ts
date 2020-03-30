///<reference types="../../../../Core/Build/FudgeCore"/>
///<reference types="../../../../Aid/Build/FudgeAid"/>

namespace Flame {
    import f = FudgeCore;
    import fAid = FudgeAid;

    window.addEventListener("load", hndLoad);

    let root: f.Node = new f.Node("Root");
    let particles: f.Node = new f.Node("Particles");
    let viewport: f.Viewport;
    let camera: fAid.CameraOrbit;
    let speedCameraRotation: number = 0.2;
    let speedCameraTranslation: number = 0.02;

    function hndLoad(_event: Event): void {
        const canvas: HTMLCanvasElement = document.querySelector("canvas");
        f.RenderManager.initialize(false, true);
        f.Debug.log("Canvas", canvas);

        // enable unlimited mouse-movement (user needs to click on canvas first)
        canvas.addEventListener("mousedown", canvas.requestPointerLock);
        canvas.addEventListener("mouseup", () => document.exitPointerLock());

        // setup orbiting camera
        camera = new fAid.CameraOrbit(new f.ComponentCamera(), 4);
        root.addChild(camera);

        // setup coordinate axes
        let coordinateSystem: fAid.NodeCoordinateSystem = new fAid.NodeCoordinateSystem("Coordinates", f.Matrix4x4.SCALING(new f.Vector3(1, 1, 1)));
        root.addChild(coordinateSystem);

        // setup viewport
        viewport = new f.Viewport();
        viewport.initialize("Viewport", root, camera.component, canvas);
        f.Debug.log("Viewport", viewport);

        // setup event handling
        viewport.activatePointerEvent(f.EVENT_POINTER.MOVE, true);
        viewport.activateWheelEvent(f.EVENT_WHEEL.WHEEL, true);
        viewport.addEventListener(f.EVENT_POINTER.MOVE, hndPointerMove);
        viewport.addEventListener(f.EVENT_WHEEL.WHEEL, hndWheelMove);

        // setup particles
        let mesh: f.Mesh = new f.MeshCube();
        let material: f.Material = new f.Material("Alpha", f.ShaderUniColor, new f.CoatColored(f.Color.CSS("YELLOW")));
        particles.addComponent(new f.ComponentTransform());
        particles.cmpTransform.local.translateY(-0.5);
        root.addChild(particles);

        particles.addChild(createParticle(mesh, material));

        viewport.draw();

        f.Time.game.setTimer(500, 20, () => {
            particles.addChild(createParticle(mesh, material));
        });

        f.Loop.addEventListener(f.EVENT.LOOP_FRAME, update);
        f.Loop.start(f.LOOP_MODE.TIME_GAME, 60);

        function update(_event: f.Eventƒ): void {
            let time: number = f.Time.game.get() / 1000;
            updateParticles(time);
            // console.log(time);
            viewport.draw();
        }

    }

    function updateParticles(_time: number): void {
        let effectFactor: number = _time % 1;
        for (const child of particles.getChildren()) {
            let x: number = 0;
            let y: number = effectFactor;
            let z: number = 0;
            let translation: f.Vector3 = new f.Vector3(x, y, z);
            child.cmpTransform.local.translation = translation;
        }
    }

    function createParticle(_mesh: f.Mesh, _material: f.Material): f.Node {
        let node: f.Node = new fAid.Node("Alpha", f.Matrix4x4.TRANSLATION(new f.Vector3(0, 0, 0)), _material, _mesh);
        node.getComponent(f.ComponentMesh).pivot.scale(new f.Vector3(0.05, 0.05, 0.05));
        return node;
    }

    function hndPointerMove(_event: f.EventPointer): void {
        if (!_event.buttons)
            return;
        camera.rotateY(_event.movementX * speedCameraRotation);
        camera.rotateX(_event.movementY * speedCameraRotation);
    }

    function hndWheelMove(_event: WheelEvent): void {
        camera.distance = camera.distance + _event.deltaY * speedCameraTranslation;
    }
}