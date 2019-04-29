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

            this.htmlElement["uiRectangle"] = this; // relink
        }

        public appendButton(_label: string): void {
            let button: HTMLButtonElement = document.createElement("button");
            button.textContent = _label;    
            this.htmlElement.appendChild(button);
        }
        
        public appendCheckbox(_label: string): void {
            let checkbox: HTMLInputElement = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = true;
            this.htmlElement.appendChild(checkbox);
        }

        public isLocked(): boolean {
            let checkbox: HTMLInputElement = <HTMLInputElement>this.htmlElement.querySelector("[type=checkbox]");
            return !checkbox.checked;
        }

        public setRect(_rect: ƒ.Rectangle): void {
            for (let key in _rect) {
                let stepper: HTMLInputElement = this.htmlElement.querySelector("#" + key);
                stepper.value = String(_rect[key]);
            }
        }

        public getRect(): ƒ.Rectangle {
            let rect: ƒ.Rectangle = { x: 0, y: 0, width: 0, height: 0 };
            for (let key in rect) {
                let stepper: HTMLInputElement = this.htmlElement.querySelector("#" + key);
                rect[key] = Number(stepper.value);
            }
            return rect;
        }

        private createStepper(_label: string): HTMLSpanElement {
            let span: HTMLSpanElement = document.createElement("span");
            span.textContent = _label + " ";
            let stepper: HTMLInputElement = document.createElement("input");
            stepper.name = _label;
            stepper.type = "number";
            stepper.id = _label;
            stepper.step = "10";
            span.appendChild(stepper);
            return span;
        }
    }
}