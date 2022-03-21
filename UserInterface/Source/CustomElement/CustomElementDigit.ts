namespace FudgeUserInterface {
  /**
   * Represents a single digit number to be used in groups to represent a multidigit value.
   * Is tabbable and in-/decreases previous sibling when flowing over/under.
   */
  export class CustomElementDigit extends HTMLElement {
    // @ts-ignore
    private static customElement: void = CustomElement.register("fudge-digit", CustomElementDigit);
    protected initialized: boolean = false;

    constructor() {
      super();
    }

    public set value(_value: number) {
      _value = Math.trunc(_value);
      if (_value > 9 || _value < 0)
        return;
      this.textContent = _value.toString();
    }

    public get value(): number {
      return parseInt(this.textContent);
    }
    
    connectedCallback(): void {
      if (this.initialized)
        return;
      this.initialized = true;

      this.value = 0;
      this.tabIndex = -1;
    }


    public add(_addend: number): void {
      _addend = Math.trunc(_addend);
      if (_addend == 0)
        return;

      if (_addend > 0) {
        if (this.value < 9)
          this.value++;
        else {
          let prev: CustomElementDigit = <CustomElementDigit>this.previousElementSibling;
          if (!(prev && prev instanceof CustomElementDigit))
            return;
          prev.add(1);
          this.value = 0;
        }
      }
      else {
        if (this.value > 0)
          this.value--;
        else {
          let prev: CustomElementDigit = <CustomElementDigit>this.previousElementSibling;
          if (!(prev && prev instanceof CustomElementDigit))
            return;
          prev.add(-1);
          this.value = 9;
        }
      }
    }
  }
}
