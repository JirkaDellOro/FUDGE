var CustomElements;
(function (CustomElements) {
    window.addEventListener("load", init);
    let Stepper = /** @class */ (() => {
        class Stepper extends HTMLParagraphElement {
            constructor(_label = "Parameter") {
                super();
                this.initialized = false;
                console.log("I'm alive");
                this.label = document.createElement("label");
                this.label.innerHTML = _label;
                this.input = document.createElement("input");
                this.input.type = "number";
            }
            connectedCallback() {
                console.log("I'm adopted");
                if (this.initialized)
                    return;
                console.log("Initializing");
                console.log("Label", this.getAttribute("label"));
                console.log("Inner", this.textContent);
                this.appendChild(this.label);
                this.appendChild(this.input);
                this.initialized = true;
            }
            disconnectedCallback() {
                console.log("I'm abandoned");
            }
        }
        // tslint:disable:typedef
        Stepper.customElement = customElements.define("test-stepper", Stepper, { extends: "p" });
        return Stepper;
    })();
    function init(_event) {
        let stepper = document.querySelector("[is=test-stepper]");
        console.log(stepper);
        console.log(stepper.innerHTML);
        document.body.removeChild(stepper);
        document.body.appendChild(stepper);
        let stepper2 = new Stepper("Step2");
        document.body.appendChild(stepper2);
        // let templates: NodeListOf<HTMLTemplateElement> = document.querySelectorAll("template");
        let template = document.querySelector("template");
        console.log(template);
        let templates = template.content.children;
        console.log(templates);
        for (let custom of templates) {
            console.log(custom.tagName);
            document.body.appendChild(custom.cloneNode(true));
        }
    }
})(CustomElements || (CustomElements = {}));
//# sourceMappingURL=Main.js.map