namespace FudgeUserInterface {
  import ƒ = FudgeCore;
  /**
   * A standard text input field with a label to it.
   */
  export class CustomElementArray extends CustomElement {
    // @ts-ignore
    private static customElement: void = CustomElement.register("fudge-array", CustomElementArray, /* ƒ.Mutable */Array);

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
      
      let fieldset: ExpandableFieldSet = Generator.createExpendableFieldset(this.getAttribute("label"), "Array");
      this.appendChild(fieldset);
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
    public setMutatorValue(_value: ƒ.MutableArray<ƒ.Mutable>): void {
      // console.log(_value);
    }

    // private createList(): void {
    //   //
    // }
  }
}