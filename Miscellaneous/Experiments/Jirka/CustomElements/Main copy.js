var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var CustomElements;
(function (CustomElements) {
    window.addEventListener("load", init);
    var CustomBoolean = /** @class */ (function (_super) {
        __extends(CustomBoolean, _super);
        function CustomBoolean() {
            return _super.call(this) || this;
        }
        CustomBoolean.prototype.connectedCallback = function () {
            console.log("Test-Simple");
            var input = document.createElement("input");
            input.type = "checkbox";
            input.id = "test";
            this.appendChild(input);
            var label = document.createElement("label");
            label.textContent = this.getAttribute("label");
            label.htmlFor = input.id;
            this.appendChild(label);
            console.log(this.getAttribute("key"));
        };
        CustomBoolean.customElement = customElements.define("custom-boolean", CustomBoolean);
        return CustomBoolean;
    }(HTMLElement));
    var Stepper = /** @class */ (function (_super) {
        __extends(Stepper, _super);
        function Stepper(_label) {
            if (_label === void 0) { _label = "Parameter"; }
            var _this = _super.call(this) || this;
            _this.initialized = false;
            console.log("I'm alive");
            _this.label = document.createElement("label");
            _this.label.innerHTML = _label;
            _this.input = document.createElement("input");
            _this.input.type = "number";
            return _this;
        }
        Stepper.prototype.connectedCallback = function () {
            console.log("I'm adopted");
            if (this.initialized)
                return;
            console.log("Initializing");
            console.log("Label", this.getAttribute("label"));
            console.log("Inner", this.textContent);
            this.appendChild(this.label);
            this.appendChild(this.input);
            this.initialized = true;
        };
        Stepper.prototype.disconnectedCallback = function () {
            console.log("I'm abandoned");
        };
        Stepper.customElement = customElements.define("test-stepper", Stepper, { extends: "p" });
        return Stepper;
    }(HTMLParagraphElement));
    function init(_event) {
        // let stepper: Stepper = document.querySelector("[is=test-stepper]");
        // console.log(stepper);
        // console.log(stepper.innerHTML);
        // document.body.removeChild(stepper);
        // document.body.appendChild(stepper);
        // let stepper2: Stepper = new Stepper("Step2");
        // document.body.appendChild(stepper2);
        // let templates: NodeListOf<HTMLTemplateElement> = document.querySelectorAll("template");
        var template = document.querySelector("template");
        console.log(template);
        var templates = template.content.children;
        console.log(templates);
        var _loop_1 = function (custom) {
            console.log(custom.tagName);
            var fieldset = document.createElement("fieldset");
            var legend = document.createElement("legend");
            legend.textContent = custom.tagName;
            fieldset.appendChild(legend);
            fieldset.appendChild(custom.cloneNode(true));
            document.body.appendChild(fieldset);
            // @ts-ignore
            customElements.define("custom-matrix4x4", function () { return custom.cloneNode(true); });
            console.log(custom);
            return "break";
        };
        for (var _i = 0, templates_1 = templates; _i < templates_1.length; _i++) {
            var custom = templates_1[_i];
            var state_1 = _loop_1(custom);
            if (state_1 === "break")
                break;
        }
    }
})(CustomElements || (CustomElements = {}));
//# sourceMappingURL=Main.js.map