/// <reference path="../Light/Light.ts"/>
/// <reference path="../Component/ComponentLight.ts"/>
namespace FudgeCore {
    export type MapLightTypeToLightList = Map<string, ComponentLight[]>;
    /**
     * Controls the rendering of a branch of a scenetree, using the given [[ComponentCamera]],
     * and the propagation of the rendered image from the offscreen renderbuffer to the target canvas
     * through a series of [[Framing]] objects. The stages involved are in order of rendering
     * [[RenderManager]].viewport -> [[Viewport]].source -> [[Viewport]].destination -> DOM-Canvas -> Client(CSS)
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    export class Viewport extends EventTarget {
        private static focus: Viewport;

        public name: string = "Viewport"; // The name to call this viewport by.
        public camera: ComponentCamera = null; // The camera representing the view parameters to render the branch.

        public rectSource: Rectangle;
        public rectDestination: Rectangle;

        // TODO: verify if client to canvas should be in Viewport or somewhere else (Window, Container?)
        // Multiple viewports using the same canvas shouldn't differ here...
        // different framing methods can be used, this is the default
        public frameClientToCanvas: FramingScaled = new FramingScaled();
        public frameCanvasToDestination: FramingComplex = new FramingComplex();
        public frameDestinationToSource: FramingScaled = new FramingScaled();
        public frameSourceToRender: FramingScaled = new FramingScaled();

        public adjustingFrames: boolean = true;
        public adjustingCamera: boolean = true;

        public lights: MapLightTypeToLightList = null;

        private branch: Node = null; // The first node in the tree(branch) that will be rendered.
        private crc2: CanvasRenderingContext2D = null;
        private canvas: HTMLCanvasElement = null;
        private pickBuffers: PickBuffer[] = [];

        /**
         * Connects the viewport to the given canvas to render the given branch to using the given camera-component, and names the viewport as given.
         * @param _name 
         * @param _branch 
         * @param _camera 
         * @param _canvas 
         */
        public initialize(_name: string, _branch: Node, _camera: ComponentCamera, _canvas: HTMLCanvasElement): void {
            this.name = _name;
            this.camera = _camera;
            this.canvas = _canvas;
            this.crc2 = _canvas.getContext("2d");

            this.rectSource = RenderManager.getCanvasRect();
            this.rectDestination = this.getClientRectangle();

            this.setBranch(_branch);
        }
        /**
         * Retrieve the 2D-context attached to the destination canvas
         */
        public getContext(): CanvasRenderingContext2D {
            return this.crc2;
        }
        /**
         * Retrieve the size of the destination canvas as a rectangle, x and y are always 0 
         */
        public getCanvasRectangle(): Rectangle {
            return Rectangle.get(0, 0, this.canvas.width, this.canvas.height);
        }
        /**
         * Retrieve the client rectangle the canvas is displayed and fit in, x and y are always 0 
         */
        public getClientRectangle(): Rectangle {
            return Rectangle.get(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);
        }

        /**
         * Set the branch to be drawn in the viewport.
         */
        public setBranch(_branch: Node): void {
            if (this.branch) {
                this.branch.removeEventListener(EVENT.COMPONENT_ADD, this.hndComponentEvent);
                this.branch.removeEventListener(EVENT.COMPONENT_REMOVE, this.hndComponentEvent);
            }
            this.branch = _branch;
            this.collectLights();
            this.branch.addEventListener(EVENT.COMPONENT_ADD, this.hndComponentEvent);
            this.branch.addEventListener(EVENT.COMPONENT_REMOVE, this.hndComponentEvent);
        }
        /**
         * Logs this viewports scenegraph to the console.
         */
        public showSceneGraph(): void {
            // TODO: move to debug-class
            let output: string = "SceneGraph for this viewport:";
            output += "\n \n";
            output += this.branch.name;
            Debug.log(output + "   => ROOTNODE" + this.createSceneGraph(this.branch));
        }

        // #region Drawing
        /**
         * Draw this viewport
         */
        public draw(): void {
            RenderManager.resetFrameBuffer();
            if (!this.camera.isActive)
                return;
            if (this.adjustingFrames)
                this.adjustFrames();
            if (this.adjustingCamera)
                this.adjustCamera();

            RenderManager.clear(this.camera.getBackgoundColor());
            if (RenderManager.addBranch(this.branch))
                // branch has not yet been processed fully by rendermanager -> update all registered nodes
                RenderManager.update();
            RenderManager.setLights(this.lights);
            RenderManager.drawBranch(this.branch, this.camera);

            this.crc2.imageSmoothingEnabled = false;
            this.crc2.drawImage(
                RenderManager.getCanvas(),
                this.rectSource.x, this.rectSource.y, this.rectSource.width, this.rectSource.height,
                this.rectDestination.x, this.rectDestination.y, this.rectDestination.width, this.rectDestination.height
            );
        }

        /**
        * Draw this viewport for RayCast
        */
        public createPickBuffers(): void {
            if (this.adjustingFrames)
                this.adjustFrames();
            if (this.adjustingCamera)
                this.adjustCamera();

            if (RenderManager.addBranch(this.branch))
                // branch has not yet been processed fully by rendermanager -> update all registered nodes
                RenderManager.update();

            this.pickBuffers = RenderManager.drawBranchForRayCast(this.branch, this.camera);

            this.crc2.imageSmoothingEnabled = false;
            this.crc2.drawImage(
                RenderManager.getCanvas(),
                this.rectSource.x, this.rectSource.y, this.rectSource.width, this.rectSource.height,
                this.rectDestination.x, this.rectDestination.y, this.rectDestination.width, this.rectDestination.height
            );
        }


        public pickNodeAt(_pos: Vector2): RayHit[] {
            // this.createPickBuffers();
            let hits: RayHit[] = RenderManager.pickNodeAt(_pos, this.pickBuffers, this.rectSource);
            hits.sort((a: RayHit, b: RayHit) => (b.zBuffer > 0) ? (a.zBuffer > 0) ? a.zBuffer - b.zBuffer : 1 : -1);
            return hits;
        }

        /**
         * Adjust all frames involved in the rendering process from the display area in the client up to the renderer canvas
         */
        public adjustFrames(): void {
            // get the rectangle of the canvas area as displayed (consider css)
            let rectClient: Rectangle = this.getClientRectangle();
            // adjust the canvas size according to the given framing applied to client
            let rectCanvas: Rectangle = this.frameClientToCanvas.getRect(rectClient);
            this.canvas.width = rectCanvas.width;
            this.canvas.height = rectCanvas.height;
            // adjust the destination area on the target-canvas to render to by applying the framing to canvas
            this.rectDestination = this.frameCanvasToDestination.getRect(rectCanvas);
            // adjust the area on the source-canvas to render from by applying the framing to destination area
            this.rectSource = this.frameDestinationToSource.getRect(this.rectDestination);
            // having an offset source does make sense only when multiple viewports display parts of the same rendering. For now: shift it to 0,0
            this.rectSource.x = this.rectSource.y = 0;
            // still, a partial image of the rendering may be retrieved by moving and resizing the render viewport
            let rectRender: Rectangle = this.frameSourceToRender.getRect(this.rectSource);
            RenderManager.setViewportRectangle(rectRender);
            // no more transformation after this for now, offscreen canvas and render-viewport have the same size
            RenderManager.setCanvasSize(rectRender.width, rectRender.height);
        }
        /**
         * Adjust the camera parameters to fit the rendering into the render vieport
         */
        public adjustCamera(): void {
            let rect: Rectangle = RenderManager.getViewportRectangle();
            this.camera.projectCentral(rect.width / rect.height, this.camera.getFieldOfView());
        }
        // #endregion

        //#region Points
        public pointClientToSource(_client: Vector2): Vector2 {
            let result: Vector2;
            let rect: Rectangle;
            rect = this.getClientRectangle();
            result = this.frameClientToCanvas.getPoint(_client, rect);
            rect = this.getCanvasRectangle();
            result = this.frameCanvasToDestination.getPoint(result, rect);
            result = this.frameDestinationToSource.getPoint(result, this.rectSource);
            //TODO: when Source, Render and RenderViewport deviate, continue transformation 
            return result;
        }

        public pointSourceToRender(_source: Vector2): Vector2 {
            let projectionRectangle: Rectangle = this.camera.getProjectionRectangle();
            let point: Vector2 = this.frameSourceToRender.getPoint(_source, projectionRectangle);
            return point;
        }

        public pointClientToRender(_client: Vector2): Vector2 {
            let point: Vector2 = this.pointClientToSource(_client);
            point = this.pointSourceToRender(point);
            //TODO: when Render and RenderViewport deviate, continue transformation 
            return point;
        }

        //#endregion

        // #region Events (passing from canvas to viewport and from there into branch)
        /**
         * Returns true if this viewport currently has focus and thus receives keyboard events
         */
        public get hasFocus(): boolean {
            return (Viewport.focus == this);
        }
        /**
         * Switch the viewports focus on or off. Only one viewport in one FUDGE instance can have the focus, thus receiving keyboard events. 
         * So a viewport currently having the focus will lose it, when another one receives it. The viewports fire [[Event]]s accordingly.
         *  
         * @param _on 
         */
        public setFocus(_on: boolean): void {
            if (_on) {
                if (Viewport.focus == this)
                    return;
                if (Viewport.focus)
                    Viewport.focus.dispatchEvent(new Event(EVENT.FOCUS_OUT));
                Viewport.focus = this;
                this.dispatchEvent(new Event(EVENT.FOCUS_IN));
            }
            else {
                if (Viewport.focus != this)
                    return;

                this.dispatchEvent(new Event(EVENT.FOCUS_OUT));
                Viewport.focus = null;
            }
        }
        /**
         * De- / Activates the given pointer event to be propagated into the viewport as FUDGE-Event 
         * @param _type 
         * @param _on 
         */
        public activatePointerEvent(_type: EVENT_POINTER, _on: boolean): void {
            this.activateEvent(this.canvas, _type, this.hndPointerEvent, _on);
        }
        /**
         * De- / Activates the given keyboard event to be propagated into the viewport as FUDGE-Event
         * @param _type 
         * @param _on 
         */
        public activateKeyboardEvent(_type: EVENT_KEYBOARD, _on: boolean): void {
            this.activateEvent(this.canvas.ownerDocument, _type, this.hndKeyboardEvent, _on);
        }
        /**
         * De- / Activates the given drag-drop event to be propagated into the viewport as FUDGE-Event
         * @param _type 
         * @param _on 
         */
        public activateDragDropEvent(_type: EVENT_DRAGDROP, _on: boolean): void {
            if (_type == EVENT_DRAGDROP.START)
                this.canvas.draggable = _on;
            this.activateEvent(this.canvas, _type, this.hndDragDropEvent, _on);
        }
        /**
         * De- / Activates the wheel event to be propagated into the viewport as FUDGE-Event
         * @param _type 
         * @param _on 
         */
        public activateWheelEvent(_type: EVENT_WHEEL, _on: boolean): void {
            this.activateEvent(this.canvas, _type, this.hndWheelEvent, _on);
        }
        /**
         * Handle drag-drop events and dispatch to viewport as FUDGE-Event
         */
        private hndDragDropEvent: EventListener = (_event: Event) => {
            let _dragevent: DragDropEventƒ = <DragDropEventƒ>_event;
            switch (_dragevent.type) {
                case "dragover":
                case "drop":
                    _dragevent.preventDefault();
                    _dragevent.dataTransfer.effectAllowed = "none";
                    break;
                case "dragstart":
                    // just dummy data,  valid data should be set in handler registered by the user
                    _dragevent.dataTransfer.setData("text", "Hallo");
                    // TODO: check if there is a better solution to hide the ghost image of the draggable object
                    _dragevent.dataTransfer.setDragImage(new Image(), 0, 0);
                    break;
            }
            let event: DragDropEventƒ = new DragDropEventƒ("ƒ" + _event.type, _dragevent);
            this.addCanvasPosition(event);
            this.dispatchEvent(event);
        }
        /**
         * Add position of the pointer mapped to canvas-coordinates as canvasX, canvasY to the event
         * @param event
         */
        private addCanvasPosition(event: PointerEventƒ | DragDropEventƒ): void {
            event.canvasX = this.canvas.width * event.pointerX / event.clientRect.width;
            event.canvasY = this.canvas.height * event.pointerY / event.clientRect.height;
        }
        /**
         * Handle pointer events and dispatch to viewport as FUDGE-Event
         */
        private hndPointerEvent: EventListener = (_event: Event) => {
            let event: PointerEventƒ = new PointerEventƒ("ƒ" + _event.type, <PointerEventƒ>_event);
            this.addCanvasPosition(event);
            this.dispatchEvent(event);
        }
        /**
         * Handle keyboard events and dispatch to viewport as FUDGE-Event, if the viewport has the focus
         */
        private hndKeyboardEvent: EventListener = (_event: Event) => {
            if (!this.hasFocus)
                return;
            let event: KeyboardEventƒ = new KeyboardEventƒ("ƒ" + _event.type, <KeyboardEventƒ>_event);
            this.dispatchEvent(event);
        }
        /**
         * Handle wheel event and dispatch to viewport as FUDGE-Event
         */
        private hndWheelEvent: EventListener = (_event: Event) => {
            let event: WheelEventƒ = new WheelEventƒ("ƒ" + _event.type, <WheelEventƒ>_event);
            this.dispatchEvent(event);
        }

        private activateEvent(_target: EventTarget, _type: string, _handler: EventListener, _on: boolean): void {
            _type = _type.slice(1); // chip the ƒlorentin
            if (_on)
                _target.addEventListener(_type, _handler);
            else
                _target.removeEventListener(_type, _handler);
        }

        private hndComponentEvent(_event: Event): void {
            Debug.log(_event);
        }
        // #endregion

        /**
         * Collect all lights in the branch to pass to shaders
         */
        private collectLights(): void {
            // TODO: make private
            this.lights = new Map();
            for (let node of this.branch.branch) {
                let cmpLights: ComponentLight[] = node.getComponents(ComponentLight);
                for (let cmpLight of cmpLights) {
                    let type: string = cmpLight.getLight().type;
                    let lightsOfType: ComponentLight[] = this.lights.get(type);
                    if (!lightsOfType) {
                        lightsOfType = [];
                        this.lights.set(type, lightsOfType);
                    }
                    lightsOfType.push(cmpLight);
                }
            }
        }
        /**
         * Creates an outputstring as visual representation of this viewports scenegraph. Called for the passed node and recursive for all its children.
         * @param _fudgeNode The node to create a scenegraphentry for.
         */
        private createSceneGraph(_fudgeNode: Node): string {
            // TODO: move to debug-class
            let output: string = "";
            for (let name in _fudgeNode.getChildren()) {
                let child: Node = _fudgeNode.getChildren()[name];
                output += "\n";
                let current: Node = child;
                if (current.getParent() && current.getParent().getParent())
                    output += "|";
                while (current.getParent() && current.getParent().getParent()) {
                    output += "   ";
                    current = current.getParent();
                }
                output += "'--";

                output += child.name;
                output += this.createSceneGraph(child);
            }
            return output;
        }
    }
}
