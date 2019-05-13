namespace Fudge {
    /**
     * Controls the rendering of a branch of a scenetree, using the given [[ComponentCamera]],
     * and the propagation of the rendered image from the offscreen renderbuffer to the target canvas
     * through a series of [[MapRectangle]] objects. The stages involved are in order of rendering
     * [[RenderManager]].viewport -> [[Viewport]].source -> [[Viewport]].destination -> DOM-Canvas -> Client(CSS)
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    export class Viewport extends EventTarget {
        private static focus: Viewport;

        public name: string = "Viewport"; // The name to call this viewport by.
        public camera: ComponentCamera = null; // The camera representing the view parameters to render the branch.
        public branch: Node = null; // The first node in the tree(branch) that will be rendered.

        public rectSource: Rectangle;
        public rectDestination: Rectangle;

        // TODO: verify if client to canvas should be in Viewport or somewhere else (Window, Container?)
        // Multiple viewports using the same canvas shouldn't differ here...
        // different framing methods can be used, this is the default
        public frameClientToCanvas: Framing = new FramingScaled();
        public frameCanvasToDestination: Framing = new FramingComplex();
        public frameDestinationToSource: Framing = new FramingScaled();
        public frameSourceToRender: Framing = new FramingScaled();

        public adjustingFrames: boolean = true;
        public adjustingCamera: boolean = true;

        private crc2: CanvasRenderingContext2D = null;
        private canvas: HTMLCanvasElement = null;



        /**
         * Creates a new viewport scenetree with a passed rootnode and camera and initializes all nodes currently in the tree(branch).
         * @param _branch 
         * @param _camera 
         */
        public initialize(_name: string, _branch: Node, _camera: ComponentCamera, _canvas: HTMLCanvasElement): void {
            this.name = _name;
            this.branch = _branch;
            this.camera = _camera;
            this.canvas = _canvas;
            this.crc2 = _canvas.getContext("2d");

            this.rectSource = RenderManager.getCanvasRect();
            this.rectDestination = this.getClientRectangle();
        }

        public getContext(): CanvasRenderingContext2D {
            return this.crc2;
        }
        public getCanvasRectangle(): Rectangle {
            return { x: 0, y: 0, width: this.canvas.width, height: this.canvas.height };
        }
        public getClientRectangle(): Rectangle {
            return { x: 0, y: 0, width: this.canvas.clientWidth, height: this.canvas.clientHeight };
        }
        /**
         * Logs this viewports scenegraph to the console.
         */
        public showSceneGraph(): void {
            // TODO: move to debug-class
            let output: string = "SceneGraph for this viewport:";
            output += "\n \n";
            output += this.branch.name;
            console.log(output + "   => ROOTNODE" + this.createSceneGraph(this.branch));
        }

        // #region Drawing
        /**
         * Prepares canvas for new draw, updates the worldmatrices of all nodes and calls drawObjects().
         */
        public draw(): void {
            if (!this.camera.isActive)
                return;
            if (this.adjustingFrames)
                this.adjustFrames();
            if (this.adjustingCamera)
                this.adjustCamera();

            // HACK! no need to addBranch and recalc for each viewport and frame
            RenderManager.clear(this.camera.getBackgoundColor());
            RenderManager.addBranch(this.branch);
            RenderManager.drawBranch(this.branch, this.camera);

            this.crc2.imageSmoothingEnabled = false;
            this.crc2.drawImage(
                RenderManager.getCanvas(),
                this.rectSource.x, this.rectSource.y, this.rectSource.width, this.rectSource.height,
                this.rectDestination.x, this.rectDestination.y, this.rectDestination.width, this.rectDestination.height
            );
        }

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

        public adjustCamera(): void {
            let rect: Rectangle = RenderManager.getViewportRectangle();
            this.camera.projectCentral(rect.width / rect.height, this.camera.getFieldOfView());
        }
        // #endregion


        // #region Events (passing from canvas to viewport and from there into branch)
        public get hasFocus(): boolean {
            return (Viewport.focus == this);
        }
        public setFocus(_on: boolean): void {
            if (_on)
                Viewport.focus = this;
            else
                Viewport.focus = null;
        }

        public activatePointerEvent(_type: EVENT_POINTER, _on: boolean): void {
            this.activateEvent(this.canvas, _type, this.hndPointerEvent, _on);
        }
        public activateKeyboardEvent(_type: EVENT_KEYBOARD, _on: boolean): void {
            this.activateEvent(this.canvas.ownerDocument, _type, this.hndKeyboardEvent, _on);
        }
        public activateDragDropEvent(_type: EVENT_DRAGDROP, _on: boolean): void {
            if (_type == EVENT_DRAGDROP.START)
                this.canvas.draggable = _on;
            this.activateEvent(this.canvas, _type, this.hndDragDropEvent, _on);
        }
        public activateWheelEvent(_type: EVENT_WHEEL, _on: boolean): void {
            this.activateEvent(this.canvas, _type, this.hndWheelEvent, _on);
        }

        private hndDragDropEvent: EventListener = (_event: Event) => {
            let _dragevent: DragDropEventƒ = <DragDropEventƒ>_event;
            switch (_dragevent.type) {
                case "dragover":
                case "drop":
                    _dragevent.preventDefault();
                    _dragevent.dataTransfer.effectAllowed = "none";
                    break;
                case "dragstart":
                    _dragevent.dataTransfer.setData("text", "Hallo");
                    // TODO: check if there is a better solution to hide the ghost image of the draggable object
                    _dragevent.dataTransfer.setDragImage(new Image(), 0, 0);
                    break;
            }
            let event: DragDropEventƒ = new DragDropEventƒ("ƒ" + _event.type, _dragevent);
            this.addCanvasPosition(event);
            this.dispatchEvent(event);
        }

        private addCanvasPosition(event: PointerEventƒ | DragDropEventƒ): void {
            event.canvasX = this.canvas.width * event.pointerX / event.clientRect.width;
            event.canvasY = this.canvas.height * event.pointerY / event.clientRect.height;
        }

        private hndPointerEvent: EventListener = (_event: Event) => {
            let event: PointerEventƒ = new PointerEventƒ("ƒ" + _event.type, <PointerEventƒ>_event);
            this.addCanvasPosition(event);
            this.dispatchEvent(event);
        }

        private hndKeyboardEvent: EventListener = (_event: Event) => {
            if (!this.hasFocus)
                return;
            let event: KeyboardEventƒ = new KeyboardEventƒ("ƒ" + _event.type, <KeyboardEventƒ>_event);
            this.dispatchEvent(event);
        }

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
        // #endregion

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

        /*/*
         * Initializes the colorbuffer for a node depending on its mesh- and materialcomponent.
         * @param _material The node's materialcomponent.
         * @param _mesh The node's meshcomponent.
         */
        // private initializeNodeMaterial(_materialComponent: ComponentMaterial, _meshComponent: ComponentMesh): void {
        //     // let colorBuffer: WebGLBuffer = GLUtil.assert<WebGLBuffer>(gl2.createBuffer());
        //     // gl2.bindBuffer(gl2.ARRAY_BUFFER, colorBuffer);
        //     // _meshComponent.applyColor(_materialComponent);
        //     //gl2.enableVertexAttribArray(colorUniformLocation);
        //     // GLUtil.attributePointer(colorUniformLocation, _materialComponent.Material.ColorBufferSpecification);
        // }

        /*/*
         * Initializes the texturebuffer for a node, depending on its mesh- and materialcomponent.
         * @param _material The node's materialcomponent.
         * @param _mesh The node's meshcomponent.
         */
        // private initializeNodeTexture(_materialComponent: ComponentMaterial, _meshComponent: ComponentMesh): void {
        //     let textureCoordinateAttributeLocation: number = _materialComponent.Material.TextureCoordinateLocation;
        //     let textureCoordinateBuffer: WebGLBuffer = gl2.createBuffer();
        //     gl2.bindBuffer(gl2.ARRAY_BUFFER, textureCoordinateBuffer);
        //     _meshComponent.setTextureCoordinates();
        //     gl2.enableVertexAttribArray(textureCoordinateAttributeLocation);
        //     GLUtil.attributePointer(textureCoordinateAttributeLocation, _materialComponent.Material.TextureBufferSpecification);
        //     GLUtil.createTexture(_materialComponent.Material.TextureSource);
        // }
    }
}
