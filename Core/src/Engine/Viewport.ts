namespace Fudge {
    /**
     * Represents the interface between the scenegraph, the camera and the renderingcontext.
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    export class Viewport extends EventTarget {
        private name: string; // The name to call this viewport by.
        private camera: ComponentCamera; // The camera from which's position and view the tree will be rendered.
        private rootNode: Node; // The first node in the tree(branch) that will be rendered.
        /**
         * Creates a new viewport scenetree with a passed rootnode and camera and initializes all nodes currently in the tree(branch).
         * @param _rootNode 
         * @param _camera 
         */
        public constructor(_name: string, _rootNode: Node, _camera: ComponentCamera) {
            super();
            this.name = _name;
            this.rootNode = _rootNode;
            this.camera = _camera;
            // this.initializeViewportNodes(this.rootNode);
        }

        public get Name(): string {
            return this.name;
        }
 
        /**
         * Prepares canvas for new draw, updates the worldmatrices of all nodes and calls drawObjects().
         */
        public drawScene(): void {
            if (this.camera.isActive) {
                this.prepare();
                // HACK! no need to addBranch and recalc for each viewport and frame
                WebGL.addBranch(this.rootNode);
                WebGL.drawBranch(this.rootNode, this.camera);
            }
        }

        public prepare(): void {
            this.updateCanvasDisplaySizeAndCamera(gl2.canvas);
            let backgroundColor: Vector3 = this.camera.getBackgoundColor();
            gl2.clearColor(backgroundColor.x, backgroundColor.y, backgroundColor.z, this.camera.getBackgroundEnabled() ? 1 : 0);
            gl2.clear(gl2.COLOR_BUFFER_BIT | gl2.DEPTH_BUFFER_BIT);
            // Enable backface- and zBuffer-culling.
            gl2.enable(gl2.CULL_FACE);
            gl2.enable(gl2.DEPTH_TEST);
        }

        /**
         * Logs this viewports scenegraph to the console.
         */
        public showSceneGraph(): void {
            let output: string = "SceneGraph for this viewport:";
            output += "\n \n";
            output += this.rootNode.name;
            console.log(output + "   => ROOTNODE" + this.createSceneGraph(this.rootNode));
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
         */
        private updateCanvasDisplaySizeAndCamera(canvas: HTMLCanvasElement, multiplier?: number): void {
            multiplier = multiplier || 1;
            let width: number = canvas.clientWidth * multiplier | 0;
            let height: number = canvas.clientHeight * multiplier | 0;
            if (canvas.width !== width || canvas.height !== height) {
                canvas.width = width;
                canvas.height = height;
            }
            // TODO: camera should adjust itself to resized canvas by e.g. this.camera.resize(...)
            if (this.camera.isOrthographic)
                this.camera.projectOrthographic(0, width, height, 0);
            else
                this.camera.projectCentral(width / height); //, this.camera.FieldOfView);
            gl2.viewport(0, 0, width, height);
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
