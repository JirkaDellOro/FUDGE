namespace RenderManagerRendering {
    import ƒ = Fudge;
    window.addEventListener("load", init);
    let uiMaps: { [name: string]: { ui: UI.FieldSet<null>, map: ƒ.Framing } } = {};
    let uiClient: UI.Rectangle;
    let canvas: HTMLCanvasElement;
    let viewPort: ƒ.Viewport = new ƒ.Viewport();
    let camera: ƒ.Node;
    let uiCamera: UI.Camera;

    function init(): void {
        // create asset
        let branch: ƒ.Node = Scenes.createAxisCross();
        branch.addComponent(new ƒ.ComponentTransform());

        // initialize RenderManager and transmit content
        ƒ.RenderManager.initialize();
        ƒ.RenderManager.addBranch(branch);
        ƒ.RenderManager.recalculateAllNodeTransforms();

        // initialize viewports
        canvas = document.getElementsByTagName("canvas")[0];
        camera = Scenes.createCamera(new ƒ.Vector3(1, 2, 3));
        let cmpCamera: ƒ.ComponentCamera = <ƒ.ComponentCamera>camera.getComponent(ƒ.ComponentCamera);
        viewPort.initialize(canvas.id, branch, cmpCamera, canvas);

        let menu: HTMLDivElement = document.getElementsByTagName("div")[0];
        menu.innerHTML = "Test automatic rectangle transformation. Adjust CSS-Frame and framings";
        uiCamera = new UI.Camera();
        menu.appendChild(uiCamera);

        appendUIScale(menu, "DestinationToSource", viewPort.frameDestinationToSource);
        appendUIComplex(menu, "CanvasToDestination", viewPort.frameCanvasToDestination);
        appendUIScale(menu, "ClientToCanvas", viewPort.frameClientToCanvas);

        uiClient = new UI.Rectangle("ClientRectangle");
        uiClient.addEventListener("input", hndChangeOnClient);
        menu.appendChild(uiClient);

        update();
        uiCamera.addEventListener("input", hndChangeOnCamera);
        setCamera();
        viewPort.adjustingFrames = true;

        ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, animate);
        ƒ.Loop.start();
        function animate(_event: Event): void {
            update();
            branch.cmpTransform.rotateY(1);
            ƒ.RenderManager.recalculateAllNodeTransforms();
            // prepare and draw viewport
            //viewPort.prepare();
            viewPort.draw();
        }

    }

    function appendUIComplex(_parent: HTMLElement, _name: string, _map: ƒ.FramingComplex): void {
        let uiMap: UI.FramingComplex = new UI.FramingComplex(_name);
        uiMap.addEventListener("input", hndChangeOnComplex);
        _parent.appendChild(uiMap);
        uiMaps[_name] = { ui: uiMap, map: _map };
    }
    function appendUIScale(_parent: HTMLElement, _name: string, _map: ƒ.FramingScaled): void {
        let uiMap: UI.FramingScaled = new UI.FramingScaled(_name);
        uiMap.addEventListener("input", hndChangeOnScale);
        _parent.appendChild(uiMap);
        uiMaps[_name] = { ui: uiMap, map: _map };
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
        let map: ƒ.FramingComplex = <ƒ.FramingComplex>uiMaps[_uiMap.name].map;
        for (let key in value) {
            switch (key) {
                case "Margin":
                    map.margin = <ƒ.Border>value[key];
                    break;
                case "Padding":
                    map.padding = <ƒ.Border>value[key];
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
        let map: ƒ.FramingScaled = <ƒ.FramingScaled>uiMaps[_uiMap.name].map;
        map.setScale(value.normWidth, value.normHeight);
    }

    function setCamera(): void {
        let params: UI.ParamsCamera = uiCamera.get();
        let cmpCamera: ƒ.ComponentCamera = <ƒ.ComponentCamera>camera.getComponent(ƒ.ComponentCamera);
        cmpCamera.projectCentral(params.aspect, params.fieldOfView);
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
                    let uiMap: { ui: UI.FieldSet<UI.FramingScaled>, map: ƒ.FramingScaled } = <{ ui: UI.FramingScaled, map: ƒ.FramingScaled }>uiMaps[name];
                    uiMap.ui.set(uiMap.map);
                    uiMap.ui.set({ Result: viewPort.getCanvasRectangle() });
                    break;
                }
                case "CanvasToDestination": {
                    let uiMap: { ui: UI.FieldSet<null>, map: ƒ.FramingComplex } = <{ ui: UI.FieldSet<null>, map: ƒ.FramingComplex }>uiMaps[name];
                    uiMap.ui.set({ Margin: uiMap.map.margin, Padding: uiMap.map.padding });
                    uiMap.ui.set({ Result: viewPort.rectDestination });
                    break;
                }
                case "DestinationToSource": {
                    let uiMap: { ui: UI.FramingScaled, map: ƒ.FramingScaled } = <{ ui: UI.FramingScaled, map: ƒ.FramingScaled }>uiMaps[name];
                    uiMap.ui.set(uiMap.map);
                    uiMap.ui.set({ Result: viewPort.rectSource });
                    break;
                }
            }
        }
        let clientRect: ClientRect = canvas.getBoundingClientRect();
        uiClient.set({ x: clientRect.left, y: clientRect.top, width: clientRect.width, height: clientRect.height });

        let cmpCamera: ƒ.ComponentCamera = <ƒ.ComponentCamera>camera.getComponent(ƒ.ComponentCamera);
        uiCamera.set({ aspect: cmpCamera.getAspect(), fieldOfView: cmpCamera.getFieldOfView() });
    }
}