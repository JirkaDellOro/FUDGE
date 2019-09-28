///<reference types="../../../Core/Build/FudgeCore"/>
///<reference types="../../../UserInterface/Build/FudgeUI"/>
///<reference types="../../Examples/Code/Scenes"/>

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
        selectedNode: ƒ.Node;
        listController: ƒui.UINodeList;

        constructor(_parent: Panel) {
            super(_parent);
            this.branch = new ƒ.Node("Node");
            this.selectedNode = null;
            this.parentPanel.addEventListener(ƒui.UIEVENT.SELECTION, this.setSelectedNode);
            this.listController = new ƒui.UINodeList(this.branch, this.content);
            this.listController.listRoot.addEventListener(ƒui.UIEVENT.SELECTION, this.passEventToPanel);
            this.fillContent();
        }
        deconstruct(): void {
            //TODO: desconstruct
        }

        fillContent(): void {
            let mutator: ƒ.Mutator = {};
            for (let member in ƒui.NODEMENU) {
                ƒui.MultiLevelMenuManager.buildFromSignature(ƒui.NODEMENU[member], mutator);
            }
            let menu: ƒui.DropMenu = new ƒui.DropMenu("AddNode", mutator, { _text: "Add Node" });
            menu.addEventListener(ƒui.UIEVENT.DROPMENUCLICK, this.createNode);
            this.content.append(this.listController.listRoot);
            this.content.append(menu);
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
        private createNode = (_event: CustomEvent): void => {
            let node: ƒ.Node = new ƒ.Node("");
            console.log("Event came in with Signature: " + _event.detail);
            switch (_event.detail) {

                case "AddNode." + ƒui.NODEMENU.BOX:
                    console.log("Create Box Node");
                    let targetNode: ƒ.Node = this.selectedNode || this.branch;
                    // node.name = "Box";
                    let mesh: ƒ.MeshCube = new ƒ.MeshCube();
                    // let cmpMesh: ƒ.ComponentMesh = new ƒ.ComponentMesh(mesh);
                    let clrRed: ƒ.Color = new ƒ.Color(1, 0, 0, 1);
                    let coatRed: ƒ.CoatColored = new ƒ.CoatColored(clrRed);
                    let mtrRed: ƒ.Material = new ƒ.Material("Red", ƒ.ShaderUniColor, coatRed);
                    // let cmpMaterial: ƒ.ComponentMaterial = new ƒ.ComponentMaterial(mtrRed);
                    // let cmpTransform: ƒ.ComponentTransform = new ƒ.ComponentTransform();
                    // node.addComponent(cmpMesh);
                    // node.addComponent(cmpMaterial);
                    // node.addComponent(cmpTransform);
                    node = Scenes.createCompleteMeshNode("Box", mtrRed, mesh);
                    targetNode.appendChild(node);
                    let event: Event = new Event(ƒ.EVENT.CHILD_APPEND);
                    targetNode.dispatchEvent(event);
                    this.setRoot(this.branch);
                    break;
            }
        }
        private setSelectedNode = (_event: CustomEvent): void => {
            this.listController.setSelection(_event.detail);
            this.selectedNode = _event.detail;
        }
        private passEventToPanel = (_event: CustomEvent): void => {
            let eventToPass: CustomEvent = new CustomEvent(_event.type, { bubbles: false, detail: _event.detail });
            _event.cancelBubble = true;

            this.parentPanel.dispatchEvent(eventToPass);
        }
    }
}
