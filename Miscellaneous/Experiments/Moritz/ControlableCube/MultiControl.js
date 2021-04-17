"use strict";
///<reference types="../../../../Core/Build/FudgeCore"/>
///<reference types="../../../../Aid/Build/FudgeAid"/>
var ControlableCube;
///<reference types="../../../../Core/Build/FudgeCore"/>
///<reference types="../../../../Aid/Build/FudgeAid"/>
(function (ControlableCube) {
    var f = FudgeCore;
    var ƒAid = FudgeAid;
    window.addEventListener("DOMContentLoaded", init);
    const clrWhite = f.Color.CSS("white");
    let controlled;
    let viewport;
    let cntKeyHorizontal = new f.Control("Keyboard", 1, 0 /* PROPORTIONAL */, true);
    let cntKeyVertical = new f.Control("Keyboard", 4, 0 /* PROPORTIONAL */, true);
    // let cntMouseHorizontal: f.Control = new f.Control("Pointer", -1e-2, f.CONTROL_TYPE.INTEGRAL, true);
    // let cntMouseVertical: f.Control = new f.Control("Pointer", -0.1, f.CONTROL_TYPE.INTEGRAL, true);
    cntKeyHorizontal.setDelay(500);
    cntKeyVertical.setDelay(500);
    let cameraAnker = new f.Node("CameraAnker");
    function init(_event) {
        setupScene();
        setupControls();
        f.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        f.Loop.start(f.LOOP_MODE.FRAME_REQUEST, 60);
    }
    function update(_event) {
        hndKeyboardControls();
        let timeFrame = f.Loop.timeFrameGame / 1000;
        controlled.update(timeFrame);
        viewport.draw();
    }
    // function hndPointerMove(_event: PointerEvent): void {
    //   cntMouseHorizontal.setInput(_event.movementX);
    //   cntMouseVertical.setInput(_event.movementY);
    //   cntMouseHorizontal.setInput(0);
    //   cntMouseVertical.setInput(0);
    // }
    function hndKeyboardControls() {
        cntKeyVertical.setInput(f.Keyboard.mapToValue(1, 0, [f.KEYBOARD_CODE.W, f.KEYBOARD_CODE.ARROW_UP])
            + f.Keyboard.mapToValue(-1, 0, [f.KEYBOARD_CODE.S, f.KEYBOARD_CODE.ARROW_DOWN]));
        cntKeyHorizontal.setInput(f.Keyboard.mapToValue(1, 0, [f.KEYBOARD_CODE.A, f.KEYBOARD_CODE.ARROW_LEFT])
            + f.Keyboard.mapToValue(-1, 0, [f.KEYBOARD_CODE.D, f.KEYBOARD_CODE.ARROW_RIGHT]));
    }
    function setupScene() {
        let root = new f.Node("Root");
        let mtrCube = new f.Material("mtrCube", f.ShaderUniColor, new f.CoatColored(f.Color.CSS("white")));
        controlled = new ControlableCube.Controlled("Cube", f.Matrix4x4.IDENTITY(), mtrCube, new f.MeshCube());
        // controlled.setUpAxis();
        controlled.getComponent(f.ComponentMesh).mtxPivot.translateY(0.5);
        root.addChild(controlled);
        let txtFloor = new ƒ.TextureImage("../Textures/DEM1_5.png");
        let mtrFloor = new ƒ.Material("Floor", ƒ.ShaderTexture, new ƒ.CoatTextured(clrWhite, txtFloor));
        // let mtrPlane: f.Material = new f.Material("mtrPlane", f.ShaderUniColor, new f.CoatColored(f.Color.CSS("red")));
        let plane = new ƒAid.Node("Plane", f.Matrix4x4.IDENTITY(), mtrFloor, new f.MeshQuad());
        plane.mtxLocal.rotateX(-90);
        plane.mtxLocal.scale(f.Vector3.ONE(20));
        root.addChild(plane);
        let cmpCamera = new f.ComponentCamera();
        // cmpCamera.mtxPivot.translate(new ƒ.Vector3(0, 20, 30));
        // cmpCamera.mtxPivot.lookAt(ƒ.Vector3.ZERO());
        cameraAnker.addComponent(new f.ComponentTransform);
        cameraAnker.mtxLocal.rotateY(180);
        cmpCamera.mtxPivot.translate(new f.Vector3(0, 30, 30));
        cmpCamera.mtxPivot.rotateY(0);
        cmpCamera.mtxPivot.rotateX(-30);
        cmpCamera.mtxPivot.lookAt(ƒ.Vector3.ZERO());
        cameraAnker.addComponent(cmpCamera);
        controlled.addChild(cameraAnker);
        let canvas = ƒAid.Canvas.create(true);
        document.body.appendChild(canvas);
        viewport = new f.Viewport();
        viewport.initialize("Viewport", root, cmpCamera, canvas);
    }
    function setupControls() {
        controlled.axisSpeed.addControl(cntKeyVertical);
        // controlled.axisSpeed.addControl(cntMouseVertical);
        controlled.axisRotation.addControl(cntKeyHorizontal);
        // controlled.axisRotation.addControl(cntMouseHorizontal);
        // viewport.addEventListener(ƒ.EVENT_POINTER.MOVE, hndPointerMove);
        viewport.activatePointerEvent("\u0192pointermove" /* MOVE */, true);
    }
})(ControlableCube || (ControlableCube = {}));
