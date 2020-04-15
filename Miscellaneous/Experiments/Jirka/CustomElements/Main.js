var Custom;
(function (Custom_1) {
    window.addEventListener("load", init);
    let templates = new Map();
    class CustomBoolean extends HTMLElement {
        // private static customElement: void = customElements.define("custom-boolean", CustomBoolean);
        constructor() {
            super();
        }
        connectedCallback() {
            console.log("Test-Simple");
            let input = document.createElement("input");
            input.type = "checkbox";
            input.id = "test";
            this.appendChild(input);
            let label = document.createElement("label");
            label.textContent = this.getAttribute("label");
            label.htmlFor = input.id;
            this.appendChild(label);
            console.log(this.getAttribute("key"));
        }
    }
    class Custom extends HTMLElement {
        constructor() {
            super();
            this.initialized = false;
        }
        connectedCallback() {
            // debugger;
            if (this.initialized)
                return;
            // this.parentElement.replaceChild(node, this);
            console.log(this.constructor["tag"]);
            this.node = templates.get(this.constructor["tag"]).children[0].cloneNode(true);
            this.initialized = true;
            this.appendChild(this.node);
        }
    }
    Custom_1.Custom = Custom;
    let CustomMatrix4x4 = /** @class */ (() => {
        class CustomMatrix4x4 extends Custom {
        }
        CustomMatrix4x4.tag = "CUSTOM-MATRIX4X4";
        return CustomMatrix4x4;
    })();
    let CustomVector3 = /** @class */ (() => {
        class CustomVector3 extends Custom {
        }
        CustomVector3.tag = "CUSTOM-VECTOR3";
        return CustomVector3;
    })();
    function add(_classes) {
        console.log(_classes);
    }
    Custom_1.add = add;
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
        Stepper.customElement = customElements.define("test-stepper", Stepper, { extends: "p" });
        return Stepper;
    })();
    function init(_event) {
        // let stepper: Stepper = document.querySelector("[is=test-stepper]");
        // console.log(stepper);
        // console.log(stepper.innerHTML);
        // document.body.removeChild(stepper);
        // document.body.appendChild(stepper);
        // let stepper2: Stepper = new Stepper("Step2");
        // document.body.appendChild(stepper2);
        // let templates: NodeListOf<HTMLTemplateElement> = document.querySelectorAll("template");
        let template = document.querySelector("template");
        console.log(template);
        for (let custom of template.content.children) {
            templates.set(custom.tagName, custom);
        }
        for (let entry of templates) {
            let custom = entry[1];
            console.log(custom.tagName);
            let fieldset = document.createElement("fieldset");
            let legend = document.createElement("legend");
            legend.textContent = custom.tagName;
            fieldset.appendChild(legend);
            // fieldset.appendChild(custom.cloneNode(true));
            fieldset.appendChild(document.createElement(custom.tagName));
            document.body.appendChild(fieldset);
        }
        // debugger;
        customElements.define("custom-boolean", CustomBoolean);
        customElements.define("custom-vector3", CustomVector3);
    }
})(Custom || (Custom = {}));
//# sourceMappingURL=Main.js.map