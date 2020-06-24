var MouseToRay;
(function (MouseToRay) {
    var ƒ = FudgeCore;
    var ƒAid = FudgeAid;
    ƒ.RenderManager.initialize(true);
    window.addEventListener("load", init);
    MouseToRay.root = new ƒ.Node("Root");
    let viewport;
    let distance = 5;
    let ray;
    function init() {
        const canvas = document.querySelector("canvas");
        ƒ.Debug.log("Canvas", canvas);
        createScene();
        let cmpCamera = new ƒ.ComponentCamera();
        cmpCamera.pivot.translate(ƒ.Vector3.ONE(5));
        cmpCamera.pivot.lookAt(ƒ.Vector3.ZERO());
        viewport = new ƒ.Viewport();
        viewport.initialize("Viewport", MouseToRay.root, cmpCamera, canvas);
        ƒ.Debug.log("Viewport", viewport);
        // setup event handling
        viewport.activatePointerEvent("\u0192pointermove" /* MOVE */, true);
        viewport.activateWheelEvent("\u0192wheel" /* WHEEL */, true);
        viewport.addEventListener("\u0192pointermove" /* MOVE */, hndPointerMove);
        viewport.addEventListener("\u0192wheel" /* WHEEL */, hndWheelMove);
        ƒ.Debug.log("Game", MouseToRay.root);
        viewport.draw();
    }
    function hndPointerMove(_event) {
        ray = viewport.getRayFromClient(new ƒ.Vector2(_event.pointerX, _event.pointerY));
        positionCube();
    }
    function hndWheelMove(_event) {
        distance -= _event.deltaY * 0.01;
        distance = Math.max(3, distance);
        positionCube();
    }
    function positionCube() {
        let modifiers = new Map([
            [ƒ.KEYBOARD_CODE.X, ƒ.Vector3.X()],
            [ƒ.KEYBOARD_CODE.Y, ƒ.Vector3.Y()],
            [ƒ.KEYBOARD_CODE.Z, ƒ.Vector3.Z()]
        ]);
        let normal;
        for (let entry of modifiers)
            if (ƒ.Keyboard.isPressedOne([entry[0]]))
                normal = entry[1];
        let pos;
        if (normal)
            pos = ray.intersectPlane(ƒ.Vector3.ZERO(), normal);
        else
            pos = ƒ.Vector3.SUM(ray.origin, ƒ.Vector3.SCALE(ray.direction, distance));
        MouseToRay.root.getChildrenByName("Cube")[0].mtxLocal.translation = pos;
        viewport.draw();
    }
    function createScene() {
        MouseToRay.root.addChild(new ƒAid.NodeCoordinateSystem());
        ƒAid.addStandardLightComponents(MouseToRay.root);
        let cube = new ƒAid.Node("Cube", ƒ.Matrix4x4.IDENTITY(), new ƒ.Material("Red", ƒ.ShaderFlat, new ƒ.CoatColored(ƒ.Color.CSS("RED"))), new ƒ.MeshCube());
        MouseToRay.root.addChild(cube);
    }
})(MouseToRay || (MouseToRay = {}));
//# sourceMappingURL=Main.js.map