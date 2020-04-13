var CustomElements;
(function (CustomElements) {
    window.addEventListener("load", init);
    class Stepper extends HTMLSpanElement {
        constructor(_label = "Parameter") {
            super();
            console.log("I'm alive");
            this.label = document.createElement("label");
            this.label.innerHTML = _label;
            this.input = document.createElement("input");
            this.input.type = "number";
        }
        connectedCallback() {
            console.log("I'm adopted");
            console.log("Label", this.getAttribute("label"));
            console.log("Inner", this.textContent);
            this.appendChild(this.label);
            this.appendChild(this.input);
        }
        disconnectedCallback() {
            console.log("I'm abandoned");
        }
    }
    window.customElements.define("test-stepper", Stepper, { extends: "span" });
    function init(_event) {
        let stepper = document.querySelector("[is=test-stepper]");
        console.log(stepper);
        console.log(stepper.innerHTML);
        document.body.removeChild(stepper);
        document.body.appendChild(stepper);
    }
})(CustomElements || (CustomElements = {}));
//# sourceMappingURL=Main.js.map