namespace Custom {
  window.addEventListener("load", init);
  let templates: Map<string, DocumentFragment> = new Map();

  export class CustomElementBoolean extends CustomElement {
    // @ts-ignore
    private static customElement: void = customElements.define("fudge-boolean", CustomElementBoolean);
    constructor(_key: string, _label?: string) {
      super(_key);
      if (_label == undefined)
        _label = _key;
      if (_label)
        this.setAttribute("label", _label);
    }

    connectedCallback(): void {
      let input: HTMLInputElement = document.createElement("input");
      input.type = "checkbox";
      input.id = CustomElement.nextId;
      this.appendChild(input);

      let label: HTMLLabelElement = document.createElement("label");
      label.textContent = this.getAttribute("label");
      label.htmlFor = input.id;
      this.appendChild(label);

      console.log(this.getAttribute("key"));
    }
  }


  export class Custom extends HTMLElement {
    public static tag: string;
    private initialized: boolean = false;

    constructor() {
      super();
    }

    connectedCallback(): void {
      if (this.initialized)
        return;
      let fragment: DocumentFragment = templates.get(Reflect.get(this.constructor, "tag"));
      let content: HTMLElement = <HTMLElement>fragment.firstElementChild;

      let style: CSSStyleDeclaration = this.style;
      for (let entry of content.style) {
        style.setProperty(entry, Reflect.get(content.style, entry));
      }
      for (let child of content.childNodes) {
        this.appendChild(child.cloneNode(true));
      }
      this.initialized = true;
    }
  }

  // export function registerTemplate(_template: HTMLTemplateElement): void {
  export function registerTemplate(_tagName: string): void {
    for (let template of document.querySelectorAll("template")) {
      if (template.content.firstElementChild.localName == _tagName) {
        console.log("Register", template);
        templates.set(_tagName, template.content);
      }
    }
  }

  export function registerClass(_tag: string, _class: typeof Custom): void {
    console.log(_tag, _class);
    _class.tag = _tag;
    customElements.define(_tag, _class);
  }

  class Stepper extends HTMLParagraphElement {
    private static customElement: void = customElements.define("test-stepper", Stepper, { extends: "p" });
    public label: HTMLLabelElement;
    public input: HTMLInputElement;
    private initialized: boolean = false;

    constructor(_label: string = "Parameter") {
      super();
      console.log("I'm alive");

      this.label = document.createElement("label");
      this.label.innerHTML = _label;

      this.input = document.createElement("input");
      this.input.type = "number";
    }

    connectedCallback(): void {
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

    disconnectedCallback(): void {
      console.log("I'm abandoned");
    }
  }


  function init(_event: Event): void {
    // let stepper: Stepper = document.querySelector("[is=test-stepper]");
    // console.log(stepper);
    // console.log(stepper.innerHTML);
    // document.body.removeChild(stepper);
    // document.body.appendChild(stepper);

    // let stepper2: Stepper = new Stepper("Step2");
    // document.body.appendChild(stepper2);

    // let templates: NodeListOf<HTMLTemplateElement> = document.querySelectorAll("template");

    for (let entry of templates) {
      let name: string = entry[0];
      let fieldset: HTMLFieldSetElement = document.createElement("fieldset");
      let legend: HTMLLegendElement = document.createElement("legend");
      legend.textContent = name;
      fieldset.appendChild(legend);
      fieldset.appendChild(document.createElement(name));
      document.body.appendChild(fieldset);
    }

    let fudgeBoolean: CustomElementBoolean = new CustomElementBoolean("boolean", "new Boolean");
    document.body.appendChild(fudgeBoolean);
    document.body.appendChild(document.createElement("br"));

    let fudgeStepper: CustomElementBoolean = new CustomElementStepper("stepper", { min: -10, max: 10, step: 2, value: 5 });
    document.body.appendChild(fudgeStepper);
    document.body.appendChild(document.createElement("br"));

    fudgeBoolean = <CustomElementBoolean>document.createElement("fudge-boolean");
    fudgeBoolean.setAttribute("label", "createBoolean");
    fudgeBoolean.setAttribute("key", "boolean");
    document.body.appendChild(fudgeBoolean);
    document.body.appendChild(document.createElement("br"));

    fudgeStepper = <CustomElementStepper>document.createElement("fudge-stepper");
    fudgeStepper.setAttribute("label", "createStepper");
    fudgeStepper.setAttribute("key", "stepper");
    fudgeStepper.setAttribute("step", "0.1");
    document.body.appendChild(fudgeStepper);
    document.body.appendChild(document.createElement("br"));

    // customElements.define("custom-boolean", CustomElementBoolean);
    // customElements.define("custom-vector3", CustomVector3);
  }
}