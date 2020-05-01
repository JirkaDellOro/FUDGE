namespace FudgeUserInterface {
  /**
   * A standard text input field with a label to it.
   */
  export class CustomElementTextInput extends CustomElement {
    // @ts-ignore
    private static customElement: void = CustomElement.register("fudge-textinput", CustomElementTextInput, String);

    constructor(_attributes: CustomElementAttributes) {
      super(_attributes);
    }

    /**
     * Creates the content of the element when connected the first time
     */
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

    /**
     * Retrieves the content of the input element
     */
    public getMutatorValue(): string {
      return this.querySelector("input").value;
    }
    /**
     * Sets the content of the input element
     */
    public setMutatorValue(_value: string): void {
      this.querySelector("input").value = _value;
    }
  }
}