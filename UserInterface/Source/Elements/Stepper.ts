namespace FudgeUserInterface {
    // import ƒ = FudgeCore;

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
}
