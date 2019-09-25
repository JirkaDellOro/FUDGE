///<reference types="../../../../Core/Build/FudgeCore"/>
///<reference path="../../../Scenes/Scenes.ts"/>
///<reference path="View.ts"/>

namespace FudgeTest {
    import ƒ = FudgeCore;
    

    /**
     * View displaying a Node and the hierarchical relation to its parents and children.  
     * Consists of a viewport and a tree-control. 
     */
    export class ViewPort extends View {
        viewport: ƒ.Viewport;
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
            let canvas: HTMLCanvasElement;
            let cmpCamera: ƒ.ComponentCamera;

            // TODO: delete example scene
            this.branch = Scenes.createAxisCross();

            // initialize RenderManager and transmit content
            ƒ.RenderManager.addBranch(this.branch);
            ƒ.RenderManager.update();

            // initialize viewport
            // TODO: create camera/canvas here without "Scenes"
            cmpCamera = Scenes.createCamera(new ƒ.Vector3(3, 3, 5));
            cmpCamera.projectCentral(1, 45);
            canvas = Scenes.createCanvas();
            document.body.appendChild(canvas);

            this.viewport = new ƒ.Viewport();
            this.viewport.initialize("ViewNode_Viewport", this.branch, cmpCamera, canvas);
            this.viewport.draw();

            this.content.append(canvas);

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
            // ƒ.RenderManager.removeBranch(this.viewport. this.viewport.getBranch());
            // this.viewport.setBranch(_node);
            // this.viewport.draw();
        }

    }
}
