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
        }
        createStepper(_label) {
            let span = document.createElement("span");
            span.textContent = _label + " ";
            let stepper = document.createElement("input");
            stepper.name = _label;
            stepper.type = "number";
            stepper.size = 5;
            span.appendChild(stepper);
            return span;
        }
    }
    UI.Rectangle = Rectangle;
})(UI || (UI = {}));
//# sourceMappingURL=UI.js.map