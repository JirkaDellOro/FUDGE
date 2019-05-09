var RenderManagerRendering;
(function (RenderManagerRendering) {
    var ƒ = Fudge;
    window.addEventListener("load", init);
    let uiMaps = {};
    let uiClient;
    let canvas;
    let viewPort = new ƒ.Viewport();
    let camera;
    let uiCamera;
    function init() {
        // create asset
        let branch = Scenes.createAxisCross();
        branch.addComponent(new ƒ.ComponentTransform());
        // initialize RenderManager and transmit content
        ƒ.RenderManager.initialize();
        ƒ.RenderManager.addBranch(branch);
        ƒ.RenderManager.recalculateAllNodeTransforms();
        // initialize viewports
        canvas = document.getElementsByTagName("canvas")[0];
        camera = Scenes.createCamera(new ƒ.Vector3(1, 2, 3));
        let cmpCamera = camera.getComponent(ƒ.ComponentCamera);
        viewPort.initialize(canvas.id, branch, cmpCamera, canvas);
        let menu = document.getElementsByTagName("div")[0];
        menu.innerHTML = "Test automatic rectangle transformation. Adjust CSS-Frame and mappings";
        uiCamera = new UI.Camera();
        menu.appendChild(uiCamera);
        appendUIMap(menu, "DestinationToSource", viewPort.mapDestinationToSource);
        appendUIMap(menu, "CanvasToDestination", viewPort.mapCanvasToDestination);
        appendUIMap(menu, "ClientToCanvas", viewPort.mapClientToCanvas);
        uiClient = new UI.Rectangle("ClientRectangle");
        uiClient.addEventListener("input", hndChangeOnClient);
        menu.appendChild(uiClient);
        update();
        uiCamera.addEventListener("input", hndChangeOnCamera);
        setCamera();
        viewPort.mappingRects = true;
        ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, animate);
        ƒ.Loop.start();
        function animate(_event) {
            update();
            branch.cmpTransform.rotateY(1);
            ƒ.RenderManager.recalculateAllNodeTransforms();
            // prepare and draw viewport
            //viewPort.prepare();
            viewPort.draw();
        }
    }
    function appendUIMap(_parent, _name, map) {
        let uiMap = new UI.MapRectangle(_name);
        uiMap.addEventListener("input", hndChangeOnMap);
        _parent.appendChild(uiMap);
        uiMaps[_name] = { ui: uiMap, map: map };
    }
    function hndChangeOnMap(_event) {
        let target = _event.currentTarget;
        setRect(target);
    }
    function hndChangeOnCamera(_event) {
        //let target: UI.Rectangle = <UI.Rectangle>_event.currentTarget;
        setCamera();
    }
    function hndChangeOnClient(_event) {
        let target = _event.currentTarget;
        setClient(target);
    }
    function setRect(_uiMap) {
        let value = _uiMap.get();
        let map = uiMaps[_uiMap.name].map;
        for (let key in value) {
            switch (key) {
                case "Anchor":
                    map.normAnchor = value[key];
                    break;
                case "Border":
                    map.pixelBorder = value[key];
                    break;
                case "Result":
                    break;
                default:
                    throw (new Error("Invalid name: " + key));
            }
        }
    }
    function setCamera() {
        let params = uiCamera.get();
        let cmpCamera = camera.getComponent(ƒ.ComponentCamera);
        cmpCamera.projectCentral(params.aspect, params.fieldOfView);
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
            let uiMap = uiMaps[name];
            uiMap.ui.set({ Anchor: uiMap.map.normAnchor, Border: uiMap.map.pixelBorder });
            switch (name) {
                case "ClientToCanvas":
                    uiMap.ui.set({ Result: viewPort.getCanvasRectangle() });
                    break;
                case "CanvasToDestination":
                    uiMap.ui.set({ Result: viewPort.rectDestination });
                    break;
                case "DestinationToSource":
                    uiMap.ui.set({ Result: viewPort.rectSource });
                    break;
            }
        }
        let clientRect = canvas.getBoundingClientRect();
        uiClient.set({ x: clientRect.left, y: clientRect.top, width: clientRect.width, height: clientRect.height });
        let cmpCamera = camera.getComponent(ƒ.ComponentCamera);
        uiCamera.set({ aspect: cmpCamera.getAspect(), fieldOfView: cmpCamera.getFieldOfView() });
    }
})(RenderManagerRendering || (RenderManagerRendering = {}));
//# sourceMappingURL=TestRectMapping.js.map