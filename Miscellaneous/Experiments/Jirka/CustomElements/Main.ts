namespace CustomElements {
  window.addEventListener("load", init);

  class Stepper extends HTMLSpanElement {
    public label: HTMLLabelElement;
    public input: HTMLInputElement;

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
      console.log("Label", this.getAttribute("label"));
      console.log("Inner", this.textContent);
      this.appendChild(this.label);
      this.appendChild(this.input);
    }

    disconnectedCallback(): void {
      console.log("I'm abandoned");
    }
  }

  window.customElements.define("test-stepper", Stepper, { extends: "span" });

  function init(_event: Event): void {
    let stepper: Stepper = document.querySelector("[is=test-stepper]");
    console.log(stepper);
    console.log(stepper.innerHTML);
    document.body.removeChild(stepper);
    document.body.appendChild(stepper);
  }
}