namespace ScreenToRay {
    import ƒ = FudgeCore;
    window.addEventListener("load", init);
    let uiMaps: { [name: string]: { ui: UI.FieldSet<null>, framing: ƒ.Framing } } = {};
    let uiClient: UI.Rectangle;
    let canvas: HTMLCanvasElement;
    let viewport: ƒ.Viewport = new ƒ.Viewport();
    let camera: ƒ.Node;
    let uiCamera: UI.Camera;
    let mouse: ƒ.Vector2 = new ƒ.Vector2();

    function init(): void {
        // create asset
        let branch: ƒ.Node = Scenes.createAxisCross();
        branch.addComponent(new ƒ.ComponentTransform());

        // initialize RenderManager and transmit content
        ƒ.RenderManager.initialize();
        ƒ.RenderManager.addBranch(branch);
        ƒ.RenderManager.update();

        // initialize viewports
        canvas = document.getElementsByTagName("canvas")[0];
        camera = Scenes.createCamera(new ƒ.Vector3(1, 2, 3));
        let cmpCamera: ƒ.ComponentCamera = camera.getComponent(ƒ.ComponentCamera);
        viewport.initialize(canvas.id, branch, cmpCamera, canvas);
        canvas.addEventListener("mousemove", setCursorPosition);

        let menu: HTMLDivElement = document.getElementsByTagName("div")[0];
        menu.innerHTML = "Test automatic rectangle transformation. Adjust CSS-Frame and framings";
        uiCamera = new UI.Camera();
        menu.appendChild(uiCamera);

        appendUIScale(menu, "DestinationToSource", viewport.frameDestinationToSource);
        appendUIComplex(menu, "CanvasToDestination", viewport.frameCanvasToDestination);
        appendUIScale(menu, "ClientToCanvas", viewport.frameClientToCanvas);

        uiClient = new UI.Rectangle("ClientRectangle");
        uiClient.addEventListener("input", hndChangeOnClient);
        menu.appendChild(uiClient);

        update();
        uiCamera.addEventListener("input", hndChangeOnCamera);
        setCamera();
        viewport.adjustingFrames = true;

        logMutatorInfo("Camera", cmpCamera);
        for (let name in uiMaps) {
            logMutatorInfo(name, uiMaps[name].framing);
        }

        ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, animate);
        ƒ.Loop.start();
        function animate(_event: Event): void {
            update();
            branch.cmpTransform.local.rotateY(1);
            ƒ.RenderManager.update();
            viewport.draw();

            computeRay();
        }

    }

    function computeRay(): ƒ.Ray {
        let rect: ƒ.Rectangle = viewport.getClientRectangle();
        let posMouse: ƒ.Vector2 = ƒ.Vector2.DIFFERENCE(mouse, new ƒ.Vector2(rect.width / 2, rect.height / 2));
        let posRender: ƒ.Vector2 = viewport.pointClientToRender(posMouse);
        let rectRender: ƒ.Rectangle = viewport.frameSourceToRender.getRect(viewport.rectSource);

        let cmpCamera: ƒ.ComponentCamera = camera.getComponent(ƒ.ComponentCamera);
        let rectProjection: ƒ.Rectangle = cmpCamera.getProjectionRectangle();

        let posProjection: ƒ.Vector2 = new ƒ.Vector2(
            (2 * posRender.x / rectRender.width) * rectProjection.width / 2,
            (2 * posRender.y / rectRender.height) * rectProjection.height / 2
        );


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
        ƒ.Debug.info("Point", posProjection.get());

        let ray: ƒ.Ray = new ƒ.Ray(new ƒ.Vector3(posProjection.x, posProjection.y, -1));
        return ray;
    }

    function setCursorPosition(_event: MouseEvent): void {
        mouse = new ƒ.Vector2(_event.clientX, _event.clientY);
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
        let cmpCamera: ƒ.ComponentCamera = camera.getComponent(ƒ.ComponentCamera);
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
        uiClient.set({ x: clientRect.left, y: clientRect.top, width: clientRect.width, height: clientRect.height });

        let cmpCamera: ƒ.ComponentCamera = camera.getComponent(ƒ.ComponentCamera);
        uiCamera.set({ aspect: cmpCamera.getAspect(), fieldOfView: cmpCamera.getFieldOfView() });
    }
}