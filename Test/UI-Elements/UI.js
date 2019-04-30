var UI;
(function (UI) {
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
    class Rectangle extends HTMLFieldSetElement {
        constructor(_name = "Rectangle") {
            super();
            this.name = _name;
            let legend = document.createElement("legend");
            legend.textContent = this.name;
            this.appendChild(legend);
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
        setRect(_rect) {
            for (let key in _rect) {
                let stepper = this.querySelector("#" + key);
                stepper.value = String(_rect[key]);
            }
        }
        getRect() {
            let rect = { x: 0, y: 0, width: 0, height: 0 };
            for (let key in rect) {
                let stepper = this.querySelector("#" + key);
                rect[key] = Number(stepper.value);
            }
            return rect;
        }
    }
    UI.Rectangle = Rectangle;
    class Camera extends HTMLFieldSetElement {
        constructor(_name = "Camera") {
            super();
            this.name = _name;
            let legend = document.createElement("legend");
            legend.textContent = this.name;
            this.appendChild(legend);
            this.appendChild(new Stepper("FOV", { min: 5, max: 100, step: 5, value: 45 }));
            this.appendChild(new Stepper("Aspect", { min: 0.1, max: 10, step: 0.1, value: 1 }));
        }
    }
    UI.Camera = Camera;
    customElements.define("ui-stepper", Stepper, { extends: "span" });
    customElements.define("ui-rectangle", Rectangle, { extends: "fieldset" });
    customElements.define("ui-camera", Camera, { extends: "fieldset" });
})(UI || (UI = {}));
//# sourceMappingURL=UI.js.map