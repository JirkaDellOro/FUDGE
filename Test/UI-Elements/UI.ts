namespace UI {
    import ƒ = Fudge;

    export class Rectangle {
        public name: string;
        public rect: ƒ.Rectangle;
        public htmlElement: HTMLFieldSetElement;

        constructor(_name: string = "Rectangle") {
            this.name = _name;
            this.htmlElement = document.createElement("fieldset");
            let legend: HTMLLegendElement = document.createElement("legend");
            legend.textContent = this.name;
            this.htmlElement.appendChild(legend);
            this.htmlElement.appendChild(this.createStepper("x"));
            this.htmlElement.appendChild(this.createStepper("y"));
            this.htmlElement.appendChild(this.createStepper("width"));
            this.htmlElement.appendChild(this.createStepper("height"));
        }

        private createStepper(_label: string): HTMLSpanElement {
            let span: HTMLSpanElement = document.createElement("span");
            span.textContent = _label + " ";
            let stepper: HTMLInputElement = document.createElement("input");
            stepper.name = _label;
            stepper.type = "number";
            stepper.size = 5;
            span.appendChild(stepper);
            return span;
        }
    }
}