///<reference types="../../../../Core/Build/FudgeCore"/>
//<reference types="../../../../Examples/Code/Scenes"/>
///<reference path="View.ts"/>

namespace FudgeTest {
    import ƒ = FudgeCore;

    /**
     * View displaying a Node and the hierarchical relation to its parents and children.  
     * Consists of a viewport and a tree-control. 
     */
    export class ViewNode extends View {
        constructor(_parent: Panel) {
            super(_parent);
            this.fillContent();
        }
        deconstruct(): void {
            //TODO: desconstruct
        }

        fillContent(): void { 
           let element: HTMLElement = document.createElement("div");
           element.innerText = "I'm a ViewNode, don't question why I have nothing more to say than that.";
           this.content.append(element);
        }
        // public viewport: ƒ.Viewport = new ƒ.Viewport();

        // constructor(_container: GoldenLayout.Container, _state: Object) {
        //     super(_container, _state);
        //     let branch: ƒ.Node;
        //     let canvas: HTMLCanvasElement;
        //     let camera: ƒ.Node;

        //     // TODO: delete example scene
        //     branch = Scenes.createAxisCross();

        //     // initialize RenderManager and transmit content
        //     ƒ.RenderManager.addBranch(branch);
        //     ƒ.RenderManager.update();

        //     // initialize viewport
        //     // TODO: create camera/canvas here without "Scenes"
        //     camera = Scenes.createCamera(new ƒ.Vector3(3, 3, 5));
        //     let cmpCamera: ƒ.ComponentCamera = camera.getComponent(ƒ.ComponentCamera);
        //     cmpCamera.projectCentral(1, 45);
        //     canvas = Scenes.createCanvas();
        //     document.body.appendChild(canvas);

        //     this.viewport = new ƒ.Viewport();
        //     this.viewport.initialize("ViewNode_Viewport", branch, cmpCamera, canvas);
        //     this.viewport.draw();

        //     _container.getElement().append(canvas);

        //     // TODO: if each Panel creates its own instance of GoldenLayout, containers may emit directly to their LayoutManager and no registration is required
        //     Panel.goldenLayout.emit("registerView", _container);

        //     _container.on("setRoot", (_node: ƒ.Node): void => {
        //         ƒ.Debug.log("Set root", _node);
        //         this.setRoot(_node);
        //     });
        // }

        // /**
        //  * Set the root node for display in this view
        //  * @param _node 
        //  */
        // public setRoot(_node: ƒ.Node): void {
        //     if (!_node)
        //         return;
        //     ƒ.Debug.log("Trying to display node: ", _node);
        //     // ƒ.RenderManager.removeBranch(this.viewport. this.viewport.getBranch());
        //     this.viewport.setBranch(_node);
        //     this.viewport.draw();
        // }

        // // TODO: This layout should be used to create a ViewNode, since it contains not only a viewport, but also a tree
        // public getLayout(): GoldenLayout.Config {
        //     // const config: GoldenLayout.Config = {
        //     //     content: [{
        //     //         type: "row",
        //     //         content: [{
        //     //             type: "component",
        //     //             componentName: "ComponentTree",
        //     //             title: "Graph"
        //     //         }, {
        //     //             type: "component",
        //     //             componentName: "ComponentViewport",
        //     //             title: "Viewport"
        //     //         }]
        //     //     }]
        //     // };
        //     // return config;
        // }
    }
}
