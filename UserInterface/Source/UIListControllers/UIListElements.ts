namespace FudgeUserInterface {
    import ƒ = FudgeCore;
    export abstract class UIListController {
        abstract listRoot: HTMLElement;
        protected abstract toggleCollapse(_event: MouseEvent): void;
    }
    abstract class CollapsableListElement extends HTMLUListElement {
        header: HTMLLIElement;
        content: HTMLElement;
        constructor() {
            super();
            this.header = document.createElement("li");
            this.content = document.createElement("ul");
            this.appendChild(this.header);
            this.appendChild(this.content);
        }

        public collapse(element: HTMLElement): void {
            let desiredResult: Object = null;
            if (element.firstChild == this.header)
                desiredResult = element.firstChild;
            while (element.lastChild != desiredResult) {
                if (element.lastChild != this.header) {
                    element.removeChild(element.lastChild);
                }
            }
        }
    }
    export class CollapsableNodeListElement extends CollapsableListElement {
        node: ƒ.Node;
        constructor(_node: ƒ.Node, _name: string, _unfolded: boolean = false) {
            super();
            this.node = _node;
            let buttonState: string;
            if (this.node.getChildren().length != 0)
                buttonState = "FoldButton";
            else
                buttonState = "invisible";
            let btnToggle: HTMLButtonElement = new ToggleButton(buttonState);
            (<ToggleButton>btnToggle).setToggleState(_unfolded);
            this.header.appendChild(btnToggle);
            let lblName: HTMLSpanElement = document.createElement("span");
            lblName.textContent = _name;
            lblName.addEventListener("click", this.selectNode);
            this.header.appendChild(lblName);
        }
        public selectNode = (_event: MouseEvent): void => {
            let event: Event = new CustomEvent(UIEVENT.SELECTION, { bubbles: true, detail: this.node });
            this.dispatchEvent(event);
        }
        public collapseEvent = (_event: MouseEvent): void => {
            let event: Event = new CustomEvent(UIEVENT.COLLAPSE, { bubbles: true, detail: this });
            this.dispatchEvent(event);
        }
    }
    export class CollapsableAnimationListElement extends CollapsableListElement {
        mutator: ƒ.Mutator;
        name: string;
        constructor(_mutator: ƒ.Mutator, _name: string, _unfolded: boolean = false) {
            super();
            this.mutator = _mutator;
            this.name = _name;
            let btnToggle: HTMLButtonElement = new ToggleButton("FoldButton");
            (<ToggleButton>btnToggle).setToggleState(_unfolded);
            btnToggle.addEventListener("click", this.collapseEvent);
            this.header.appendChild(btnToggle);
            let lblName: HTMLSpanElement = document.createElement("span");
            lblName.textContent = _name;
            this.header.appendChild(lblName);
            this.buildContent(_mutator);
            this.content.addEventListener("input", this.updateMutator);
        }
        public collapseEvent = (_event: MouseEvent): void => {
            let event: Event = new CustomEvent(UIEVENT.COLLAPSE, { bubbles: true, detail: this });
            this.dispatchEvent(event);
        }
        public buildContent(_mutator: ƒ.Mutator): void {
            for (let key in _mutator) {
                let listEntry: HTMLLIElement = document.createElement("li");
                UIGenerator.createLabelElement(key, listEntry);
                UIGenerator.createStepperElement(key, listEntry, { _value: (<number>_mutator[key]) });
                this.content.append(listEntry);
            }
        }
        public getMutator(): ƒ.Mutator {
            return this.mutator;
        }
        public setMutator(_mutator: ƒ.Mutator): void {
            this.collapse(this.content);
            this.mutator = _mutator;
            this.buildContent(_mutator);
        }
        private updateMutator = (_event: Event): void => {
            let target: HTMLInputElement = <HTMLInputElement>_event.target;
            this.mutator[target.id] = parseFloat(target.value);
            let event: Event = new CustomEvent(UIEVENT.UPDATE, {bubbles: true, detail: this.mutator});
            this.dispatchEvent(event);
        }
        
    }
    customElements.define("ui-node-list", CollapsableNodeListElement, { extends: "ul" });
    customElements.define("ui-animation-list", CollapsableAnimationListElement, { extends: "ul" });
}