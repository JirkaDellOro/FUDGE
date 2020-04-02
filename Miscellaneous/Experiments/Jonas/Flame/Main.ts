///<reference types="../../../../Core/Build/FudgeCore"/>
///<reference types="../../../../Aid/Build/FudgeAid"/>

namespace Flame {
    import f = FudgeCore;
    import fAid = FudgeAid;

    window.addEventListener("load", hndLoad);

    let root: f.Node = new f.Node("Root");
    let viewport: f.Viewport;
    let camera: fAid.CameraOrbit;
    let speedCameraRotation: number = 0.2;
    let speedCameraTranslation: number = 0.02;

    let input: HTMLInputElement;

    let particleNum: number;
    let particleOffset: number;
    let randomNumbers: number[] = [];

    function hndLoad(_event: Event): void {
        input = <HTMLInputElement>document.getElementById("particleNum");
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

        // setup random 100 random numbers
        for (let i = 0; i < 100; i++) {
            randomNumbers.push(Math.random());
        }

        // setup particles
        let mesh: f.Mesh = new f.MeshCube();
        let material: f.Material = new f.Material("Alpha", f.ShaderUniColor, new f.CoatColored(f.Color.CSS("YELLOW")));
        particleNum = input.valueAsNumber;
        particleOffset = 1 / particleNum;
        root.addChild(createParticles(mesh, material));

        // setup input
        input.addEventListener("input", (_event: Event) => {
            particleNum = input.valueAsNumber;
            particleOffset = 1 / particleNum;
            let newParticles: f.Node = createParticles(mesh, material);
            root.replaceChild(getParticles(), newParticles);
        });

        viewport.draw();

        f.Loop.addEventListener(f.EVENT.LOOP_FRAME, update);
        f.Loop.start(f.LOOP_MODE.TIME_GAME, 60);

        function update(_event: f.Eventƒ): void {
            let time: number = f.Time.game.get() / 1000;
            updateParticles(time);
            viewport.draw();
        }

    }

    function updateParticles(_time: number): void {
        let effectFactor: number = _time *.7 % 1;
        let particleIndex: number = 1;
        for (const child of getParticles().getChildren()) {
            // console.log("Child: " + particleIndex + "-------");
            let currentOffset: number = particleIndex * particleOffset - particleOffset / 2;
            // console.log("Offset: " + currentOffset);
            let y: number = (effectFactor + currentOffset + randomNumbers[(particleIndex - 1) % 100]) % 1;
            let x: number = ((-2 + currentOffset * 4) * Math.pow(1 - y, 3) + (2 - currentOffset * 4) * Math.pow(1 - y, 2));
            let z: number = 0;
            // y = slowDown(y);
            let translation: f.Vector3 = new f.Vector3(x, y, z);
            // console.log(translation.toString());
            child.cmpTransform.local.translation = translation;
            particleIndex++;
        }

        // function slowDown(_value: number): number {
        //     return _value * _value;
        // }
    }

    function createParticle(_mesh: f.Mesh, _material: f.Material): f.Node {
        let node: f.Node = new fAid.Node("Alpha", f.Matrix4x4.TRANSLATION(new f.Vector3(0, 0, 0)), _material, _mesh);
        node.getComponent(f.ComponentMesh).pivot.scale(new f.Vector3(0.05, 0.05, 0.05));
        return node;
    }

    function createParticles(_mesh: f.Mesh, _material: f.Material): f.Node {
        let newParticles: f.Node = new fAid.Node("Particles", f.Matrix4x4.TRANSLATION(new f.Vector3(0, -.5, 0)));
        for (let i = 0; i < particleNum; i++) {
            newParticles.addChild(createParticle(_mesh, _material));
        }
        return newParticles;
    }

    function getParticles(): f.Node {
        return root.getChildrenByName("Particles")[0];
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