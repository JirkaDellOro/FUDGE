var ScreenToRay;
(function (ScreenToRay) {
    var ƒ = FudgeCore;
    window.addEventListener("load", init);
    let uiMaps = {};
    let uiClient;
    let menu;
    let canvas;
    let viewport = new ƒ.Viewport();
    let cmpCamera;
    let uiCamera;
    let mouse = new ƒ.Vector2();
    let viewportRay = new ƒ.Viewport();
    let cameraRay;
    let canvasRay;
    function init() {
        // create asset
        let branch = Scenes.createAxisCross();
        branch.addComponent(new ƒ.ComponentTransform());
        // initialize RenderManager and transmit content
        ƒ.RenderManager.initialize();
        ƒ.RenderManager.addBranch(branch);
        ƒ.RenderManager.update();
        // initialize viewports
        canvas = document.querySelector("canvas#viewport");
        cmpCamera = Scenes.createCamera(new ƒ.Vector3(1, 2, 3));
        viewport.initialize(canvas.id, branch, cmpCamera, canvas);
        canvas.addEventListener("mousemove", setCursorPosition);
        canvasRay = document.querySelector("canvas#ray");
        cameraRay = Scenes.createCamera(new ƒ.Vector3(1, 2, 3));
        let cmpCameraRay = cameraRay;
        cmpCameraRay.projectCentral(1, 45);
        viewportRay.initialize("ray", branch, cmpCameraRay, canvasRay);
        viewportRay.adjustingFrames = true;
        menu = document.getElementsByTagName("div")[0];
        menu.innerHTML = "Test automatic rectangle transformation. Adjust CSS-Frame and framings";
        uiCamera = new UI.Camera();
        menu.appendChild(uiCamera);
        appendUIScale(menu, "DestinationToSource", viewport.frameDestinationToSource);
        appendUIComplex(menu, "CanvasToDestination", viewport.frameCanvasToDestination);
        appendUIScale(menu, "ClientToCanvas", viewport.frameClientToCanvas);
        uiClient = new UI.Rectangle("ClientRectangle");
        uiClient.addEventListener("input", hndChangeOnClient);
        menu.appendChild(uiClient);
        menu.appendChild(new UI.Point("Client"));
        menu.appendChild(new UI.Point("Canvas"));
        menu.appendChild(new UI.Point("Destination"));
        menu.appendChild(new UI.Point("Source"));
        menu.appendChild(new UI.Point("Render"));
        menu.appendChild(new UI.Point("Projection"));
        update();
        uiCamera.addEventListener("input", hndChangeOnCamera);
        setCamera();
        viewport.adjustingFrames = true;
        logMutatorInfo("Camera", cmpCamera);
        for (let name in uiMaps) {
            logMutatorInfo(name, uiMaps[name].framing);
        }
        ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, animate);
        ƒ.Loop.start();
        function animate(_event) {
            update();
            // branch.cmpTransform.local.rotateY(1);
            ƒ.RenderManager.update();
            viewport.draw();
            adjustRayCamera();
        }
    }
    function adjustRayCamera() {
        let ray = computeRay();
        // ray.direction.x *= 5;
        // ray.direction.y *= 5;
        ray.direction.transform(cmpCamera.pivot);
        cameraRay.pivot.lookAt(ray.direction);
        viewportRay.draw();
        let crcRay = canvasRay.getContext("2d");
        crcRay.translate(crcRay.canvas.width / 2, crcRay.canvas.height / 2);
        crcRay.strokeStyle = "white";
        crcRay.strokeRect(-10, -10, 20, 20);
    }
    function computeRay() {
        let rect = viewport.getClientRectangle();
        // let posMouse: ƒ.Vector2 = ƒ.Vector2.DIFFERENCE(mouse, new ƒ.Vector2(rect.width / 2, rect.height / 2));
        // posMouse.y *= -1;
        let posMouse = mouse.copy;
        setUiPoint("Client", posMouse);
        let posRender = viewport.pointClientToRender(posMouse);
        setUiPoint("Render", posRender);
        let result;
        rect = viewport.getClientRectangle();
        result = viewport.frameClientToCanvas.getPoint(posMouse, rect);
        setUiPoint("Canvas", result);
        rect = viewport.getCanvasRectangle();
        result = viewport.frameCanvasToDestination.getPoint(result, rect);
        setUiPoint("Destination", result);
        result = viewport.frameDestinationToSource.getPoint(result, viewport.rectSource);
        setUiPoint("Source", result);
        //TODO: when Source, Render and RenderViewport deviate, continue transformation 
        let rectRender = viewport.frameSourceToRender.getRect(viewport.rectSource);
        let rectProjection = cmpCamera.getProjectionRectangle();
        let posProjection = new ƒ.Vector2((2 * posRender.x / rectRender.width) * rectProjection.width / 2, (2 * posRender.y / rectRender.height) * rectProjection.height / 2);
        posProjection.subtract(new ƒ.Vector2(rectProjection.width / 2, rectProjection.height / 2));
        posProjection.y *= -1;
        // let overflow: ƒ.Vector2 = new ƒ.Vector2();
        // if (posProjection.x > 1) { posProjection.x -= 1, overflow.x = 90; }
        // if (posProjection.x < -1) { posProjection.x += 1; overflow.x = -90; }
        // if (posProjection.y > 1) { posProjection.y -= 1, overflow.y = 90; }
        // if (posProjection.y < -1) { posProjection.y += 1; overflow.y = -90; }
        // let angleProjection: ƒ.Vector2 = new ƒ.Vector2(
        //     Math.asin(posProjection.x) * 180 / Math.PI,
        //     Math.asin(posProjection.y) * 180 / Math.PI
        // );
        // angleProjection.add(overflow);
        // the ray is starting at (0,0) and goes in the direction of posProjection with unlimited length
        // ƒ.Debug.info("Point", posProjection.get());
        setUiPoint("Projection", posProjection);
        let ray = new ƒ.Ray(new ƒ.Vector3(posProjection.x, posProjection.y, -1));
        return ray;
    }
    function setCursorPosition(_event) {
        mouse = new ƒ.Vector2(_event.clientX, _event.clientY);
    }
    function setUiPoint(_name, _point) {
        let uiPoint;
        uiPoint = menu.querySelector("fieldset[name=" + _name + "]");
        uiPoint.set(_point.getMutator());
    }
    function logMutatorInfo(_title, _mutable) {
        let mutator = _mutable.getMutator();
        let types = _mutable.getMutatorAttributeTypes(mutator);
        console.group(_title);
        console.log("Types: ", types);
        console.log("Mutator: ", mutator);
        console.groupEnd();
    }
    function appendUIComplex(_parent, _name, _framing) {
        let uiMap = new UI.FramingComplex(_name);
        uiMap.addEventListener("input", hndChangeOnComplex);
        _parent.appendChild(uiMap);
        uiMaps[_name] = { ui: uiMap, framing: _framing };
    }
    function appendUIScale(_parent, _name, _framing) {
        let uiMap = new UI.FramingScaled(_name);
        uiMap.addEventListener("input", hndChangeOnScale);
        _parent.appendChild(uiMap);
        uiMaps[_name] = { ui: uiMap, framing: _framing };
    }
    function hndChangeOnComplex(_event) {
        let target = _event.currentTarget;
        setRectComplex(target);
    }
    function hndChangeOnScale(_event) {
        let target = _event.currentTarget;
        setRectScale(target);
    }
    function hndChangeOnCamera(_event) {
        //let target: UI.Rectangle = <UI.Rectangle>_event.currentTarget;
        setCamera();
    }
    function hndChangeOnClient(_event) {
        let target = _event.currentTarget;
        setClient(target);
    }
    function setRectComplex(_uiMap) {
        let value = _uiMap.get();
        let framing = uiMaps[_uiMap.name].framing;
        for (let key in value) {
            switch (key) {
                case "Margin":
                    framing.margin = value[key];
                    break;
                case "Padding":
                    framing.padding = value[key];
                    break;
                case "Result":
                    break;
                default:
                    throw (new Error("Invalid name: " + key));
            }
        }
    }
    function setRectScale(_uiMap) {
        let value = _uiMap.get();
        let framing = uiMaps[_uiMap.name].framing;
        framing.setScale(value.normWidth, value.normHeight);
    }
    function setCamera() {
        let params = uiCamera.get();
        cmpCamera.projectCentral(params.aspect, params.fieldOfView); //, ƒ.FIELD_OF_VIEW.HORIZONTAL);
    }
    function setClient(_uiRectangle) {
        let rect = _uiRectangle.get();
        canvas.style.left = rect.x + "px";
        canvas.style.top = rect.y + "px";
        canvas.style.width = rect.width + "px";
        canvas.style.height = rect.height + "px";
    }
    function update() {
        for (let name in uiMaps) {
            // uiMap.ui.set({ Margin: uiMap.map.margin, Padding: uiMap.map.padding });
            switch (name) {
                case "ClientToCanvas": {
                    let uiMap = uiMaps[name];
                    uiMap.ui.set(uiMap.framing);
                    uiMap.ui.set({ Result: viewport.getCanvasRectangle() });
                    break;
                }
                case "CanvasToDestination": {
                    let uiMap = uiMaps[name];
                    uiMap.ui.set({ Margin: uiMap.framing.margin, Padding: uiMap.framing.padding });
                    uiMap.ui.set({ Result: viewport.rectDestination });
                    break;
                }
                case "DestinationToSource": {
                    let uiMap = uiMaps[name];
                    uiMap.ui.set(uiMap.framing);
                    uiMap.ui.set({ Result: viewport.rectSource });
                    break;
                }
            }
        }
        let clientRect = canvas.getBoundingClientRect();
        uiClient.set({ x: clientRect.left, y: clientRect.top, width: clientRect.width, height: clientRect.height });
        uiCamera.set({ aspect: cmpCamera.getAspect(), fieldOfView: cmpCamera.getFieldOfView() });
    }
})(ScreenToRay || (ScreenToRay = {}));
//# sourceMappingURL=ScreenToRay.js.map