namespace Custom {
  window.addEventListener("load", init);
  let templates: Map<string, HTMLElement> = new Map();

  class CustomBoolean extends HTMLElement {
    // private static customElement: void = customElements.define("custom-boolean", CustomBoolean);
    constructor() {
      super();
    }

    connectedCallback(): void {
      console.log("Test-Simple");
      let input: HTMLInputElement = document.createElement("input");
      input.type = "checkbox";
      input.id = "test";
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
    public node: HTMLElement;
    private initialized: boolean = false;

    constructor() {
      super();
    }

    connectedCallback(): void {
      // debugger;
      if (this.initialized)
        return;
      // this.parentElement.replaceChild(node, this);
      console.log(this.constructor["tag"]);
      this.node = <HTMLElement>templates.get(this.constructor["tag"]).children[0].cloneNode(true);
      this.initialized = true;
      this.appendChild(this.node);
    }
  }

  class CustomMatrix4x4 extends Custom {
    public static tag: string = "CUSTOM-MATRIX4X4";
  }

  class CustomVector3 extends Custom {
    public static tag: string = "CUSTOM-VECTOR3";
  }

  export function add(_classes: typeof Custom[]): void {
    console.log(_classes);
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
    let template: HTMLTemplateElement = document.querySelector("template");
    console.log(template);
    for (let custom of template.content.children) {
      templates.set(custom.tagName, <HTMLElement>custom);
    }

    for (let entry of templates) {
      let custom: HTMLElement = entry[1];
      console.log(custom.tagName);
      let fieldset: HTMLFieldSetElement = document.createElement("fieldset");
      let legend: HTMLLegendElement = document.createElement("legend");
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
}