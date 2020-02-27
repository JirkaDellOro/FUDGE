///<reference types="../../../Examples/Code/Scenes"/>

namespace Fudge {
    import ƒ = FudgeCore;
    import ƒui = FudgeUserInterface;

    enum Menu {
        NODE = "AddNode"
    }
    /**
     * View displaying a Node and the hierarchical relation to its parents and children.  
     * Consists of a viewport, a tree-control and . 
     */
    export class ViewNode extends View {
        branch: ƒ.Node;
        selectedNode: ƒ.Node;
        listController: ƒui.UINodeList;

        constructor(_parent: NodePanel) {
            super(_parent);
            if (_parent instanceof NodePanel) {
                if ((<NodePanel>_parent).getNode() != null) {
                    this.branch = (<NodePanel>_parent).getNode();
                }
                else {
                    this.branch = new ƒ.Node("Scene");
                }
            }
            else {
                this.branch = new ƒ.Node("Scene");
            }
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
            let menu: ƒui.DropMenu = new ƒui.DropMenu(Menu.NODE, mutator, { _text: "Add Node" });
            menu.addEventListener(ƒui.UIEVENT.DROPMENUCLICK, this.createNode);
            this.content.append(this.listController.listRoot);
            this.content.append(menu);
        }

        /**
         * Display structure of node
         * @param _node Node to be displayed
         */
        public setRoot(_node: ƒ.Node): void {
            if (!_node)
                return;
            this.branch = _node;
            this.listController.listRoot.removeEventListener(ƒui.UIEVENT.SELECTION, this.passEventToPanel);
            this.listController.setNodeRoot(_node);
            this.content.replaceChild(this.listController.listRoot, this.content.firstChild);
            this.listController.listRoot.addEventListener(ƒui.UIEVENT.SELECTION, this.passEventToPanel);
        }
        /**
         * Add new Node to Node Structure
         */
        private createNode = (_event: CustomEvent): void => {
            let node: ƒ.Node = new ƒ.Node("");
            let targetNode: ƒ.Node = this.selectedNode || this.branch;
            let clrRed: ƒ.Color = new ƒ.Color(1, 0, 0, 1);
            let coatRed: ƒ.CoatColored = new ƒ.CoatColored(clrRed);
            let mtrRed: ƒ.Material = new ƒ.Material("Red", ƒ.ShaderUniColor, coatRed);
            switch (_event.detail) {
                case Menu.NODE + "." + ƒui.NODEMENU.BOX:
                    let meshCube: ƒ.MeshCube = new ƒ.MeshCube();
                    node = Scenes.createCompleteMeshNode("Box", mtrRed, meshCube);
                    break;
                case Menu.NODE + "." + ƒui.NODEMENU.EMPTY:
                    node.name = "Empty Node";
                    break;
                case Menu.NODE + "." + ƒui.NODEMENU.PLANE:
                    let meshPlane: ƒ.MeshQuad = new ƒ.MeshQuad();
                    node = Scenes.createCompleteMeshNode("Plane", mtrRed, meshPlane);
                    break;
                case Menu.NODE + "." + ƒui.NODEMENU.PYRAMID:
                    let meshPyramid: ƒ.MeshPyramid = new ƒ.MeshPyramid();
                    node = Scenes.createCompleteMeshNode("Pyramid", mtrRed, meshPyramid);
                    break;
            }
            targetNode.addChild(node);
            let event: Event = new Event(ƒ.EVENT.CHILD_APPEND);
            targetNode.dispatchEvent(event);
            this.setRoot(this.branch);
        }
        /**
         * Change the selected Node
         */
        private setSelectedNode = (_event: CustomEvent): void => {
            this.listController.setSelection(_event.detail);
            this.selectedNode = _event.detail;
        }
        /**
         * Pass Event to Panel
         */
        private passEventToPanel = (_event: CustomEvent): void => {
            let eventToPass: CustomEvent = new CustomEvent(_event.type, { bubbles: false, detail: _event.detail });
            _event.cancelBubble = true;

            this.parentPanel.dispatchEvent(eventToPass);
        }
    }
}
