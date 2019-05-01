namespace UI {
    import ƒ = Fudge;

    export interface ParamsCamera { aspect?: number; fieldOfView?: number; }

    export class Stepper extends HTMLSpanElement {
        public constructor(_label: string, params: { min?: number, max?: number, step?: number, value?: number } = {}) {
            super();
            //this = document.createElement("span");
            this.textContent = _label + " ";
            let stepper: HTMLInputElement = document.createElement("input");
            stepper.name = _label;
            stepper.type = "number";
            stepper.id = _label;
            stepper.step = String(params.step) || "1";
            this.appendChild(stepper);
        }
    }

    export class Rectangle extends HTMLFieldSetElement {
        public rect: ƒ.Rectangle;

        constructor(_name: string = "Rectangle") {
            super();
            this.name = _name;
            let legend: HTMLLegendElement = document.createElement("legend");
            legend.textContent = this.name;
            this.appendChild(legend);
            this.appendChild(new Stepper("x", { step: 10 }));
            this.appendChild(new Stepper("y", { step: 10 }));
            this.appendChild(new Stepper("width", { step: 10 }));
            this.appendChild(new Stepper("height", { step: 10 }));
        }

        public appendButton(_label: string): void {
            let button: HTMLButtonElement = document.createElement("button");
            button.textContent = _label;
            this.appendChild(button);
        }

        public appendCheckbox(_label: string): void {
            let checkbox: HTMLInputElement = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = true;
            this.appendChild(checkbox);
        }

        public isLocked(): boolean {
            let checkbox: HTMLInputElement = <HTMLInputElement>this.querySelector("[type=checkbox]");
            return !checkbox.checked;
        }

        public set(_rect: ƒ.Rectangle): void {
            for (let key in _rect) {
                let stepper: HTMLInputElement = this.querySelector("#" + key);
                stepper.value = String(_rect[key]);
            }
        }

        public get(): ƒ.Rectangle {
            let rect: ƒ.Rectangle = { x: 0, y: 0, width: 0, height: 0 };
            for (let key in rect) {
                let stepper: HTMLInputElement = this.querySelector("#" + key);
                rect[key] = Number(stepper.value);
            }
            return rect;
        }
    }

    export class Camera extends HTMLFieldSetElement {
        constructor(_name: string = "Camera") {
            super();
            this.name = _name;
            let legend: HTMLLegendElement = document.createElement("legend");
            legend.textContent = this.name;
            this.appendChild(legend);
            this.appendChild(new Stepper("fieldOfView", { min: 5, max: 100, step: 5, value: 45 }));
            this.appendChild(new Stepper("aspect", { min: 0.1, max: 10, step: 0.1, value: 1 }));
        }

        public set(_params: ParamsCamera): void {
            for (let key in _params) {
                let stepper: HTMLInputElement = this.querySelector("#" + key);
                stepper.value = String(_params[key]);
            }
        }
        public get(): ParamsCamera {
            let params: ParamsCamera = { aspect: 0, fieldOfView: 0 };
            for (let key in params) {
                let stepper: HTMLInputElement = this.querySelector("#" + key);
                params[key] = String(stepper.value);
            }
            return params;
        }
    }

    customElements.define("ui-stepper", Stepper, { extends: "span" });
    customElements.define("ui-rectangle", Rectangle, { extends: "fieldset" });
    customElements.define("ui-camera", Camera, { extends: "fieldset" });
}