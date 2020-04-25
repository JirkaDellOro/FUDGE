namespace FudgeUserInterface {
  export class CustomElementTextInput extends CustomElement {
    // @ts-ignore
    private static customElement: void = CustomElement.register("fudge-textinput", CustomElementTextInput, String);

    constructor(_attributes: CustomElementAttributes) {
      super(_attributes);
    }

    connectedCallback(): void {
      if (this.initialized)
        return;
      this.initialized = true;

      this.appendLabel();
      
      let input: HTMLInputElement = document.createElement("input");
      input.id = CustomElement.nextId;
      input.value = this.getAttribute("value");
      this.appendChild(input);

    }

    public getMutatorValue(): string {
      return this.querySelector("input").value;
    }
    public setMutatorValue(_value: string): void {
      this.querySelector("input").value = _value;
    }
  }
}