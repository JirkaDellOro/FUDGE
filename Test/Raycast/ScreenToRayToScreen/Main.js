var ScreenToRayToScreen;
(function (ScreenToRayToScreen) {
    var ƒ = FudgeCore;
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
        ƒ.RenderManager.initialize(true);
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
        let ray = new ƒ.Ray(new ƒ.Vector3(posProjection.x, posProjection.y, -1));
        console.group("original");
        ƒ.Debug.log("origin", ray.origin.toString());
        ƒ.Debug.log("direction", ray.direction.toString());
        console.groupEnd();
        ray.direction.scale(ScreenToRayToScreen.camera.getDistance());
        ray.origin.transform(ScreenToRayToScreen.camera.cmpCamera.pivot);
        ray.origin.transform(ScreenToRayToScreen.camera.cmpCamera.getContainer().mtxWorld);
        ray.direction.transform(ScreenToRayToScreen.camera.cmpCamera.pivot, false);
        ray.direction.transform(ScreenToRayToScreen.camera.cmpCamera.getContainer().mtxWorld, false);
        console.group("transformed");
        ƒ.Debug.log("origin", ray.origin.toString());
        ƒ.Debug.log("direction", ray.direction.toString());
        console.groupEnd();
        let rayEnd = ƒ.Vector3.SUM(ray.origin, ray.direction);
        let projection = ScreenToRayToScreen.camera.cmpCamera.project(rayEnd);
        // let screen: ƒ.Vector2 = ƒ.RenderManager.rectClip.pointToRect(projection.toVector2(), viewport.getCanvasRectangle());
        let screen = viewport.pointClipToClient(projection.toVector2());
        console.group("end");
        ƒ.Debug.log("End", rayEnd.toString());
        ƒ.Debug.log("Projected", projection.toString());
        ƒ.Debug.log("Screen", screen.toString());
        console.groupEnd();
        let mtxCube = ScreenToRayToScreen.root.getChildrenByName("Cube")[0].cmpTransform.local;
        mtxCube.translation = rayEnd;
        updateDisplay();
    }
    function hndWheelMove(_event) {
        ScreenToRayToScreen.camera.translate(_event.deltaY * speedCameraTranslation);
        updateDisplay();
    }
    function createScene() {
        // set lights
        let cmpLight = new ƒ.ComponentLight(new ƒ.LightDirectional(ƒ.Color.CSS("WHITE")));
        cmpLight.pivot.lookAt(new ƒ.Vector3(0.5, 1, 0.8));
        // game.addComponent(cmpLight);
        let cmpLightAmbient = new ƒ.ComponentLight(new ƒ.LightAmbient(ƒ.Color.CSS("DARK_GREY")));
        ScreenToRayToScreen.root.addComponent(cmpLightAmbient);
        // setup orbiting camera
        ScreenToRayToScreen.camera = new ScreenToRayToScreen.CameraOrbit(75);
        ScreenToRayToScreen.root.appendChild(ScreenToRayToScreen.camera);
        // camera.setRotationX(-20);
        ScreenToRayToScreen.camera.setRotationY(90);
        ScreenToRayToScreen.camera.cmpCamera.getContainer().addComponent(cmpLight);
        let cube = new ƒ.Node("Cube");
        let cmpMesh = new ƒ.ComponentMesh(new ƒ.MeshCube());
        cube.addComponent(cmpMesh);
        let cmpMaterial = new ƒ.ComponentMaterial(new ƒ.Material("Red", ƒ.ShaderFlat, new ƒ.CoatColored(ƒ.Color.CSS("RED"))));
        cube.addComponent(cmpMaterial);
        let cmpTransform = new ƒ.ComponentTransform();
        cube.addComponent(cmpTransform);
        ScreenToRayToScreen.root.appendChild(cube);
    }
    function updateDisplay() {
        viewport.draw();
        drawLabels();
    }
    ScreenToRayToScreen.updateDisplay = updateDisplay;
    function drawLabels() {
        let mtxCube = ScreenToRayToScreen.root.getChildrenByName("Cube")[0].mtxWorld;
        let projection = ScreenToRayToScreen.camera.cmpCamera.project(mtxCube.translation);
        let posCanvas = viewport.pointClipToCanvas(projection.toVector2());
        let posClient = viewport.pointClipToClient(projection.toVector2());
        let posScreen = viewport.pointClientToScreen(posClient);
        ƒ.Debug.group("Cube");
        ƒ.Debug.clear();
        ƒ.Debug.info("End", mtxCube.translation.toString());
        ƒ.Debug.log("Projected", projection.toString());
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