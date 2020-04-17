namespace FudgeUserInterface {
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
    }
  }
}