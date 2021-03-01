namespace FudgeUserInterface {
  /**
   * A standard text input field with a label to it.
   */
  export class CustomElementArray extends CustomElement {
    // @ts-ignore
    private static customElement: void = CustomElement.register("fudge-array", CustomElementArray, Array);

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
      
      let list: HTMLOListElement = document.createElement("ol");
      list.id = CustomElement.nextId;
      // list.value = this.getAttribute("value");
      this.appendChild(list);
    }

    /**
     * Retrieves the content of the input element
     */
    public getMutatorValue(): string {
      return "";
      // return this.querySelector("input").value;
    }
    /**
     * Sets the content of the input element
     */
    public setMutatorValue(_value: Object): void {
      console.log(_value);
    }
  }
}