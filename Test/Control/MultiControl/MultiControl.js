var MultiControl;
(function (MultiControl) {
    var ƒ = FudgeCore;
    var ƒAid = FudgeAid;
    window.addEventListener("DOMContentLoaded", init);
    let controlled;
    let viewport;
    let cntKeyHorizontal = new ƒ.Control("Keyboard", 1, 0 /* PROPORTIONAL */, true);
    let cntKeyVertical = new ƒ.Control("Keyboard", 4, 0 /* PROPORTIONAL */, true);
    let cntMouseHorizontal = new ƒ.Control("Pointer", -1e-2, 1 /* INTEGRAL */, true);
    let cntMouseVertical = new ƒ.Control("Pointer", -0.1, 1 /* INTEGRAL */, true);
    cntKeyHorizontal.setDelay(500);
    cntKeyVertical.setDelay(500);
    function init(_event) {
        setupScene();
        setupControls();
        ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        ƒ.Loop.start(ƒ.LOOP_MODE.FRAME_REQUEST, 60);
    }
    function update(_event) {
        hndKeyboardControls();
        let timeFrame = ƒ.Loop.timeFrameGame / 1000;
        controlled.update(timeFrame);
        viewport.draw();
    }
    function hndPointerMove(_event) {
        cntMouseHorizontal.setInput(_event.movementX);
        cntMouseVertical.setInput(_event.movementY);
        cntMouseHorizontal.setInput(0);
        cntMouseVertical.setInput(0);
    }
    function hndKeyboardControls() {
        cntKeyVertical.setInput(ƒ.Keyboard.mapToValue(1, 0, [ƒ.KEYBOARD_CODE.W, ƒ.KEYBOARD_CODE.ARROW_UP])
            + ƒ.Keyboard.mapToValue(-1, 0, [ƒ.KEYBOARD_CODE.S, ƒ.KEYBOARD_CODE.ARROW_DOWN]));
        cntKeyHorizontal.setInput(ƒ.Keyboard.mapToValue(1, 0, [ƒ.KEYBOARD_CODE.A, ƒ.KEYBOARD_CODE.ARROW_LEFT])
            + ƒ.Keyboard.mapToValue(-1, 0, [ƒ.KEYBOARD_CODE.D, ƒ.KEYBOARD_CODE.ARROW_RIGHT]));
    }
    function setupScene() {
        let root = new ƒ.Node("Root");
        let mtrCube = new ƒ.Material("mtrCube", ƒ.ShaderUniColor, new ƒ.CoatColored(ƒ.Color.CSS("white")));
        controlled = new MultiControl.Controlled("Cube", ƒ.Matrix4x4.IDENTITY(), mtrCube, new ƒ.MeshCube());
        // controlled.setUpAxis();
        controlled.getComponent(ƒ.ComponentMesh).pivot.translateY(0.5);
        root.addChild(controlled);
        let mtrPlane = new ƒ.Material("mtrPlane", ƒ.ShaderUniColor, new ƒ.CoatColored(ƒ.Color.CSS("red")));
        let plane = new ƒAid.Node("Plane", ƒ.Matrix4x4.IDENTITY(), mtrPlane, new ƒ.MeshQuad());
        plane.mtxLocal.rotateX(-90);
        plane.mtxLocal.scale(ƒ.Vector3.ONE(20));
        root.addChild(plane);
        let cmpCamera = new ƒ.ComponentCamera();
        cmpCamera.pivot.translate(new ƒ.Vector3(10, 20, 30));
        cmpCamera.pivot.lookAt(ƒ.Vector3.ZERO());
        let canvas = ƒAid.Canvas.create(true);
        document.body.appendChild(canvas);
        viewport = new ƒ.Viewport();
        viewport.initialize("Viewport", root, cmpCamera, canvas);
    }
    function setupControls() {
        controlled.axisSpeed.addControl(cntKeyVertical);
        controlled.axisSpeed.addControl(cntMouseVertical);
        controlled.axisRotation.addControl(cntKeyHorizontal);
        controlled.axisRotation.addControl(cntMouseHorizontal);
        viewport.addEventListener("\u0192pointermove" /* MOVE */, hndPointerMove);
        viewport.activatePointerEvent("\u0192pointermove" /* MOVE */, true);
    }
})(MultiControl || (MultiControl = {}));
//# sourceMappingURL=MultiControl.js.map