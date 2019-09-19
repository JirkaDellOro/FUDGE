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
            this.parentPanel.addEventListener(ƒui.UIEVENT.SELECTION, this.setSelectedNode);
            this.listController = new ƒui.UINodeList(this.branch, this.content);
            this.listController.listRoot.addEventListener(ƒui.UIEVENT.SELECTION, this.passEventToPanel);
            console.log(this.listController.listRoot);
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
            this.listController.listRoot.removeEventListener(ƒui.UIEVENT.SELECTION, this.passEventToPanel);
            this.listController.setNodeRoot(_node);
            this.content.replaceChild(this.listController.listRoot, this.content.firstChild);
            this.listController.listRoot.addEventListener(ƒui.UIEVENT.SELECTION, this.passEventToPanel);
        }
        private setSelectedNode = (_event: CustomEvent): void => {
            this.listController.setSelection(_event.detail);
        }
        private passEventToPanel = (_event: CustomEvent): void => {
            console.log("Recieved Event, trying to pass it onto the Panel");
            console.log(_event);
            let eventToPass: CustomEvent = new CustomEvent(_event.type, { bubbles: false, detail: _event.detail });
            _event.cancelBubble = true;
            
            this.parentPanel.dispatchEvent(eventToPass);
        }
    }
}
