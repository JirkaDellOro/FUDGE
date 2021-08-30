var ScreenToRay;
(function (ScreenToRay) {
    var ƒ = FudgeCore;
    var ƒAid = FudgeAid;
    window.addEventListener("load", init);
    let uiMaps = {};
    let uiClient;
    let menu;
    let canvas;
    let viewport = new ƒ.Viewport();
    let cmpCamera;
    let uiCamera;
    let mouse = new ƒ.Vector2();
    let mouseButton;
    let viewportRay = new ƒ.Viewport();
    let cameraRay;
    let canvasRay;
    let cursor = new ƒAid.NodeArrow("Cursor", ƒ.Color.CSS("white"));
    function init() {
        // create asset
        let root = new ƒ.Node("Root");
        let cosys = new ƒAid.NodeCoordinateSystem("CoSys", ƒ.Matrix4x4.SCALING(ƒ.Vector3.ONE(100)));
        cosys.getChildrenByName("ArrowBlue")[0].mtxLocal.rotateZ(45, true);
        cosys.getChildrenByName("ArrowBlue")[0].getChildrenByName("ArrowBlueShaft")[0].getComponent(ƒ.ComponentMaterial).clrPrimary.a = 0.5; // = ƒ.Color.CSS("white", 0.9);
        let object = new ƒAid.Node("Object", ƒ.Matrix4x4.SCALING(ƒ.Vector3.ONE(2)), new ƒ.Material("Object", ƒ.ShaderTexture, new ƒ.CoatTextured(ƒ.Color.CSS("white"))), 
        // new ƒ.Material("Object", ƒ.ShaderUniColor, new ƒ.CoatColored(ƒ.Color.CSS("red"))),
        // new ƒ.MeshPolygon("Object")
        new ƒ.MeshTorus("Object")
        // new ƒ.MeshSphere("Object", 15, 15)
        );
        root.appendChild(object);
        root.appendChild(cursor);
        console.log(object.getComponent(ƒ.ComponentMesh).mesh.boundingBox);
        console.log(object.getComponent(ƒ.ComponentMesh).mesh.radius);
        // initialize viewports
        canvas = document.querySelector("canvas#viewport");
        cmpCamera = new ƒ.ComponentCamera();
        cmpCamera.projectCentral(1, 45, ƒ.FIELD_OF_VIEW.DIAGONAL, 2, 5);
        cmpCamera.mtxPivot.translation = new ƒ.Vector3(1, 2, 3);
        cmpCamera.mtxPivot.lookAt(ƒ.Vector3.ZERO());
        viewport.initialize(canvas.id, root, cmpCamera, canvas);
        canvas.addEventListener("mousemove", setCursorPosition);
        canvasRay = document.querySelector("canvas#ray");
        cameraRay = new ƒ.ComponentCamera();
        cameraRay.mtxPivot.translation = new ƒ.Vector3(1, 2, 3);
        // cameraRay.projectCentral(1, 10);
        viewportRay.initialize("ray", root, cameraRay, canvasRay);
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
        document.addEventListener("keydown", hndKeydown);
        ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, animate);
        ƒ.Loop.start();
        function animate(_event) {
            update();
            viewport.draw();
            adjustRayCamera();
            pick();
        }
    }
    function pick() {
        cursor.activate(false);
        let picks = ƒ.Picker.pickViewport(viewport, mouse);
        cursor.activate(true);
        picks.sort((a, b) => a.zBuffer < b.zBuffer ? -1 : 1);
        let output = document.querySelector("output");
        output.innerHTML = "";
        for (let pick of picks) {
            output.innerHTML += "Name: " + pick.node.name + ", z: " + pick.zBuffer.toFixed(2) + "<br/>";
            // output.innerHTML += "luminance: " + pick.luminance.toFixed(2) + ", alpha: " + pick.alpha.toFixed(2) + "<br/>";
            output.innerHTML += "color: " + pick.color.toString() + "<br/>";
            output.innerHTML += "posWorld: " + pick.posWorld.toString() + "<br/>";
            output.innerHTML += "posMesh: " + pick.posMesh.toString() + "<br/>";
            output.innerHTML += "textureUV: " + pick.textureUV.toString() + "<br/>";
            output.innerHTML += "normal: " + pick.normal.toString() + "<br/>";
        }
        if (!picks.length)
            return;
        let pick = picks[0];
        cursor.mtxLocal.translation = pick.posWorld;
        cursor.color = pick.color;
        cursor.mtxLocal.lookAt(ƒ.Vector3.SUM(pick.posWorld, pick.normal), ƒ.Vector3.SUM(ƒ.Vector3.ONE(), pick.normal));
        if (!mouseButton)
            return;
        let material = pick.node.getComponent(ƒ.ComponentMaterial).material;
        let coat = material.getCoat();
        let img = coat.texture.texImageSource;
        let canvas;
        if (img instanceof OffscreenCanvas)
            canvas = img;
        else
            canvas = new OffscreenCanvas(img.width, img.height);
        let crc2 = canvas.getContext("2d");
        if (!(img instanceof OffscreenCanvas))
            crc2.drawImage(img, 0, 0);
        crc2.fillStyle = "red";
        let width = pick.textureUV.x;
        width = width < 0 ? 1 + (width + Math.trunc(width)) : width -= Math.trunc(width);
        let height = pick.textureUV.y;
        height = height < 0 ? 1 + (height + Math.trunc(height)) : height -= Math.trunc(height);
        crc2.fillRect(width * img.width - 5, height * img.height - 5, 10, 10);
        let txtCanvas = new ƒ.TextureCanvas("Test", crc2);
        material.setCoat(new ƒ.CoatTextured(ƒ.Color.CSS("white"), txtCanvas));
    }
    function adjustRayCamera() {
        let ray = computeRay();
        ray.direction.transform(cmpCamera.mtxPivot);
        cameraRay.mtxPivot.lookAt(ray.direction);
        cameraRay.projectCentral(1, 5);
        viewportRay.draw();
        let crcRay = canvasRay.getContext("2d");
        crcRay.translate(crcRay.canvas.width / 2, crcRay.canvas.height / 2);
        crcRay.strokeStyle = "white";
        crcRay.strokeRect(-10, -10, 20, 20);
    }
    function computeRay() {
        let posMouse = mouse.copy;
        setUiPoint("Client", posMouse);
        let posRender = viewport.pointClientToRender(posMouse);
        setUiPoint("Render", posRender);
        let rect = viewport.getClientRectangle();
        let result;
        result = viewport.frameClientToCanvas.getPoint(posMouse, rect);
        setUiPoint("Canvas", result);
        rect = viewport.getCanvasRectangle();
        result = viewport.frameCanvasToDestination.getPoint(result, rect);
        setUiPoint("Destination", result);
        result = viewport.frameDestinationToSource.getPoint(result, viewport.rectSource);
        setUiPoint("Source", result);
        //TODO: when Source, Render and RenderViewport deviate, continue transformation 
        let posProjection = viewport.pointClientToProjection(posMouse);
        let rectProjection = cmpCamera.getProjectionRectangle();
        setUiPoint("Projection", posProjection);
        let ray = new ƒ.Ray(new ƒ.Vector3(-posProjection.x, posProjection.y, 1));
        return ray;
    }
    function setCursorPosition(_event) {
        mouse = new ƒ.Vector2(_event.clientX, _event.clientY);
        mouseButton = _event.buttons;
    }
    function hndKeydown(_event) {
        let object = viewport.getBranch().getChildrenByName("Object")[0];
        object.mtxLocal.rotateY(5 * (_event.code == ƒ.KEYBOARD_CODE.A ? -1 : _event.code == ƒ.KEYBOARD_CODE.D ? 1 : 0));
        object.mtxLocal.rotateX(5 * (_event.code == ƒ.KEYBOARD_CODE.W ? -1 : _event.code == ƒ.KEYBOARD_CODE.S ? 1 : 0));
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
        cmpCamera.projectCentral(params.aspect, params.fieldOfView, ƒ.FIELD_OF_VIEW.DIAGONAL, params.near, params.far); //);
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
        uiClient.set(ƒ.Rectangle.GET(clientRect.left, clientRect.top, clientRect.width, clientRect.height));
        uiCamera.set({ aspect: cmpCamera.getAspect(), fieldOfView: cmpCamera.getFieldOfView(), near: cmpCamera.getNear(), far: cmpCamera.getFar() });
    }
})(ScreenToRay || (ScreenToRay = {}));
//# sourceMappingURL=ScreenToRay.js.map