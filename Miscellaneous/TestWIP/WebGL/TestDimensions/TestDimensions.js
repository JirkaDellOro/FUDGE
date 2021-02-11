var RenderRendering;
(function (RenderRendering) {
    var ƒ = FudgeCore;
    window.addEventListener("load", init);
    let uiRectangles = {};
    let canvas;
    let viewPort = new ƒ.Viewport();
    let cmpCamera;
    let uiCamera;
    function init() {
        // create asset
        let graph = Scenes.createAxisCross();
        graph.addComponent(new ƒ.ComponentTransform());
        // initialize viewports
        canvas = document.getElementsByTagName("canvas")[0];
        cmpCamera = Scenes.createCamera(new ƒ.Vector3(1, 2, 3));
        viewPort.initialize(canvas.id, graph, cmpCamera, canvas);
        let menu = document.getElementsByTagName("div")[0];
        menu.innerHTML = "Set render-rectangles by hand,<br/>automatic rectangle transformation and camera adustment is turned off";
        uiCamera = new UI.Camera();
        menu.appendChild(uiCamera);
        appendUIRectangle(menu, "RenderCanvas");
        appendUIRectangle(menu, "RenderViewport");
        appendUIRectangle(menu, "ViewportSource");
        appendUIRectangle(menu, "ViewportDestination");
        appendUIRectangle(menu, "DomCanvas");
        appendUIRectangle(menu, "CSSRectangle");
        setAll(new ƒ.Rectangle(0, 0, 300, 300));
        update();
        uiCamera.addEventListener("input", hndChangeOnCamera);
        setCamera();
        viewPort.adjustingFrames = false;
        viewPort.adjustingCamera = false;
        ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, animate);
        ƒ.Loop.start();
        function animate(_event) {
            update();
            graph.mtxLocal.rotateY(1);
            viewPort.draw();
        }
    }
    function appendUIRectangle(_parent, _name) {
        let uiRectangle = new UI.Rectangle(_name);
        uiRectangle.appendButton("all");
        uiRectangle.addEventListener("click", hndClickOnRect);
        uiRectangle.addEventListener("input", hndChangeOnRect);
        uiRectangle.appendCheckbox("lock");
        _parent.appendChild(uiRectangle);
        uiRectangles[_name] = uiRectangle;
    }
    function hndClickOnRect(_event) {
        if (_event.target.tagName != "BUTTON")
            return;
        let current = _event.currentTarget;
        setAll(current.get());
    }
    function hndChangeOnRect(_event) {
        let target = _event.currentTarget;
        setRect(target);
    }
    function hndChangeOnCamera(_event) {
        //let target: UI.Rectangle = <UI.Rectangle>_event.currentTarget;
        setCamera();
    }
    function setAll(_rect) {
        for (let name in uiRectangles) {
            let uiRectangle = uiRectangles[name];
            if (uiRectangle.isLocked())
                continue;
            uiRectangle.set(_rect);
            setRect(uiRectangle);
        }
    }
    function setRect(_uiRectangle) {
        let rect = _uiRectangle.get();
        switch (_uiRectangle.name) {
            case "RenderCanvas":
                ƒ.Render.setCanvasSize(rect.width, rect.height);
                break;
            case "RenderViewport":
                ƒ.Render.setRenderRectangle(rect);
                break;
            case "ViewportSource":
                viewPort.rectSource = rect;
                break;
            case "ViewportDestination":
                viewPort.rectDestination = rect;
                break;
            case "DomCanvas":
                canvas.width = rect.width;
                canvas.height = rect.height;
                break;
            case "CSSRectangle":
                canvas.style.left = rect.x + "px";
                canvas.style.top = rect.y + "px";
                canvas.style.width = rect.width + "px";
                canvas.style.height = rect.height + "px";
                break;
            default:
                throw (new Error("Invalid name: " + _uiRectangle.name));
        }
    }
    function setCamera() {
        let params = uiCamera.get();
        cmpCamera.projectCentral(params.aspect, params.fieldOfView);
    }
    function update() {
        uiRectangles["RenderCanvas"].set(ƒ.Render.getCanvasRect());
        uiRectangles["RenderViewport"].set(ƒ.Render.getRenderRectangle());
        uiRectangles["ViewportSource"].set(viewPort.rectSource);
        uiRectangles["ViewportDestination"].set(viewPort.rectDestination);
        uiRectangles["DomCanvas"].set(new ƒ.Rectangle(0, 0, canvas.width, canvas.height));
        let client = canvas.getBoundingClientRect();
        uiRectangles["CSSRectangle"].set(new ƒ.Rectangle(client.left, client.top, client.width, client.height));
        uiCamera.set({ aspect: cmpCamera.getAspect(), fieldOfView: cmpCamera.getFieldOfView() });
    }
})(RenderRendering || (RenderRendering = {}));
//# sourceMappingURL=TestDimensions.js.map