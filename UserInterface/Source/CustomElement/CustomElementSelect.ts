namespace FudgeUserInterface {
  /**
   * A dropdown menu to display enums
   */
  export class CustomElementSelect extends CustomElement {
    // @ts-ignore
    private static customElement: void = CustomElement.register("fudge-select", CustomElementSelect, Object);
    public content: Object;

    constructor(_attributes: CustomElementAttributes, _content: Object = {}) {
      super(_attributes);
      if (!_attributes.label)
        this.setAttribute("label", _attributes.key);
      this.content = _content;
    }

    /**
     * Creates the content of the element when connected the first time
     */
    connectedCallback(): void {
      if (this.initialized)
        return;
      this.initialized = true;

      this.appendLabel();

      let select: HTMLSelectElement = document.createElement("select");
      for (let key in this.content) {
        if (!isNaN(parseInt(key))) //key being a number will not be shown, assuming it's a simple enum with double entries
          continue;
        let value: string | number = (<{ [key: string]: string | number }>this.content)[key];
        let entry: HTMLOptionElement = document.createElement("option");
        entry.text = key;
        entry.setAttribute("type", typeof value);
        entry.value = value.toString();
        // console.log(this.getAttribute("value"));
        if (entry.value == this.getAttribute("value")) {
          entry.selected = true;
        }
        select.add(entry);
      }
      select.tabIndex = 0;
      this.appendChild(select);
    }

    /**
     * Retrieves the status of the checkbox as boolean value
     */
    public getMutatorValue(): string | number {
      let select: HTMLSelectElement = this.querySelector("select");
      let type: string = select.options[select.selectedIndex]?.getAttribute("type") || "string";
      return type == "number" ? parseFloat(select.value) : select.value;
    }
    /**
     * Sets the status of the checkbox
     */
    public setMutatorValue(_value: string): void {
      this.querySelector("select").value = _value;
      // this.value = _value;
    }
  }
}