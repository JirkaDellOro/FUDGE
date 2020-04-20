namespace FudgeUserInterface {
  export class CustomElementBoolean extends CustomElement {
    // @ts-ignore
    private static customElement: void = CustomElement.register("fudge-boolean", CustomElementBoolean, Boolean);

    constructor(_attributes: CustomElementAttributes) {
      super(_attributes);
      if (!_attributes.label)
        this.setAttribute("label", _attributes.key);
    }

    connectedCallback(): void {
      if (this.initialized)
        return;
      this.initialized = true;

      let input: HTMLInputElement = document.createElement("input");
      input.type = "checkbox";
      input.id = CustomElement.nextId;
      input.checked = this.getAttribute("value") == "true";
      this.appendChild(input);

      this.appendLabel().htmlFor = input.id;
    }
  }
}