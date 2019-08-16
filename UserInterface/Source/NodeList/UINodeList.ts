/// <reference types="../../../Core/Build/FudgeCore"/>
namespace FudgeUserInterface {
    import ƒ = FudgeCore;
    class CollapsableListElement extends HTMLUListElement {
        node: ƒ.Node;
        header: HTMLLIElement;
        constructor(_node: ƒ.Node, _name: string, _unfolded: boolean = false) {
            super();
            this.node = _node;
            let cntHeader: HTMLLIElement = document.createElement("li");
            let buttonState: string;
            if (this.node.getChildren().length != 0)
                buttonState = "FoldButton";
            else
                buttonState = "invisible";
            let btnToggle: HTMLButtonElement = new ToggleButton(buttonState);
            (<ToggleButton>btnToggle).setToggleState(_unfolded);
            cntHeader.appendChild(btnToggle);
            let lblName: HTMLSpanElement = document.createElement("span");
            lblName.textContent = _name;
            cntHeader.appendChild(lblName);
            this.appendChild(cntHeader);
            this.header = cntHeader;
        }
        public collapse(): void {
            while (this.lastChild != this.firstChild) {
                if (this.lastChild != this.header) {
                    this.removeChild(this.lastChild);
                }
            }
        }
    }
    export class UINodeList {
        nodeRoot: ƒ.Node;
        listRoot: HTMLElement;
        selectedEntry: HTMLElement;
        constructor(_node: ƒ.Node, _listContainer: HTMLElement) {
            this.listRoot = document.createElement("ul");
            let rootElement: HTMLUListElement = this.BuildListFromNode(_node);
            this.listRoot.appendChild(rootElement);
            _listContainer.appendChild(this.listRoot);
            this.listRoot.addEventListener("click", this.toggleCollapse);
        }

        private BuildListFromNode(_node: ƒ.Node): HTMLUListElement {
            let listRoot: HTMLUListElement = new CollapsableListElement(_node, _node.name, true);
            let nodeChildren: ƒ.Node[] = _node.getChildren();
            for (let child of nodeChildren) {
                let hasChildren: boolean = (child.getChildren().length != 0 ? true : false);
                let listItem: HTMLUListElement = new CollapsableListElement(child, child.name, hasChildren);
                listRoot.appendChild(listItem);
            }
            return listRoot;
        }

        private toggleCollapse = (_event: MouseEvent): void => {
            _event.preventDefault();
            let target: HTMLElement = <HTMLElement>_event.target;
            if (target.nodeName == "BUTTON") {
                let targetParent: HTMLElement = target.parentElement.parentElement;
                if (targetParent.children.length > 1)
                    (<CollapsableListElement>targetParent).collapse();
                else {
                    let nodeToExpand: ƒ.Node = (<CollapsableListElement>targetParent).node;
                    let newList: HTMLUListElement = this.BuildListFromNode(nodeToExpand);
                    console.log(newList);
                    targetParent.replaceWith(newList);
                }
            }
        }
    }
    customElements.define("ui-collapse-list", CollapsableListElement, { extends: "ul" });
}
