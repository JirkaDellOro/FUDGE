namespace CustomElements {
  window.addEventListener("load", init);

  class Stepper extends HTMLParagraphElement {
    // tslint:disable:typedef
    private static customElement = customElements.define("test-stepper", Stepper, { extends: "p" });
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
    let stepper: Stepper = document.querySelector("[is=test-stepper]");
    console.log(stepper);
    console.log(stepper.innerHTML);
    document.body.removeChild(stepper);
    document.body.appendChild(stepper);

    let stepper2: Stepper = new Stepper("Step2");
    document.body.appendChild(stepper2);

    // let templates: NodeListOf<HTMLTemplateElement> = document.querySelectorAll("template");
    let template: HTMLTemplateElement = document.querySelector("template");
    console.log(template);
    let templates: HTMLCollection = template.content.children;
    console.log(templates);

    for (let custom of templates) {
      console.log(custom.tagName);
      document.body.appendChild(custom.cloneNode(true));
    }
  }
}