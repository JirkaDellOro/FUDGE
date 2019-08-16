namespace UI {
    import ƒ = FudgeCore;

    export interface ParamsCamera { aspect?: number; fieldOfView?: number; }
    export interface Size { width: number; height: number; }

    export class FieldSet<T> extends HTMLFieldSetElement {
        protected values: {};
        constructor(_name: string = "FieldSet") {
            super();
            this.name = _name;
            let legend: HTMLLegendElement = document.createElement("legend");
            legend.textContent = this.name;
            this.appendChild(legend);
        }

        public get(): {} {
            for (let key in this.values) {
                let input: HTMLInputElement = this.querySelector("#" + key);
                this.values[key] = Number(input.value);
            }
            return this.values;
        }

        public set(_values: {}): void {
            for (let key in _values) {
                let input: HTMLInputElement = this.querySelector("#" + key);
                if (input)
                    input.value = String(_values[key]);
            }
        }
        public disable(_config: {}): void {
            for (let key in _config) {
                let input: HTMLInputElement = this.querySelector("#" + key);
                input.disabled = _config[key];
            }
        }
    }

    export class Stepper extends HTMLSpanElement {
        public constructor(_label: string, params: { min?: number, max?: number, step?: number, value?: number } = {}) {
            super();
            let stepper: HTMLInputElement = document.createElement("input");
            stepper.name = _label;
            stepper.type = "number";
            stepper.value = params.value.toString();
            stepper.id = _label;
            stepper.step = String(params.step) || "1";
            this.appendChild(stepper);
        }
    }

    export class Border extends FieldSet<ƒ.Border> {
        constructor(_name: string = "Border", _step: number = 1) {
            super(_name);
            this.values = { left: 0, right: 0, top: 0, bottom: 0 };
            this.appendChild(new Stepper("left", { step: _step }));
            this.appendChild(new Stepper("top", { step: _step }));
            this.appendChild(new Stepper("right", { step: _step }));
            this.appendChild(new Stepper("bottom", { step: _step }));
        }
    }

    export class Rectangle extends FieldSet<ƒ.Rectangle> {
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

        public disableAll(_disable: boolean): void {
            super.disable({ x: true, y: true, width: true, height: true });
        }
    }

    export class Camera extends FieldSet<{ aspect: number, fieldOfView: number }> {
        constructor(_name: string = "Camera") {
            super(_name);
            this.values = { aspect: 0, fieldOfView: 0 };
            this.appendChild(new Stepper("fieldOfView", { min: 5, max: 100, step: 5, value: 45 }));
            this.appendChild(new Stepper("aspect", { min: 0.1, max: 10, step: 0.1, value: 1 }));
        }
    }

    export class FramingScaled extends FieldSet<Size> {
        result: UI.Rectangle;

        constructor(_name: string = "FramingScaled") {
            super(_name);
            this.values = { normWidth: 1, normHeight: 1 };
            this.result = new Rectangle("Result");
            this.result.disableAll(true);
            this.appendChild(this.result);
            this.appendChild(new Stepper("normWidth", { step: 0.1, value: 1 }));
            this.appendChild(new Stepper("normHeight", { step: 0.1, value: 1 }));
        }

        public set(_values: {}): void {
            if (_values["Result"])
                this.result.set(_values["Result"]);
            else
                super.set(_values);
        }
    }

    export class FramingComplex extends FieldSet<ƒ.Framing> {
        constructor(_name: string = "FramingComplex") {
            super(_name);
            this.values = { Result: {}, Padding: {}, Margin: {} };
            let result: UI.Rectangle = new Rectangle("Result");
            result.disableAll(true);
            this.appendChild(result);
            this.appendChild(new Border("Padding", 1));
            this.appendChild(new Border("Margin", 0.1));
        }

        public get(): {} {
            for (let child of this.children) {
                let fieldSet: FieldSet<ƒ.Border> = <FieldSet<ƒ.Border>>child;
                let name: string = fieldSet.name;
                if (!this.values[name])
                    continue;
                this.values[name] = fieldSet.get();
            }
            return this.values;
        }

        public set(_values: {}): void {
            for (let child of this.children) {
                let fieldSet: FieldSet<ƒ.Border> = <FieldSet<ƒ.Border>>child;
                let name: string = fieldSet.name;
                if (!_values[name])
                    continue;
                fieldSet.set(_values[name]);
            }
        }
    }

    customElements.define("ui-stepper", Stepper, { extends: "span" });
    customElements.define("ui-framingcomplex", FramingComplex, { extends: "fieldset" });
    customElements.define("ui-scale", FramingScaled, { extends: "fieldset" });
    customElements.define("ui-rectangle", Rectangle, { extends: "fieldset" });
    customElements.define("ui-border", Border, { extends: "fieldset" });
    customElements.define("ui-camera", Camera, { extends: "fieldset" });
}