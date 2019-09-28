// / <reference types="../../../Core/Build/FudgeCore"/>
namespace FudgeUserInterface {
    import ƒ = FudgeCore;
    export class UINodeList {
        listRoot: HTMLElement;
        selectedEntry: HTMLElement;
        private nodeRoot: ƒ.Node;

        constructor(_node: ƒ.Node, _listContainer: HTMLElement) {
            this.nodeRoot = _node;
            this.nodeRoot.addEventListener(ƒ.EVENT.CHILD_APPEND, this.updateList);
            this.nodeRoot.addEventListener(ƒ.EVENT.CHILD_REMOVE, this.updateList);
            this.listRoot = document.createElement("ul");
            let list: HTMLUListElement = this.BuildListFromNode(this.nodeRoot);
            this.listRoot.appendChild(list);
            _listContainer.appendChild(this.listRoot);
            _listContainer.addEventListener(UIEVENT.COLLAPSE, this.toggleCollapse);

        }
        public getNodeRoot(): ƒ.Node {
            return this.nodeRoot;
        }
        public setSelection(_node: ƒ.Node): void {
            //TODO: Select Appropriate Entry
        }
        
        public getSelection(): ƒ.Node {
            return (<CollapsableNodeListElement>this.selectedEntry).node;
        }

        public updateList = (_event: Event): void => {
            this.setNodeRoot(this.nodeRoot);
        }
        public setNodeRoot(_node: ƒ.Node): void {
            this.nodeRoot = _node;
            this.listRoot = this.BuildListFromNode(this.nodeRoot);
        }
        public toggleCollapse = (_event: Event): void => {
            _event.preventDefault();
            
            if (event.target instanceof CollapsableNodeListElement) {
                let target: CollapsableNodeListElement = <CollapsableNodeListElement>_event.target;
                if (target.content.children.length > 1)
                    target.collapse(target);
                else {
                    let nodeToExpand: ƒ.Node = (<CollapsableNodeListElement>target).node;
                    let newList: HTMLUListElement = this.BuildListFromNode(nodeToExpand);
                    // if (targetParent == this.listRoot)
                        // newList.addEventListener("click", this.toggleCollapse);
                    target.replaceWith(newList);
                }
            }
        }
        
        private BuildListFromNode(_node: ƒ.Node): HTMLUListElement {
            let listRoot: CollapsableNodeListElement = new CollapsableNodeListElement(_node, _node.name, true);
            let nodeChildren: ƒ.Node[] = _node.getChildren();
            for (let child of nodeChildren) {
                let hasChildren: boolean = (child.getChildren().length != 0 ? true : false);
                let listItem: HTMLUListElement = new CollapsableNodeListElement(child, child.name, hasChildren);
                listRoot.content.appendChild(listItem);
            }
            return listRoot;
        }


    }

}
