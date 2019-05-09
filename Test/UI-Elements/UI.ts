namespace UI {
    import ƒ = Fudge;

    export interface ParamsCamera { aspect?: number; fieldOfView?: number; }

    export class FieldSet<T> extends HTMLFieldSetElement {
        protected values: {};
        constructor(_name: string = "FieldSet") {
            super();
            this.name = _name;
            let legend: HTMLLegendElement = document.createElement("legend");
            legend.textContent = this.name;
            this.appendChild(legend);
        }

        public get(): T {
            for (let key in this.values) {
                let stepper: HTMLInputElement = this.querySelector("#" + key);
                this.values[key] = Number(stepper.value);
            }
            return <T>this.values;
        }

        public set(_values: T): void {
            for (let key in _values) {
                let stepper: HTMLInputElement = this.querySelector("#" + key);
                stepper.value = String(_values[key]);
            }
        }
    }

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

    export class Border extends FieldSet<ƒ.Border> {
        // public border: ƒ.Border;
        constructor(_name: string = "Border", _step: number = 1) {
            super(_name);
            this.values = { left: 0, right: 0, top: 0, bottom: 0 };
            this.appendChild(new Stepper("left", { step: _step }));
            this.appendChild(new Stepper("right", { step: _step }));
            this.appendChild(new Stepper("top", { step: _step }));
            this.appendChild(new Stepper("bottom", { step: _step }));
        }
    }

    export class Rectangle extends FieldSet<ƒ.Rectangle> {
        // public rect: ƒ.Rectangle;

        constructor(_name: string = "Rectangle") {
            super(_name);
            this.values = { x: 0, y: 0, width: 0, height: 0 };
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
    }

    export class Camera extends FieldSet<{ aspect: number, fieldOfView: number }> {
        constructor(_name: string = "Camera") {
            super();
            this.name = _name;
            this.values = { aspect: 0, fieldOfView: 0 };
            let legend: HTMLLegendElement = document.createElement("legend");
            legend.textContent = this.name;
            this.appendChild(legend);
            this.appendChild(new Stepper("fieldOfView", { min: 5, max: 100, step: 5, value: 45 }));
            this.appendChild(new Stepper("aspect", { min: 0.1, max: 10, step: 0.1, value: 1 }));
        }
    }

    export class MapRectangle extends FieldSet<ƒ.MapRectangle> {
        constructor(_name: string) {
            super(_name);
            this.appendChild(new Rectangle("Result"));
            this.appendChild(new Border("Border", 0.1));
            this.appendChild(new Border("Anchor", 0.1));
        }

        // TODO: overwrite get/set to support for the three datasets Result, Border, Anchor
    }

    customElements.define("ui-stepper", Stepper, { extends: "span" });
    customElements.define("ui-rectangle", Rectangle, { extends: "fieldset" });
    customElements.define("ui-border", Border, { extends: "fieldset" });
    customElements.define("ui-camera", Camera, { extends: "fieldset" });
}