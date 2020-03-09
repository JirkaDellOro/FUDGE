var MultiControl;
(function (MultiControl) {
    var ƒ = FudgeCore;
    var ƒAid = FudgeAid;
    window.addEventListener("DOMContentLoaded", init);
    let axisSpeed = new ƒ.Axis(1, 0 /* PROPORTIONAL */);
    let axisRotation = new ƒ.Axis(1, 0 /* PROPORTIONAL */);
    let cube;
    let viewport;
    let maxSpeed = 5; // units per second
    let maxRotSpeed = 180; // degrees per second
    function init(_event) {
        setupScene();
        ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        ƒ.Loop.start(ƒ.LOOP_MODE.FRAME_REQUEST, 60);
        axisSpeed.setDelay(500);
        axisRotation.setDelay(200);
    }
    function update(_event) {
        axisSpeed.setInput(ƒ.Keyboard.valueFor(1, 0, [ƒ.KEYBOARD_CODE.W]) + ƒ.Keyboard.valueFor(-1, 0, [ƒ.KEYBOARD_CODE.S]));
        axisRotation.setInput(ƒ.Keyboard.valueFor(1, 0, [ƒ.KEYBOARD_CODE.A]) + ƒ.Keyboard.valueFor(-1, 0, [ƒ.KEYBOARD_CODE.D]));
        let timeFrame = ƒ.Loop.timeFrameGame / 1000;
        let distance = axisSpeed.getValue() * maxSpeed * timeFrame;
        let angle = axisRotation.getValue() * maxRotSpeed * timeFrame;
        cube.mtxLocal.translateZ(distance);
        cube.mtxLocal.rotateY(angle);
        viewport.draw();
    }
    function setupScene() {
        let root = new ƒ.Node("Root");
        //, new ƒ.CoatTextured()
        let mtrPlane = new ƒ.Material("mtrPlane", ƒ.ShaderUniColor, new ƒ.CoatColored(ƒ.Color.CSS("red")));
        let plane = new ƒAid.Node("Plane", ƒ.Matrix4x4.IDENTITY(), mtrPlane, new ƒ.MeshQuad());
        plane.mtxLocal.rotateX(-90);
        plane.mtxLocal.scale(ƒ.Vector3.ONE(20));
        let mtrCube = new ƒ.Material("mtrCube", ƒ.ShaderUniColor, new ƒ.CoatColored(ƒ.Color.CSS("white")));
        cube = new ƒAid.Node("Cube", ƒ.Matrix4x4.IDENTITY(), mtrCube, new ƒ.MeshCube());
        cube.getComponent(ƒ.ComponentMesh).pivot.translateY(0.5);
        root.addChild(plane);
        root.addChild(cube);
        let cmpCamera = new ƒ.ComponentCamera();
        cmpCamera.pivot.translate(new ƒ.Vector3(10, 20, 30));
        cmpCamera.pivot.lookAt(ƒ.Vector3.ZERO());
        let canvas = ƒAid.Canvas.create(true);
        document.body.appendChild(canvas);
        viewport = new ƒ.Viewport();
        viewport.initialize("Viewport", root, cmpCamera, canvas);
    }
})(MultiControl || (MultiControl = {}));
//# sourceMappingURL=MultiControl.js.map