namespace FudgeUserInterface {
    /**
     * <select><option>Hallo</option></select>
     */
    export class FoldableFieldSet extends HTMLFieldSetElement {
        public constructor(_legend: string) {
            super();
            let cntLegend: HTMLLegendElement = document.createElement("legend");

            let btnfoldButton: HTMLButtonElement = document.createElement("button");
            btnfoldButton.classList.add("foldButton_unfolded");
            btnfoldButton.addEventListener("click", this.toggleFoldElement);
            let lblTitle: HTMLSpanElement = document.createElement("span");
            lblTitle.textContent = _legend;
            cntLegend.appendChild(btnfoldButton);
            cntLegend.appendChild(lblTitle);

            this.appendChild(cntLegend);
        }

        private toggleFoldElement = (_event: MouseEvent): void => {
            _event.preventDefault();
            if (_event.target != _event.currentTarget) return;
            //Get the fieldset the button belongs to
            let foldTarget: HTMLElement = this;
            //Toggle the folding behaviour of the Folding Target
            foldTarget.classList.toggle("foldButton_folded");
            foldTarget.classList.toggle("foldButton_unfolded");
            let children: HTMLCollection = foldTarget.children;
            //fold or unfold all children that aren't unfoldable
            for (let child of children) {
                if (!child.classList.contains("unfoldable")) {
                    child.classList.toggle("folded");
                }
            }
        }
    }
    export class CollapsableList extends HTMLUListElement {
        public constructor() {
            super();

        }
    }

    export class ToggleButton extends HTMLButtonElement {
        private toggleState: boolean;
        
        public constructor(style: string) {
            super();
            this.toggleState = true;
            this.classList.add(style);
            this.classList.add("ToggleOn");
            this.addEventListener("click", this.switchToggleState);
        }
        public setToggleState(toggleState: boolean): void {
            this.toggleState = toggleState;
            if (this.toggleState == true) {
                this.classList.add("ToggleOn");
                this.classList.remove("ToggleOff");
            }
            else {
                this.classList.remove("ToggleOn");
                this.classList.add("ToggleOff");
            }
        }
        public getToggleState(): boolean {
            return this.toggleState;
        }
        public toggle(): void {
            this.setToggleState(!this.toggleState);
        }
        private switchToggleState = (_event: MouseEvent): void => {
            // this.setToggleState(!this.toggleState);
            console.log(this);
        }
    }
    export class Stepper extends HTMLInputElement {
        public constructor(_label: string, params: { min?: number, max?: number, step?: number, value?: number } = {}) {
            super();
            this.name = _label;
            this.type = "number";
            this.value = params.value.toString();
            this.id = _label;
            this.step = String(params.step) || "1";
        }
    }
    customElements.define("ui-stepper", Stepper, { extends: "input" });
    customElements.define("ui-fold-fieldset", FoldableFieldSet, { extends: "fieldset" });
    customElements.define("ui-toggle-button", ToggleButton, {extends: "button"});

}
