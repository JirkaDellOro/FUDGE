namespace WebGLRendering {
    import ƒ = Fudge;
    window.addEventListener("load", init);
    let uiRectangles: { [name: string]: UI.Rectangle } = {};
    let canvas: HTMLCanvasElement;
    let viewPort: ƒ.Viewport = new ƒ.Viewport();

    function init(): void {
        // create asset
        let branch: ƒ.Node = Scenes.createAxisCross();
        branch.addComponent(new ƒ.ComponentTransform());

        // initialize WebGL and transmit content
        ƒ.WebGLApi.initializeContext();
        ƒ.WebGL.addBranch(branch);
        ƒ.WebGL.recalculateAllNodeTransforms();

        // initialize viewports
        canvas = document.getElementsByTagName("canvas")[0];
        let camera: ƒ.Node = Scenes.createCamera(new ƒ.Vector3(1, 2, 3));
        let cmpCamera: ƒ.ComponentCamera = <ƒ.ComponentCamera>camera.getComponent(ƒ.ComponentCamera);
        viewPort.initialize(canvas.id, branch, cmpCamera, canvas);

        ƒ.Loop.addEventListener(ƒ.EVENT.ANIMATION_FRAME, animate);
        ƒ.Loop.start();
        function animate(_event: Event): void {
            branch.cmpTransform.rotateY(1);
            ƒ.WebGL.recalculateAllNodeTransforms();
            // prepare and draw viewport
            viewPort.prepare();
            viewPort.draw();
        }

        let menu: HTMLDivElement = document.getElementsByTagName("div")[0];
        appendUIRectangle(menu, "WebGLCanvas");
        appendUIRectangle(menu, "WebGLViewport");
        appendUIRectangle(menu, "Source");
        appendUIRectangle(menu, "Destination");
        appendUIRectangle(menu, "DomCanvas");
        appendUIRectangle(menu, "CSSRectangle");

        setAll({ x: 0, y: 0, width: 300, height: 300 });
    }

    function appendUIRectangle(_parent: HTMLElement, _name: string): void {
        let uiRectangle: UI.Rectangle = new UI.Rectangle(_name);
        uiRectangle.appendButton("all");
        uiRectangle.htmlElement.addEventListener("click", hndClick);
        uiRectangle.htmlElement.addEventListener("input", hndChange);

        uiRectangle.appendCheckbox("lock");

        _parent.appendChild(uiRectangle.htmlElement);
        uiRectangles[_name] = uiRectangle;
    }

    function hndClick(_event: Event): void {
        if ((<HTMLElement>_event.target).tagName != "BUTTON")
            return;
        let current: UI.Rectangle = _event.currentTarget["uiRectangle"];
        setAll(current.getRect());
    }

    function setAll(_rect: ƒ.Rectangle): void {
        for (let name in uiRectangles) {
            let uiRectangle: UI.Rectangle = uiRectangles[name];
            if (uiRectangle.isLocked())
                continue;
            uiRectangle.setRect(_rect);
            setRect(uiRectangle);
        }
        update();
    }

    function hndChange(_event: Event): void {
        let target: UI.Rectangle = _event.currentTarget["uiRectangle"];
        setRect(target);
    }

    function setRect(_uiRectangle: UI.Rectangle): void {
        let rect: ƒ.Rectangle = _uiRectangle.getRect();
        switch (_uiRectangle.name) {
            case "WebGLCanvas":
                ƒ.WebGL.setCanvasSize(rect.width, rect.height);
                break;
            case "WebGLViewport":
                ƒ.WebGL.setViewportRectangle(rect);
                break;
            case "Source":
                viewPort.rectSource = rect;
                break;
            case "Destination":
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
        update();
    }

    function update(): void {
        uiRectangles["WebGLCanvas"].setRect(ƒ.WebGL.getCanvasRect());
        uiRectangles["WebGLViewport"].setRect(ƒ.WebGL.getViewportRectangle());
        uiRectangles["Source"].setRect(viewPort.rectSource);
        uiRectangles["Destination"].setRect(viewPort.rectDestination);
        uiRectangles["DomCanvas"].setRect({ x: 0, y: 0, width: canvas.width, height: canvas.height });
        let client: ClientRect = canvas.getBoundingClientRect();
        uiRectangles["CSSRectangle"].setRect({ x: client.left, y: client.top, width: client.width, height: client.height });
    }
}