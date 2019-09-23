// / <reference types="../../../Core/Build/FudgeCore"/>
namespace FudgeUserInterface {
    import ƒ = FudgeCore;
    export class UINodeList {
        listRoot: HTMLElement;
        selectedEntry: HTMLElement;
        private nodeRoot: ƒ.Node;

        constructor(_node: ƒ.Node, _listContainer: HTMLElement) {
            this.nodeRoot = _node;
            this.listRoot = document.createElement("ul");
            let list: HTMLUListElement = this.BuildListFromNode(this.nodeRoot);
            this.listRoot.appendChild(list);
            _listContainer.appendChild(this.listRoot);
            _listContainer.addEventListener("click", this.toggleCollapse);

        }
        public getNodeRoot(): ƒ.Node {
            return this.nodeRoot;
        }
        public setSelection(_node: ƒ.Node): void {
            //TODO: Select Appropriate Entry
            console.log("got node");
            console.log(_node);
        }
        
        public getSelection(): ƒ.Node {
            return (<CollapsableNodeListElement>this.selectedEntry).node;
        }
        public setNodeRoot(_node: ƒ.Node): void {
            this.nodeRoot = _node;
            this.listRoot = this.BuildListFromNode(this.nodeRoot);
            // this.listRoot.addEventListener("click", this.toggleCollapse);
        }
        public toggleCollapse = (_event: MouseEvent): void => {
            _event.preventDefault();
            let target: HTMLElement = <HTMLElement>_event.target;
            if (target.nodeName == "BUTTON") {
                let targetParent: HTMLElement = target.parentElement.parentElement;
                if (targetParent.children.length > 1)
                    (<CollapsableNodeListElement>targetParent).collapse(targetParent);
                else {
                    let nodeToExpand: ƒ.Node = (<CollapsableNodeListElement>targetParent).node;
                    let newList: HTMLUListElement = this.BuildListFromNode(nodeToExpand);
                    // if (targetParent == this.listRoot)
                        // newList.addEventListener("click", this.toggleCollapse);
                    targetParent.replaceWith(newList);
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
