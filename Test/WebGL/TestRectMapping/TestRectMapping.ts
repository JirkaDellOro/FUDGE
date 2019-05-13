namespace RenderManagerRendering {
    import ƒ = Fudge;
    window.addEventListener("load", init);
    let uiMaps: { [name: string]: { ui: UI.MapRectangle, map: ƒ.Framing } } = {};
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
        menu.innerHTML = "Test automatic rectangle transformation. Adjust CSS-Frame and mappings";
        uiCamera = new UI.Camera();
        menu.appendChild(uiCamera);

        appendUIMap(menu, "DestinationToSource", viewPort.frameDestinationToSource);
        appendUIMap(menu, "CanvasToDestination", viewPort.frameCanvasToDestination);
        appendUIMap(menu, "ClientToCanvas", viewPort.frameClientToCanvas);

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

    function appendUIMap(_parent: HTMLElement, _name: string, map: ƒ.Framing): void {
        let uiMap: UI.MapRectangle = new UI.MapRectangle(_name);
        uiMap.addEventListener("input", hndChangeOnMap);
        _parent.appendChild(uiMap);
        uiMaps[_name] = { ui: uiMap, map: map };
    }

    function hndChangeOnMap(_event: Event): void {
        let target: UI.MapRectangle = <UI.MapRectangle>_event.currentTarget;
        setRect(target);
    }

    function hndChangeOnCamera(_event: Event): void {
        //let target: UI.Rectangle = <UI.Rectangle>_event.currentTarget;
        setCamera();
    }

    function hndChangeOnClient(_event: Event): void {
        let target: UI.Rectangle = <UI.Rectangle>_event.currentTarget;
        setClient(target);
    }

    function setRect(_uiMap: UI.MapRectangle): void {
        let value: {} = _uiMap.get();
        let map: ƒ.Framing = uiMaps[_uiMap.name].map;
        for (let key in value) {
            switch (key) {
                case "Anchor":
                    map.normAnchor = <ƒ.Border>value[key];
                    break;
                case "Border":
                    map.pixelBorder = <ƒ.Border>value[key];
                    break;
                case "Result":
                    break;
                default:
                    throw (new Error("Invalid name: " + key));
            }
        }
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
            let uiMap: { ui: UI.MapRectangle, map: ƒ.Framing } = uiMaps[name];
            uiMap.ui.set({ Anchor: uiMap.map.normAnchor, Border: uiMap.map.pixelBorder });

            switch (name) {
                case "ClientToCanvas":
                    uiMap.ui.set({ Result: viewPort.getCanvasRectangle() });
                    break;
                case "CanvasToDestination":
                    uiMap.ui.set({ Result: viewPort.rectDestination});
                    break;
                case "DestinationToSource":
                    uiMap.ui.set({ Result: viewPort.rectSource});
                    break;
            }
        }
        let clientRect: ClientRect = canvas.getBoundingClientRect();
        uiClient.set({ x: clientRect.left, y: clientRect.top, width: clientRect.width, height: clientRect.height });

        let cmpCamera: ƒ.ComponentCamera = <ƒ.ComponentCamera>camera.getComponent(ƒ.ComponentCamera);
        uiCamera.set({ aspect: cmpCamera.getAspect(), fieldOfView: cmpCamera.getFieldOfView() });
    }
}