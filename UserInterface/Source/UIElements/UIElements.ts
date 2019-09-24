namespace FudgeUserInterface {
    /**
     * <select><option>Hallo</option></select>
     */
    import ƒ = FudgeCore;
    export class ToggleButton extends HTMLButtonElement {
        private toggleState: boolean;
        
        public constructor(style: string) {
            super();
            this.type = "button";
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
            this.setToggleState(!this.toggleState);
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

    export class FoldableFieldSet extends HTMLFieldSetElement {
        public constructor(_legend: string) {
            super();
            let cntLegend: HTMLLegendElement = document.createElement("legend");
            cntLegend.classList.add("unfoldable");
            let btnFoldButton: HTMLButtonElement = new ToggleButton("FoldButton");
            btnFoldButton.addEventListener("click", this.toggleFoldElement);
            // btnfoldButton.classList.add("unfoldable");
            let lblTitle: HTMLSpanElement = document.createElement("span");
            lblTitle.textContent = _legend;
            // lblTitle.classList.add("unfoldable");
            cntLegend.appendChild(btnFoldButton);
            cntLegend.appendChild(lblTitle);

            this.appendChild(cntLegend);
        }

        private toggleFoldElement = (_event: MouseEvent): void => {
            _event.preventDefault();
            if (_event.target != _event.currentTarget) return;
            //Get the fieldset the button belongs to
            let children: HTMLCollection = this.children;
            //fold or unfold all children that aren't unfoldable
            for (let child of children) {
                if (!child.classList.contains("unfoldable")) {
                    child.classList.toggle("folded");
                }
            }
        }
    }

    export class DropDown extends HTMLDivElement {
        
        public constructor (_contentList: ƒ.Mutator) {
            super();
        }
    }
    class DropDownButton extends HTMLButtonElement {
        public constructor () {
            super();
        }
    }
    class DropDownContent extends HTMLDivElement {
        public constructor () {
            super();
        }
    }

    customElements.define("ui-stepper", Stepper, { extends: "input" });
    customElements.define("ui-toggle-button", ToggleButton, {extends: "button"});
    customElements.define("ui-fold-fieldset", FoldableFieldSet, { extends: "fieldset" });
    customElements.define("ui-dropdown", DropDown, { extends: "div" });
    customElements.define("ui-dropdown-button", DropDownButton, { extends: "button" });
    customElements.define("ui-dropdown-content", DropDownContent, { extends: "div" });
}
