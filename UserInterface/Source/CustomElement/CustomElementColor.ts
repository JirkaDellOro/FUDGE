namespace FudgeUserInterface {
  import ƒ = FudgeCore;
  /**
   * A color picker with a label to it and a slider for opacity
   */
  export class CustomElementColor extends CustomElement {
    // @ts-ignore
    private static customElement: void = CustomElement.register("fudge-color", CustomElementColor, ƒ.Color);
    public color: ƒ.Color = new ƒ.Color();

    constructor(_attributes: CustomElementAttributes) {
      super(_attributes);
      if (!_attributes.label)
        this.setAttribute("label", _attributes.key);

      this.addEventListener(EVENT.KEY_DOWN, this.hndKey);
    }

    /**
     * Creates the content of the element when connected the first time
     */
    connectedCallback(): void {
      if (this.initialized)
        return;
      this.initialized = true;

      this.appendLabel();

      let picker: HTMLInputElement = document.createElement("input");
      picker.type = "color";

      picker.tabIndex = 0;
      this.appendChild(picker);

      let slider: HTMLInputElement = document.createElement("input");
      slider.type = "range";
      slider.min = "0";
      slider.max = "1";
      slider.step = "0.01";
      this.appendChild(slider);
      slider.addEventListener(EVENT.WHEEL, this.hndWheel);
    }

    /**
     * Retrieves the values of picker and slider as ƒ.Mutator
     */
    public getMutatorValue(): ƒ.Mutator {
      let hex: string = (<HTMLInputElement>this.querySelector("input[type=color")).value;
      let alpha: string = (<HTMLInputElement>this.querySelector("input[type=range")).value;
      this.color.setHex(hex.substr(1, 6) + "ff");
      this.color.a = parseFloat(alpha);
      return this.color.getMutatorForUserInterface();
    }
    /**
     * Sets the values of color picker and slider
     */
    public setMutatorValue(_value: ƒ.Mutator): void {
      this.color.mutate(_value);
      let hex: string = this.color.getHex();
      (<HTMLInputElement>this.querySelector("input[type=color")).value = "#" + hex.substr(0, 6);
      (<HTMLInputElement>this.querySelector("input[type=range")).value = this.color.a.toString();
    }

    private hndKey(_event: KeyboardEvent): void {
      _event.stopPropagation();
    }
    private hndWheel(_event: WheelEvent): void {
      let slider: HTMLInputElement = (<HTMLInputElement>_event.target);
      if (slider != document.activeElement)
        return;
      _event.stopPropagation();
      _event.preventDefault();
      // console.log(_event.deltaY / 1000);
      let currentValue: number = Number(slider.value);
      slider.value = String(currentValue - _event.deltaY / 1000);
      slider.dispatchEvent(new Event(EVENT.INPUT, { bubbles: true }));
    }
  }
}