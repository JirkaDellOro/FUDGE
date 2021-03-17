var ScreenToRayToScreen;
(function (ScreenToRayToScreen) {
    var ƒ = FudgeCore;
    var ƒAid = FudgeAid;
    ƒ.Render.initialize(true);
    window.addEventListener("load", init);
    ScreenToRayToScreen.root = new ƒ.Node("Root");
    let viewport;
    let speedCameraRotation = 0.2;
    let speedCameraTranslation = 0.02;
    let labelDOM;
    let crc2;
    ƒ.Debug.setFilter(ƒ.DebugConsole, ƒ.DEBUG_FILTER.ALL - ƒ.DEBUG_FILTER.CLEAR);
    ƒ.Debug.setFilter(ƒ.DebugTextArea, ƒ.DEBUG_FILTER.ALL);
    function init() {
        ScreenToRayToScreen.args = new URLSearchParams(location.search);
        const canvas = document.querySelector("canvas");
        ƒ.Debug.log("Canvas", canvas);
        crc2 = canvas.getContext("2d");
        // enable unlimited mouse-movement (user needs to click on canvas first)
        canvas.addEventListener("click", canvas.requestPointerLock);
        labelDOM = document.createElement("span");
        labelDOM.appendChild(ƒ.DebugTextArea.textArea);
        document.body.appendChild(labelDOM);
        createScene();
        // setup viewport
        viewport = new ƒ.Viewport();
        viewport.initialize("Viewport", ScreenToRayToScreen.root, ScreenToRayToScreen.camera.cmpCamera, canvas);
        ƒ.Debug.log("Viewport", viewport);
        // setup event handling
        viewport.activatePointerEvent("\u0192pointermove" /* MOVE */, true);
        viewport.activateWheelEvent("\u0192wheel" /* WHEEL */, true);
        viewport.addEventListener("\u0192pointermove" /* MOVE */, hndPointerMove);
        viewport.addEventListener("\u0192wheel" /* WHEEL */, hndWheelMove);
        // window.addEventListener("keydown", hndKeyDown);
        updateDisplay();
        ƒ.Debug.log("Game", ScreenToRayToScreen.root);
    }
    function hndPointerMove(_event) {
        if (document.pointerLockElement) {
            ScreenToRayToScreen.camera.rotateY(_event.movementX * speedCameraRotation);
            ScreenToRayToScreen.camera.rotateX(_event.movementY * speedCameraRotation);
            updateDisplay();
            return;
        }
        let posProjection = viewport.pointClientToProjection(new ƒ.Vector2(_event.pointerX, _event.pointerY));
        ƒ.Debug.clear();
        let ray = new ƒ.Ray(new ƒ.Vector3(-posProjection.x, posProjection.y, 1));
        console.group("original");
        ƒ.Debug.log("origin", ray.origin.toString());
        ƒ.Debug.log("direction", ray.direction.toString());
        console.groupEnd();
        ray.direction.scale(ScreenToRayToScreen.camera.distance);
        ray.origin.transform(ScreenToRayToScreen.camera.cmpCamera.mtxPivot);
        ray.origin.transform(ScreenToRayToScreen.camera.cmpCamera.getContainer().mtxWorld);
        ray.direction.transform(ScreenToRayToScreen.camera.cmpCamera.mtxPivot, false);
        ray.direction.transform(ScreenToRayToScreen.camera.cmpCamera.getContainer().mtxWorld, false);
        console.group("transformed");
        ƒ.Debug.log("origin", ray.origin.toString());
        ƒ.Debug.log("direction", ray.direction.toString());
        console.groupEnd();
        let rayEnd = ƒ.Vector3.SUM(ray.origin, ray.direction);
        let posClip = ScreenToRayToScreen.camera.cmpCamera.pointWorldToClip(rayEnd);
        // let screen: ƒ.Vector2 = ƒ.Render.rectClip.pointToRect(projection.toVector2(), viewport.getCanvasRectangle());
        let screen = viewport.pointClipToClient(posClip.toVector2());
        console.group("end");
        ƒ.Debug.log("End", rayEnd.toString());
        ƒ.Debug.log("Projected", posClip.toString());
        ƒ.Debug.log("Screen", screen.toString());
        console.groupEnd();
        let mtxCube = ScreenToRayToScreen.root.getChildrenByName("Cube")[0].mtxLocal;
        mtxCube.translation = rayEnd;
        updateDisplay();
    }
    function hndWheelMove(_event) {
        ScreenToRayToScreen.camera.distance += _event.deltaY * speedCameraTranslation;
        updateDisplay();
    }
    function createScene() {
        ScreenToRayToScreen.root.addChild(new ƒAid.NodeCoordinateSystem());
        // set lights
        let cmpLight = new ƒ.ComponentLight(new ƒ.LightDirectional(ƒ.Color.CSS("WHITE")));
        cmpLight.mtxPivot.lookAt(new ƒ.Vector3(-1, -3, -2));
        ScreenToRayToScreen.root.addComponent(cmpLight);
        let cmpLightAmbient = new ƒ.ComponentLight(new ƒ.LightAmbient(ƒ.Color.CSS("grey")));
        ScreenToRayToScreen.root.addComponent(cmpLightAmbient);
        // setup orbiting camera
        let cmpCamera = new ƒ.ComponentCamera();
        cmpCamera.clrBackground = ƒ.Color.CSS("white");
        ScreenToRayToScreen.camera = new ƒAid.CameraOrbit(cmpCamera, 5, 75, 3, 20);
        ScreenToRayToScreen.root.addChild(ScreenToRayToScreen.camera);
        // camera.node.addComponent(cmpLight);
        let cube = new ƒ.Node("Cube");
        let cmpMesh = new ƒ.ComponentMesh(new ƒ.MeshCube());
        cube.addComponent(cmpMesh);
        let cmpMaterial = new ƒ.ComponentMaterial(new ƒ.Material("Red", ƒ.ShaderFlat, new ƒ.CoatColored(ƒ.Color.CSS("RED"))));
        cube.addComponent(cmpMaterial);
        let cmpTransform = new ƒ.ComponentTransform();
        cube.addComponent(cmpTransform);
        ScreenToRayToScreen.root.addChild(cube);
    }
    function updateDisplay() {
        viewport.draw();
        drawLabels();
    }
    ScreenToRayToScreen.updateDisplay = updateDisplay;
    function drawLabels() {
        let mtxCube = ScreenToRayToScreen.root.getChildrenByName("Cube")[0].mtxWorld;
        let posClip = ScreenToRayToScreen.camera.cmpCamera.pointWorldToClip(mtxCube.translation);
        let posCanvas = viewport.pointClipToCanvas(posClip.toVector2());
        let posClient = viewport.pointClipToClient(posClip.toVector2());
        let posScreen = viewport.pointClientToScreen(posClient);
        ƒ.Debug.group("Cube");
        ƒ.Debug.clear();
        ƒ.Debug.info("End", mtxCube.translation.toString());
        ƒ.Debug.log("Projected", posClip.toString());
        ƒ.Debug.warn("Canvas", posCanvas.toString());
        ƒ.Debug.error("Client", posClient.toString());
        ƒ.Debug.log("Screen", posScreen.toString());
        ƒ.Debug.groupEnd();
        labelDOM.style.left = posScreen.x + 30 + "px";
        labelDOM.style.top = posScreen.y + 30 + "px";
        crc2.beginPath();
        crc2.arc(posCanvas.x, posCanvas.y, 2, 0, 2 * Math.PI);
        crc2.moveTo(posCanvas.x, posCanvas.y);
        posCanvas.subtract(ƒ.Vector2.ONE(50));
        crc2.lineTo(posCanvas.x, posCanvas.y);
        crc2.rect(posCanvas.x, posCanvas.y, -220, -100);
        let text = ƒ.DebugTextArea.textArea.textContent.split("\n");
        let posLineY = 0;
        for (let line of text)
            crc2.fillText(line, posCanvas.x - 210, posCanvas.y - 96 + (posLineY += 16), 200);
        crc2.stroke();
    }
})(ScreenToRayToScreen || (ScreenToRayToScreen = {}));
//# sourceMappingURL=Main.js.map