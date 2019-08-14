namespace Fudge {
    export namespace UserInterface {

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
                let target: HTMLButtonElement = <HTMLButtonElement>_event.target;
                //Get the fieldset the button belongs to
                let foldTarget: HTMLElement = target.parentElement.parentElement;
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
    }
}