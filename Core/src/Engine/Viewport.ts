namespace Fudge {
    /**
     * Controls the rendering of a branch of a scenetree, using the given [[ComponentCamera]],
     * and the propagation of the rendered image from the offscreen renderbuffer to the target canvas
     * through a series of [[MapRectangle]] objects. The stages involved are in order of rendering
     * [[RenderManager]].viewport -> [[Viewport]].source -> [[Viewport]].destination -> DOM-Canvas -> Client(CSS)
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    export class Viewport extends EventTarget {
        public name: string = "Viewport"; // The name to call this viewport by.
        public camera: ComponentCamera = null; // The camera from which's position and view the tree will be rendered.
        public branch: Node = null; // The first node in the tree(branch) that will be rendered.

        public rectSource: Rectangle;
        public rectDestination: Rectangle;

        // TODO: verify if client to canvas should be in Viewport or somewhere else (Window, Container?)
        // Multiple viewports using the same canvas shouldn't differ here...
        public mapClientToCanvas: MapRectangle = new MapRectangle();
        public mapCanvasToDestination: MapRectangle = new MapRectangle();
        public mapDestinationToSource: MapRectangle = new MapRectangle();
        public mapSourceToRender: MapRectangle = new MapRectangle();

        public mappingRects: boolean = true;
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
            this.rectDestination = this.getCanvasRectangle();
        }

        public getContext(): CanvasRenderingContext2D {
            return this.crc2;
        }
        public getCanvasRectangle(): Rectangle {
            return { x: 0, y: 0, width: this.canvas.width, height: this.canvas.height };
        }

        /**
         * Prepares canvas for new draw, updates the worldmatrices of all nodes and calls drawObjects().
         */
        public draw(): void {
            if (!this.camera.isActive)
                return;
            if (this.mappingRects)
                this.mapRectangles();
            if (this.adjustingCamera)
                this.adjustCamera();
                
            // HACK! no need to addBranch and recalc for each viewport and frame
            RenderManager.clear(this.camera.getBackgoundColor());
            RenderManager.addBranch(this.branch);
            RenderManager.drawBranch(this.branch, this.camera);

            // TODO: provide for rendering on only a part of canvas, viewport share common canvas
            // let rectSource: Rectangle = WebGLApi.getCanvasRect();
            // let rectDestination: Rectangle = this.getCanvasRectangle();
            this.crc2.imageSmoothingEnabled = false;
            this.crc2.drawImage(
                RenderManager.getCanvas(),
                this.rectSource.x, this.rectSource.y, this.rectSource.width, this.rectSource.height,
                this.rectDestination.x, this.rectDestination.y, this.rectDestination.width, this.rectDestination.height
            );
            // this.crc2.drawImage(
            //     WebGLApi.crc3.canvas,
            //     rectSource.x, rectSource.y, rectSource.width, rectSource.height,
            //     rectDestination.x, rectDestination.y, rectDestination.width, rectDestination.height
            // );
        }


        public mapRectangles(): void {
            let rectCanvas: Rectangle = this.mapClientToCanvas.getRect({ x: 0, y: 0, width: this.canvas.clientWidth, height: this.canvas.clientHeight });
            this.canvas.width = rectCanvas.width;
            this.canvas.height = rectCanvas.height;
            this.rectDestination = this.mapCanvasToDestination.getRect(rectCanvas);
            this.rectSource = this.mapDestinationToSource.getRect(this.rectDestination);
            // having an offset source does make sense only when multiple viewports display parts of the same rendering. For now: shift it to 0,0
            this.rectSource.x = this.rectSource.y = 0;
            // still, a partial image of the rendering may be retrieved by moving and resizing the render viewport
            let rectRender: Rectangle = this.mapSourceToRender.getRect(this.rectSource);
            RenderManager.setViewportRectangle(rectRender);
            RenderManager.setCanvasSize(rectRender.width, rectRender.height);
        }
        public adjustCamera(): void {
            // this.updateCanvasDisplaySizeAndCamera(this.canvas);
            //this.camera.projectCentral(1); // square
        }

        /**
         * Logs this viewports scenegraph to the console.
         */
        public showSceneGraph(): void {
            let output: string = "SceneGraph for this viewport:";
            output += "\n \n";
            output += this.branch.name;
            console.log(output + "   => ROOTNODE" + this.createSceneGraph(this.branch));
        }

        /**
         * Creates an outputstring as visual representation of this viewports scenegraph. Called for the passed node and recursive for all its children.
         * @param _fudgeNode The node to create a scenegraphentry for.
         */
        private createSceneGraph(_fudgeNode: Node): string {
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

        /**
         * Updates the displaysize of the passed canvas depending on the client's size and an optional multiplier.
         * Adjusts the viewports camera and the renderingcontexts viewport to fit the canvassize.
         * @param canvas The canvas to readjust.
         * @param multiplier A multiplier to adjust the displayzise dimensions by.
         * /
        private updateCanvasDisplaySizeAndCamera(canvas: HTMLCanvasElement, multiplier?: number): void {
            let resolutionFactor: number = 1.0;
            multiplier = multiplier || 1;
            let width: number = canvas.clientWidth * multiplier | 0;
            let height: number = canvas.clientHeight * multiplier | 0;
            if (canvas.width !== width || canvas.height !== height) {
                canvas.width = width;
                canvas.height = height;
            }
            WebGLApi.setCanvasSize(resolutionFactor * width, resolutionFactor * height);
            // TODO: camera should adjust itself to resized canvas by e.g. this.camera.resize(...)
            if (this.camera.isOrthographic)
                this.camera.projectOrthographic(0, width, height, 0);
            else
                this.camera.projectCentral(width / height); //, this.camera.FieldOfView);
            WebGLApi.crc3.viewport(0, 0, resolutionFactor * width, resolutionFactor * height);
        }
        */

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
