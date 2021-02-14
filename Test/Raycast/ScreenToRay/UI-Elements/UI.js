var UI;
(function (UI) {
    var ƒ = FudgeCore;
    class FieldSet extends HTMLFieldSetElement {
        constructor(_name = "FieldSet") {
            super();
            this.name = _name;
            let legend = document.createElement("legend");
            legend.textContent = this.name;
            this.appendChild(legend);
        }
        get() {
            for (let key in this.values) {
                let input = this.querySelector("#" + key);
                this.values[key] = Number(input.value);
            }
            return this.values;
        }
        set(_values) {
            for (let key in _values) {
                let input = this.querySelector("#" + key);
                if (input)
                    input.value = String(_values[key]);
            }
        }
        disable(_config) {
            for (let key in _config) {
                let input = this.querySelector("#" + key);
                input.disabled = _config[key];
            }
        }
    }
    UI.FieldSet = FieldSet;
    class Stepper extends HTMLSpanElement {
        constructor(_label = "Stepper", params = {}) {
            super();
            this.textContent = _label + " ";
            let stepper = document.createElement("input");
            stepper.name = _label;
            stepper.type = "number";
            stepper.id = _label;
            stepper.step = String(params.step) || "1";
            this.appendChild(stepper);
        }
    }
    UI.Stepper = Stepper;
    class Border extends FieldSet {
        constructor(_name = "Border", _step = 1) {
            super(_name);
            this.values = { left: 0, right: 0, top: 0, bottom: 0 };
            this.appendChild(new Stepper("left", { step: _step }));
            this.appendChild(new Stepper("top", { step: _step }));
            this.appendChild(new Stepper("right", { step: _step }));
            this.appendChild(new Stepper("bottom", { step: _step }));
        }
    }
    UI.Border = Border;
    class Rectangle extends FieldSet {
        constructor(_name = "Rectangle") {
            super(_name);
            this.values = { x: 0, y: 0, width: 0, height: 0 };
            this.appendChild(new Stepper("x", { step: 10 }));
            this.appendChild(new Stepper("y", { step: 10 }));
            this.appendChild(new Stepper("width", { step: 10 }));
            this.appendChild(new Stepper("height", { step: 10 }));
        }
        set(_rect) {
            let values = { x: _rect.x, y: _rect.y, width: _rect.width, height: _rect.height };
            super.set(values);
        }
        get() {
            // tslint:disable no-any
            let _rect = super.get();
            return new ƒ.Rectangle(_rect.x, _rect.y, _rect.width, _rect.height);
        }
        appendButton(_label) {
            let button = document.createElement("button");
            button.textContent = _label;
            this.appendChild(button);
        }
        appendCheckbox(_label) {
            let checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = true;
            this.appendChild(checkbox);
        }
        isLocked() {
            let checkbox = this.querySelector("[type=checkbox]");
            return !checkbox.checked;
        }
        disableAll(_disable) {
            super.disable({ x: true, y: true, width: true, height: true });
        }
    }
    UI.Rectangle = Rectangle;
    class Camera extends FieldSet {
        constructor(_name = "Camera") {
            super(_name);
            this.values = { aspect: 0, fieldOfView: 0, near: 0, far: 0 };
            this.appendChild(new Stepper("fieldOfView", { min: 5, max: 100, step: 5, value: 45 }));
            this.appendChild(new Stepper("aspect", { min: 0.1, max: 10, step: 0.1, value: 1 }));
            this.appendChild(new Stepper("near", { min: 0.01, max: 10, step: 0.01, value: 1 }));
            this.appendChild(new Stepper("far", { min: 1, max: 1000, step: 0.5, value: 10 }));
        }
    }
    UI.Camera = Camera;
    class Point extends FieldSet {
        constructor(_name = "Point") {
            super(_name);
            this.values = { x: 0, y: 0 };
            this.appendChild(new Stepper("x", { value: 0 }));
            this.appendChild(new Stepper("y", { value: 0 }));
            super.disable({ x: true, y: true });
        }
    }
    UI.Point = Point;
    class FramingScaled extends FieldSet {
        constructor(_name = "FramingScaled") {
            super(_name);
            this.values = { normWidth: 1, normHeight: 1 };
            this.result = new Rectangle("Result");
            this.result.disableAll(true);
            this.appendChild(this.result);
            this.appendChild(new Stepper("normWidth", { step: 0.1, value: 1 }));
            this.appendChild(new Stepper("normHeight", { step: 0.1, value: 1 }));
        }
        set(_values) {
            if (_values["Result"])
                this.result.set(_values["Result"]);
            else
                super.set(_values);
        }
    }
    UI.FramingScaled = FramingScaled;
    class FramingComplex extends FieldSet {
        constructor(_name = "FramingComplex") {
            super(_name);
            this.values = { Result: {}, Padding: {}, Margin: {} };
            let result = new Rectangle("Result");
            result.disableAll(true);
            this.appendChild(result);
            this.appendChild(new Border("Padding", 1));
            this.appendChild(new Border("Margin", 0.1));
        }
        get() {
            for (let child of this.children) {
                let fieldSet = child;
                let name = fieldSet.name;
                if (!this.values[name])
                    continue;
                this.values[name] = fieldSet.get();
            }
            return this.values;
        }
        set(_values) {
            for (let child of this.children) {
                let fieldSet = child;
                let name = fieldSet.name;
                if (!_values[name])
                    continue;
                fieldSet.set(_values[name]);
            }
        }
    }
    UI.FramingComplex = FramingComplex;
    customElements.define("ui-stepper", Stepper, { extends: "span" });
    customElements.define("ui-framingcomplex", FramingComplex, { extends: "fieldset" });
    customElements.define("ui-scale", FramingScaled, { extends: "fieldset" });
    customElements.define("ui-rectangle", Rectangle, { extends: "fieldset" });
    customElements.define("ui-border", Border, { extends: "fieldset" });
    customElements.define("ui-camera", Camera, { extends: "fieldset" });
    customElements.define("ui-point", Point, { extends: "fieldset" });
    customElements.define("ui-fieldset", FieldSet, { extends: "fieldset" });
})(UI || (UI = {}));
//# sourceMappingURL=UI.js.map