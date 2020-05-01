namespace FudgeUserInterface {
  /**
   * A standard checkbox with a label to it
   */
  export class CustomElementBoolean extends CustomElement {
    // @ts-ignore
    private static customElement: void = CustomElement.register("fudge-boolean", CustomElementBoolean, Boolean);

    constructor(_attributes: CustomElementAttributes) {
      super(_attributes);
      if (!_attributes.label)
        this.setAttribute("label", _attributes.key);
    }

    /**
     * Creates the content of the element when connected the first time
     */
    connectedCallback(): void {
      if (this.initialized)
        return;
      this.initialized = true;

      // TODO: delete tabindex from checkbox and get space-key on this
      // this.tabIndex = 0;

      let input: HTMLInputElement = document.createElement("input");
      input.type = "checkbox";
      input.id = CustomElement.nextId;
      input.checked = this.getAttribute("value") == "true";
      this.appendChild(input);

      this.appendLabel().htmlFor = input.id;
    }

    /**
     * Retrieves the status of the checkbox as boolean value
     */
    public getMutatorValue(): boolean {
      return this.querySelector("input").checked;
    }
    /**
     * Sets the status of the checkbox
     */
    public setMutatorValue(_value: boolean): void {
      this.querySelector("input").checked = _value;
    }
  }
}