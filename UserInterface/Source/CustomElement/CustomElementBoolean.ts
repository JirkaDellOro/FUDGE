namespace FudgeUserInterface {
  export class CustomElementBoolean extends CustomElement {
    // @ts-ignore
    private static customElement: void = customElements.define("fudge-boolean", CustomElementBoolean);
    constructor(_key: string, _value: boolean = false) {
      super(_key);
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
}