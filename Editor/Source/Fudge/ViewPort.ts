///<reference types="../../../Core/Build/FudgeCore"/>
///<reference types="../../Examples/Code/Scenes"/>
///<reference path="View.ts"/>

namespace Fudge {
    import ƒ = FudgeCore;


    /**
     * View displaying a Node and the hierarchical relation to its parents and children.  
     * Consists of a viewport and a tree-control. 
     */
    export class ViewViewport extends View {
        viewport: ƒ.Viewport;
        canvas: HTMLCanvasElement;
        branch: ƒ.Node;

        constructor(_parent: Panel) {
            super(_parent);
            this.fillContent();
        }
        deconstruct(): void {
            //TODO: desconstruct
        }

        fillContent(): void {
            this.branch = new ƒ.Node("Dummy Node");

            let camera: ƒ.Node;

            // TODO: delete example scene
            // this.branch = Scenes.createAxisCross();

            // initialize RenderManager and transmit content
            ƒ.RenderManager.addBranch(this.branch);
            ƒ.RenderManager.update();

            // initialize viewport
            // TODO: create camera/canvas here without "Scenes"
            camera = Scenes.createCamera(new ƒ.Vector3(3, 3, 5));
            let cmpCamera: ƒ.ComponentCamera = camera.getComponent(ƒ.ComponentCamera);
            cmpCamera.projectCentral(1, 45);
            this.canvas = Scenes.createCanvas();
            document.body.appendChild(this.canvas);

            this.viewport = new ƒ.Viewport();
            this.viewport.initialize("ViewNode_Viewport", this.branch, cmpCamera, this.canvas);
            this.viewport.draw();

            this.content.append(this.canvas);
            
            ƒ.Loop.start(ƒ.LOOP_MODE.TIME_REAL);
            ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, this.animate);

            // TODO: if each Panel creates its own instance of GoldenLayout, containers may emit directly to their LayoutManager and no registration is required
            // Panel.goldenLayout.emit("registerView", _container);

            // _container.on("setRoot", (_node: ƒ.Node): void => {
            //     ƒ.Debug.log("Set root", _node);
            //     this.setRoot(_node);
            // });
        }


        /**
         * Set the root node for display in this view
         * @param _node 
         */
        public setRoot(_node: ƒ.Node): void {
            if (!_node)
                return;
            ƒ.Debug.log("Trying to display node: ", _node);
            // ƒ.RenderManager.removeBranch(this.branch);
            this.branch = _node;
            // ƒ.RenderManager.addBranch(this.branch);
            // ƒ.RenderManager.update();
            this.viewport.setBranch(this.branch);

        }
        //TODO
        private animate = (_e: Event) => {
            this.viewport.setBranch(this.branch);
            ƒ.RenderManager.update();
            if (this.canvas.clientHeight > 0 && this.canvas.clientWidth > 0)
                this.viewport.draw();
        }
    }
}
