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
            this.branch = new ƒ.Node("dummyNode");
            
            this.listController = new ƒui.UINodeList(this.branch, this.content);
            
            this.fillContent();
        }
        deconstruct(): void {
            //TODO: desconstruct
        }

        fillContent(): void {
            this.content.append(this.listController.listRoot);
        }
        public setRoot(_node: ƒ.Node): void {
            if (!_node)
                return;
            // ƒ.Debug.log("Trying to display node: ", _node);
            this.branch = _node;
            this.listController.setNodeRoot(_node);
            this.content.replaceChild(this.listController.listRoot, this.content.firstChild);
        }
    }
}
