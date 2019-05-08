var UI;
(function (UI) {
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
                let stepper = this.querySelector("#" + key);
                this.values[key] = Number(stepper.value);
            }
            return this.values;
        }
        set(_values) {
            for (let key in _values) {
                let stepper = this.querySelector("#" + key);
                stepper.value = String(_values[key]);
            }
        }
    }
    UI.FieldSet = FieldSet;
    class Stepper extends HTMLSpanElement {
        constructor(_label, params = {}) {
            super();
            //this = document.createElement("span");
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
        // public border: ƒ.Border;
        constructor(_name = "Border", _step = 1) {
            super(_name);
            this.values = { left: 0, right: 0, top: 0, bottom: 0 };
            this.appendChild(new Stepper("left", { step: _step }));
            this.appendChild(new Stepper("right", { step: _step }));
            this.appendChild(new Stepper("top", { step: _step }));
            this.appendChild(new Stepper("bottom", { step: _step }));
        }
    }
    UI.Border = Border;
    class Rectangle extends FieldSet {
        // public rect: ƒ.Rectangle;
        constructor(_name = "Rectangle") {
            super(_name);
            this.values = { x: 0, y: 0, width: 0, height: 0 };
            this.appendChild(new Stepper("x", { step: 10 }));
            this.appendChild(new Stepper("y", { step: 10 }));
            this.appendChild(new Stepper("width", { step: 10 }));
            this.appendChild(new Stepper("height", { step: 10 }));
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
    }
    UI.Rectangle = Rectangle;
    class Camera extends FieldSet {
        constructor(_name = "Camera") {
            super();
            this.name = _name;
            this.values = { aspect: 0, fieldOfView: 0 };
            let legend = document.createElement("legend");
            legend.textContent = this.name;
            this.appendChild(legend);
            this.appendChild(new Stepper("fieldOfView", { min: 5, max: 100, step: 5, value: 45 }));
            this.appendChild(new Stepper("aspect", { min: 0.1, max: 10, step: 0.1, value: 1 }));
        }
    }
    UI.Camera = Camera;
    class MapRectangle extends FieldSet {
        constructor(_name) {
            super(_name);
            this.appendChild(new Rectangle("Result"));
            this.appendChild(new Border("Border", 0.1));
            this.appendChild(new Border("Anchor", 0.1));
        }
    }
    UI.MapRectangle = MapRectangle;
    customElements.define("ui-stepper", Stepper, { extends: "span" });
    customElements.define("ui-rectangle", Rectangle, { extends: "fieldset" });
    customElements.define("ui-border", Border, { extends: "fieldset" });
    customElements.define("ui-camera", Camera, { extends: "fieldset" });
})(UI || (UI = {}));
//# sourceMappingURL=UI.js.map