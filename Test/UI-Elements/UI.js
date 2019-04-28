var UI;
(function (UI) {
    class Rectangle {
        constructor(_name = "Rectangle") {
            this.name = _name;
            this.htmlElement = document.createElement("fieldset");
            let legend = document.createElement("legend");
            legend.textContent = this.name;
            this.htmlElement.appendChild(legend);
            this.htmlElement.appendChild(this.createStepper("x"));
            this.htmlElement.appendChild(this.createStepper("y"));
            this.htmlElement.appendChild(this.createStepper("width"));
            this.htmlElement.appendChild(this.createStepper("height"));
            this.htmlElement["uiRectangle"] = this; // relink
        }
        appendButton(_label) {
            let button = document.createElement("button");
            button.textContent = _label;
            this.htmlElement.appendChild(button);
        }
        appendCheckbox(_label) {
            let checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = true;
            this.htmlElement.appendChild(checkbox);
        }
        isLocked() {
            let checkbox = this.htmlElement.querySelector("[type=checkbox]");
            return !checkbox.checked;
        }
        setRect(_rect) {
            for (let key in _rect) {
                let stepper = this.htmlElement.querySelector("#" + key);
                stepper.value = String(_rect[key]);
            }
        }
        getRect() {
            let rect = { x: 0, y: 0, width: 0, height: 0 };
            for (let key in rect) {
                let stepper = this.htmlElement.querySelector("#" + key);
                rect[key] = Number(stepper.value);
            }
            return rect;
        }
        createStepper(_label) {
            let span = document.createElement("span");
            span.textContent = _label + " ";
            let stepper = document.createElement("input");
            stepper.name = _label;
            stepper.type = "number";
            stepper.id = _label;
            stepper.step = "10";
            span.appendChild(stepper);
            return span;
        }
    }
    UI.Rectangle = Rectangle;
})(UI || (UI = {}));
//# sourceMappingURL=UI.js.map