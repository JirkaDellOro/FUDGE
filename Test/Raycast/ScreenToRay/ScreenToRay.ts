namespace ScreenToRay {
    import ƒ = FudgeCore;
    window.addEventListener("load", init);
    let uiMaps: { [name: string]: { ui: UI.FieldSet<null>, framing: ƒ.Framing } } = {};
    let uiClient: UI.Rectangle;
    let menu: HTMLDivElement;

    let canvas: HTMLCanvasElement;
    let viewport: ƒ.Viewport = new ƒ.Viewport();
    let cmpCamera: ƒ.ComponentCamera;
    let uiCamera: UI.Camera;

    let mouse: ƒ.Vector2 = new ƒ.Vector2();
    let viewportRay: ƒ.Viewport = new ƒ.Viewport();
    let cameraRay: ƒ.ComponentCamera;
    let canvasRay: HTMLCanvasElement;

    function init(): void {
        // create asset
        let branch: ƒ.Node = Scenes.createAxisCross();
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
        let cmpCameraRay: ƒ.ComponentCamera = cameraRay;
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

        
        viewport.createPickBuffers();
        ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, animate);
        ƒ.Loop.start();
        // animate(null);

        function animate(_event: Event): void {
            update();
            ƒ.RenderManager.update();
            viewport.draw();
            adjustRayCamera();
            pickNodeAt(mouse);
            // let color: ƒ.Color = getPixelColor(mouse);           
        }
    }

    function getPixelColor(_pos: ƒ.Vector2): ƒ.Color {
        let color: ƒ.Color = new ƒ.Color(1, 1, 1, 1);
        let crc2: CanvasRenderingContext2D = canvas.getContext("2d");
        color.setArrayBytesRGBA(crc2.getImageData(_pos.x, _pos.y, 1, 1).data);
        return color;
    }

    function pickNodeAt(_pos: ƒ.Vector2): void {
        let posRender: ƒ.Vector2 = viewport.pointClientToRender(
            new ƒ.Vector2(_pos.x, viewport.getClientRectangle().height - _pos.y)
        );
        let output: HTMLOutputElement = document.querySelector("output");
        output.innerHTML = "";
        let hits: ƒ.RayHit[] = viewport.pickNodeAt(posRender);
        for (let hit of hits)
            output.innerHTML += hit.node.name + ":" + hit.zBuffer + "<br/>";
    }

    function adjustRayCamera(): void {
        let ray: ƒ.Ray = computeRay();
        // ray.direction.x *= 5;
        // ray.direction.y *= 5;
        ray.direction.transform(cmpCamera.pivot);
        cameraRay.pivot.lookAt(ray.direction);
        cameraRay.projectCentral(1, 10);
        viewportRay.draw();

        let crcRay: CanvasRenderingContext2D = canvasRay.getContext("2d");
        crcRay.translate(crcRay.canvas.width / 2, crcRay.canvas.height / 2);
        crcRay.strokeStyle = "white";
        crcRay.strokeRect(-10, -10, 20, 20);
    }

    function computeRay(): ƒ.Ray {
        let rect: ƒ.Rectangle = viewport.getClientRectangle();
        // let posMouse: ƒ.Vector2 = ƒ.Vector2.DIFFERENCE(mouse, new ƒ.Vector2(rect.width / 2, rect.height / 2));
        // posMouse.y *= -1;
        let posMouse: ƒ.Vector2 = mouse.copy;
        setUiPoint("Client", posMouse);

        let posRender: ƒ.Vector2 = viewport.pointClientToRender(posMouse);
        setUiPoint("Render", posRender);

        let result: ƒ.Vector2;
        rect = viewport.getClientRectangle();
        result = viewport.frameClientToCanvas.getPoint(posMouse, rect);
        setUiPoint("Canvas", result);
        rect = viewport.getCanvasRectangle();
        result = viewport.frameCanvasToDestination.getPoint(result, rect);
        setUiPoint("Destination", result);
        result = viewport.frameDestinationToSource.getPoint(result, viewport.rectSource);
        setUiPoint("Source", result);
        //TODO: when Source, Render and RenderViewport deviate, continue transformation 

        let rectRender: ƒ.Rectangle = viewport.frameSourceToRender.getRect(viewport.rectSource);
        let rectProjection: ƒ.Rectangle = cmpCamera.getProjectionRectangle();

        let posProjection: ƒ.Vector2 = new ƒ.Vector2(
            (2 * posRender.x / rectRender.width) * rectProjection.width / 2,
            (2 * posRender.y / rectRender.height) * rectProjection.height / 2
        );

        posProjection.subtract(new ƒ.Vector2(rectProjection.width / 2, rectProjection.height / 2));
        posProjection.y *= -1;

        setUiPoint("Projection", posProjection);

        let ray: ƒ.Ray = new ƒ.Ray(new ƒ.Vector3(posProjection.x, posProjection.y, -1));
        return ray;
    }

    function setCursorPosition(_event: MouseEvent): void {
        mouse = new ƒ.Vector2(_event.clientX, _event.clientY);
    }

    function setUiPoint(_name: string, _point: ƒ.Vector2): void {
        let uiPoint: UI.Point;
        uiPoint = menu.querySelector("fieldset[name=" + _name + "]");
        uiPoint.set(_point.getMutator());
    }

    function logMutatorInfo(_title: string, _mutable: ƒ.Mutable): void {
        let mutator: ƒ.Mutator = _mutable.getMutator();
        let types: ƒ.MutatorAttributeTypes = _mutable.getMutatorAttributeTypes(mutator);
        console.group(_title);
        console.log("Types: ", types);
        console.log("Mutator: ", mutator);
        console.groupEnd();
    }

    function appendUIComplex(_parent: HTMLElement, _name: string, _framing: ƒ.FramingComplex): void {
        let uiMap: UI.FramingComplex = new UI.FramingComplex(_name);
        uiMap.addEventListener("input", hndChangeOnComplex);
        _parent.appendChild(uiMap);
        uiMaps[_name] = { ui: uiMap, framing: _framing };
    }
    function appendUIScale(_parent: HTMLElement, _name: string, _framing: ƒ.FramingScaled): void {
        let uiMap: UI.FramingScaled = new UI.FramingScaled(_name);
        uiMap.addEventListener("input", hndChangeOnScale);
        _parent.appendChild(uiMap);
        uiMaps[_name] = { ui: uiMap, framing: _framing };
    }

    function hndChangeOnComplex(_event: Event): void {
        let target: UI.FramingComplex = <UI.FramingComplex>_event.currentTarget;
        setRectComplex(target);
    }
    function hndChangeOnScale(_event: Event): void {
        let target: UI.FramingScaled = <UI.FramingScaled>_event.currentTarget;
        setRectScale(target);
    }
    function hndChangeOnCamera(_event: Event): void {
        //let target: UI.Rectangle = <UI.Rectangle>_event.currentTarget;
        setCamera();
    }

    function hndChangeOnClient(_event: Event): void {
        let target: UI.Rectangle = <UI.Rectangle>_event.currentTarget;
        setClient(target);
    }

    function setRectComplex(_uiMap: UI.FramingComplex): void {
        let value: {} = _uiMap.get();
        let framing: ƒ.FramingComplex = <ƒ.FramingComplex>uiMaps[_uiMap.name].framing;
        for (let key in value) {
            switch (key) {
                case "Margin":
                    framing.margin = <ƒ.Border>value[key];
                    break;
                case "Padding":
                    framing.padding = <ƒ.Border>value[key];
                    break;
                case "Result":
                    break;
                default:
                    throw (new Error("Invalid name: " + key));
            }
        }
    }

    function setRectScale(_uiMap: UI.FramingScaled): void {
        let value: { normWidth: number, normHeight: number } = <{ normWidth: number, normHeight: number }>_uiMap.get();
        let framing: ƒ.FramingScaled = <ƒ.FramingScaled>uiMaps[_uiMap.name].framing;
        framing.setScale(value.normWidth, value.normHeight);
    }

    function setCamera(): void {
        let params: UI.ParamsCamera = uiCamera.get();
        cmpCamera.projectCentral(params.aspect, params.fieldOfView); //, ƒ.FIELD_OF_VIEW.HORIZONTAL);
    }

    function setClient(_uiRectangle: UI.Rectangle): void {
        let rect: ƒ.Rectangle = <ƒ.Rectangle>_uiRectangle.get();
        canvas.style.left = rect.x + "px";
        canvas.style.top = rect.y + "px";
        canvas.style.width = rect.width + "px";
        canvas.style.height = rect.height + "px";
    }

    function update(): void {
        for (let name in uiMaps) {
            // uiMap.ui.set({ Margin: uiMap.map.margin, Padding: uiMap.map.padding });

            switch (name) {
                case "ClientToCanvas": {
                    let uiMap: { ui: UI.FieldSet<UI.FramingScaled>, framing: ƒ.FramingScaled } = <{ ui: UI.FramingScaled, framing: ƒ.FramingScaled }>uiMaps[name];
                    uiMap.ui.set(uiMap.framing);
                    uiMap.ui.set({ Result: viewport.getCanvasRectangle() });
                    break;
                }
                case "CanvasToDestination": {
                    let uiMap: { ui: UI.FieldSet<null>, framing: ƒ.FramingComplex } = <{ ui: UI.FieldSet<null>, framing: ƒ.FramingComplex }>uiMaps[name];
                    uiMap.ui.set({ Margin: uiMap.framing.margin, Padding: uiMap.framing.padding });
                    uiMap.ui.set({ Result: viewport.rectDestination });
                    break;
                }
                case "DestinationToSource": {
                    let uiMap: { ui: UI.FramingScaled, framing: ƒ.FramingScaled } = <{ ui: UI.FramingScaled, framing: ƒ.FramingScaled }>uiMaps[name];
                    uiMap.ui.set(uiMap.framing);
                    uiMap.ui.set({ Result: viewport.rectSource });
                    break;
                }
            }
        }
        let clientRect: ClientRect = canvas.getBoundingClientRect();
        uiClient.set(ƒ.Rectangle.GET(clientRect.left, clientRect.top, clientRect.width, clientRect.height));

        uiCamera.set({ aspect: cmpCamera.getAspect(), fieldOfView: cmpCamera.getFieldOfView() });
    }
}