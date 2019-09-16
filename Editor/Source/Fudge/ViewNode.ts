///<reference types="../../../Core/Build/FudgeCore"/>
///<reference types="../../../UserInterface/Build/FudgeUI"/>
//<reference types="../../../../Examples/Code/Scenes"/>
///<reference path="View.ts"/>

namespace Fudge {
    import ƒ = FudgeCore;
    import ƒui = FudgeUserInterface;

    /**
     * View displaying a Node and the hierarchical relation to its parents and children.  
     * Consists of a viewport and a tree-control. 
     */
    export class ViewNode extends View {
        branch: ƒ.Node;
        listController: ƒui.UINodeList;

        constructor(_parent: Panel) {
            super(_parent);
            this.fillContent();
        }
        deconstruct(): void {
            //TODO: desconstruct
        }

        fillContent(): void { 
           let element: HTMLElement = document.createElement("div");
           this.listController = new ƒui.UINodeList(new ƒ.Node("dummyNode"), element);
           this.content.append(element);
        }
        public setRoot(_node: ƒ.Node): void {
            if (!_node)
                return;
            // ƒ.Debug.log("Trying to display node: ", _node);
            this.branch = _node;
            this.listController.nodeRoot = _node;
        }
    }
}
