///<reference types="../../../../Core/Build/FudgeCore"/>
///<reference path="../../../Scenes/Scenes.ts"/>
///<reference path="View.ts"/>

namespace FudgeTest {
    import ƒ = FudgeCore;
    

    /**
     * View displaying a rendered graph 
     */
    export class ViewRender extends View {
        viewport: ƒ.Viewport;
        graph: ƒ.Node;

        constructor(_parent: Panel) {
            super(_parent);
            this.fillContent();
        }
        deconstruct(): void {
            //TODO: desconstruct
        }
        
        fillContent(): void { 
            this.graph = new ƒ.Node("Dummy Node");
            let canvas: HTMLCanvasElement;
            let cmpCamera: ƒ.ComponentCamera;

            // TODO: delete example scene
            this.graph = Scenes.createAxisCross();

            // initialize viewport
            // TODO: create camera/canvas here without "Scenes"
            cmpCamera = Scenes.createCamera(new ƒ.Vector3(3, 3, 5));
            cmpCamera.projectCentral(1, 45);
            canvas = Scenes.createCanvas();
            document.body.appendChild(canvas);

            this.viewport = new ƒ.Viewport();
            this.viewport.initialize("ViewNode_Viewport", this.graph, cmpCamera, canvas);
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
        }

    }
}
