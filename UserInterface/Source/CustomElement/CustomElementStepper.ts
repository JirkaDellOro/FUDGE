namespace FudgeUserInterface {
  import ƒ = FudgeCore;

  /**
   * An interactive number stepper with exponential display and complex handling using keyboard and mouse
   */
  export class CustomElementStepper extends CustomElement {
    // @ts-ignore
    private static customElement: void = CustomElement.register("fudge-stepper", CustomElementStepper, Number);
    public value: number = 0;

    constructor(_attributes?: CustomElementAttributes) {
      super(_attributes);
      if (_attributes && _attributes["value"])
        this.value = parseFloat(_attributes["value"]);
    }

    /**
     * Creates the content of the element when connected the first time
     */
    connectedCallback(): void {
      if (this.initialized)
        return;
      this.initialized = true;

      this.tabIndex = 0;

      this.appendLabel();

      let input: HTMLInputElement = document.createElement("input");
      input.type = "number";
      input.style.position = "absolute";
      input.style.display = "none";
      input.addEventListener(EVENT.INPUT, (_event: Event): void => { _event.stopPropagation(); });
      this.appendChild(input);


      let sign: HTMLSpanElement = document.createElement("span");
      sign.textContent = "+";
      this.appendChild(sign);
      for (let exp: number = 2; exp > -4; exp--) {
        let digit: CustomElementDigit = new CustomElementDigit();
        digit.setAttribute("exp", exp.toString());
        this.appendChild(digit);
        if (exp == 0)
          this.innerHTML += ".";
      }
      this.innerHTML += "e";

      let exp: HTMLSpanElement = document.createElement("span");
      exp.textContent = "+0";
      exp.tabIndex = -1;
      exp.setAttribute("name", "exp");
      this.appendChild(exp);


      // input.addEventListener(EVENT.CHANGE, this.hndInput);
      input.addEventListener(EVENT.BLUR, this.hndInput);
      this.addEventListener(EVENT.BLUR, this.hndFocus);
      this.addEventListener(EVENT.KEY_DOWN, this.hndKey);
      this.addEventListener(EVENT.WHEEL, this.hndWheel);
      this.display();
    }

    /**
     * De-/Activates tabbing for the inner digits
     */
    public activateInnerTabs(_on: boolean): void {
      let index: number = _on ? 0 : -1;

      let spans: NodeListOf<HTMLSpanElement> = this.querySelectorAll("span");
      spans[1].tabIndex = index;

      let digits: NodeListOf<CustomElementDigit> = this.querySelectorAll("fudge-digit");
      for (let digit of digits)
        digit.tabIndex = index;
    }

    /**
     * Opens/Closes a standard number input for typing the value at once
     */
    public openInput(_open: boolean): void {
      let input: HTMLInputElement = <HTMLInputElement>this.querySelector("input");
      if (_open) {
        input.style.display = "inline";
        input.value = this.value.toString();
        input.focus();
      } else {
        input.style.display = "none";
      }
    }

    /**
     * Retrieve the value of this
     */
    public getMutatorValue(): number {
      return this.value;
    }
    /**
     * Sets its value and displays it
     */
    public setMutatorValue(_value: number): void {
      this.value = _value;
      this.display();
    }

    /**
     * Retrieve mantissa and exponent separately as an array of two members
     */
    public getMantissaAndExponent(): number[] {
      let prec: string = this.value.toExponential(6);
      let exp: number = parseInt(prec.split("e")[1]);
      let exp3: number = Math.trunc(exp / 3);
      let mantissa: number = this.value / Math.pow(10, exp3 * 3);
      mantissa = Math.round(mantissa * 1000) / 1000;
      return [mantissa, exp3 * 3];
    }

    /**
     * Retrieves this value as a string
     */
    public toString(): string {
      let [mantissa, exp]: number[] = this.getMantissaAndExponent();
      let prefixMantissa: string = (mantissa < 0) ? "" : "+";
      let prefixExp: string = (exp < 0) ? "" : "+";
      return prefixMantissa + mantissa.toFixed(3) + "e" + prefixExp + exp;
    }

    /**
     * Displays this value by setting the contents of the digits and the exponent
     */
    private display(): void {
      let digits: NodeListOf<CustomElementDigit> = this.querySelectorAll("fudge-digit");
      let spans: NodeListOf<HTMLSpanElement> = this.querySelectorAll("span");

      if (!isFinite(this.value)) {
        for (let pos: number = 0; pos < digits.length; pos++) {
          let digit: CustomElementDigit = digits[5 - pos];
          digit.innerHTML = "  ∞   "[5 - pos];
          spans[1].textContent = "  ";
        }
        return;
      }
      
      let [mantissa, exp]: string[] = this.toString().split("e");
      spans[0].textContent = this.value < 0 ? "-" : "+";
      spans[1].textContent = exp;

      mantissa = mantissa.substring(1);
      mantissa = mantissa.replace(".", "");
      for (let pos: number = 0; pos < digits.length; pos++) {
        let digit: CustomElementDigit = digits[5 - pos];
        if (pos < mantissa.length) {
          let char: string = mantissa.charAt(mantissa.length - 1 - pos);
          digit.textContent = char;
        }
        else
          digit.innerHTML = "&nbsp;";
      }
    }

    /**
     * Handle keyboard input on this element and its digits
     */
    private hndKey = (_event: KeyboardEvent): void => {
      let active: Element = document.activeElement;
      let numEntered: number = _event.key.charCodeAt(0) - 48;

      _event.stopPropagation();

      // if focus is on stepper, enter it and focus digit
      if (active == this) {
        switch (_event.code) {
          case ƒ.KEYBOARD_CODE.ENTER:
          case ƒ.KEYBOARD_CODE.NUMPAD_ENTER:
          case ƒ.KEYBOARD_CODE.SPACE:
          case ƒ.KEYBOARD_CODE.ARROW_UP:
          case ƒ.KEYBOARD_CODE.ARROW_DOWN:
            this.activateInnerTabs(true);
            (<HTMLElement>this.querySelectorAll("fudge-digit")[2]).focus();
            break;
          case ƒ.KEYBOARD_CODE.F2:
            this.openInput(true);
            break;
        }
        if ((numEntered >= 0 && numEntered <= 9) || _event.key == "-" || _event.key == "+") {
          this.openInput(true);
          this.querySelector("input").value = "";
          // _event.stopImmediatePropagation();
        }
        return;
      }

      // input field overlay is active
      if (active.getAttribute("type") == "number") {
        if (_event.key == ƒ.KEYBOARD_CODE.ENTER || _event.key == ƒ.KEYBOARD_CODE.NUMPAD_ENTER || _event.key == ƒ.KEYBOARD_CODE.TABULATOR) {
          this.value = Number((<HTMLInputElement>active).value);
          this.display();
          this.openInput(false);
          this.focus();
          this.dispatchEvent(new Event(EVENT.INPUT, { bubbles: true }));
        }
        return;
      }

      if (numEntered >= 0 && numEntered <= 9) {
        let difference: number = numEntered - Number(active.textContent) * (this.value < 0 ? -1 : 1);
        this.changeDigitFocussed(difference);

        let next: HTMLElement = <HTMLElement>active.nextElementSibling;
        if (next)
          next.focus();

        this.dispatchEvent(new Event(EVENT.INPUT, { bubbles: true }));
        return;
      }

      if (_event.key == "-" || _event.key == "+") {
        this.value = (_event.key == "-" ? -1 : 1) * Math.abs(this.value);
        this.display();
        this.dispatchEvent(new Event(EVENT.INPUT, { bubbles: true }));
        return;
      }

      if (_event.code != ƒ.KEYBOARD_CODE.TABULATOR)
        _event.preventDefault();

      switch (_event.code) {
        case ƒ.KEYBOARD_CODE.ARROW_DOWN:
          this.changeDigitFocussed(-1);
          this.dispatchEvent(new Event(EVENT.INPUT, { bubbles: true }));
          break;
        case ƒ.KEYBOARD_CODE.ARROW_UP:
          this.changeDigitFocussed(+1);
          this.dispatchEvent(new Event(EVENT.INPUT, { bubbles: true }));
          break;
        case ƒ.KEYBOARD_CODE.ARROW_LEFT:
          (<HTMLElement>active.previousElementSibling).focus();
          break;
        case ƒ.KEYBOARD_CODE.ARROW_RIGHT:
          let next: HTMLElement = <HTMLElement>active.nextElementSibling;
          if (next)
            next.focus();
          break;
        case ƒ.KEYBOARD_CODE.ENTER:
        case ƒ.KEYBOARD_CODE.NUMPAD_ENTER:
        case ƒ.KEYBOARD_CODE.ESC:
          this.activateInnerTabs(false);
          this.focus();
          break;
        case ƒ.KEYBOARD_CODE.F2:
          this.activateInnerTabs(false);
          this.openInput(true);
          break;
        default:
          break;
      }
    }

    private hndWheel = (_event: WheelEvent): void => {
      _event.stopPropagation();
      _event.preventDefault();
      let change: number = _event.deltaY < 0 ? +1 : -1;
      this.changeDigitFocussed(change);
      this.dispatchEvent(new Event(EVENT.INPUT, { bubbles: true }));
    }

    private hndInput = (_event: Event): void => {
      this.openInput(false);
    }

    private hndFocus = (_event: Event): void => {
      if (this.contains(document.activeElement))
        return;

      this.activateInnerTabs(false);
    }

    private changeDigitFocussed(_amount: number): void {
      let digit: Element = document.activeElement;
      if (digit == this || !this.contains(digit))
        return;

      _amount = Math.round(_amount);
      if (_amount == 0)
        return;

      if (digit == this.querySelector("[name=exp]")) {
        // console.log(this.value);
        let value: number = this.value * Math.pow(10, _amount);
        console.log(value, this.value);
        if (isFinite(value))
          this.value = value; 
        this.display();
        return;
      }

      let expDigit: number = parseInt(digit.getAttribute("exp"));
      // @ts-ignore (mantissa not used)
      let [mantissa, expValue]: number[] = this.getMantissaAndExponent();

      let prev: number = this.value;
      this.value += _amount * Math.pow(10, expDigit + expValue);
      // workaround precision problems of javascript
      if (Math.abs(prev / this.value) > 1000)
        this.value = 0;


      let expNew: number;
      [mantissa, expNew] = this.getMantissaAndExponent();
      // console.log(mantissa);
      this.shiftFocus(expNew - expValue);
      this.display();
    }

    private shiftFocus(_nDigits: number): void {
      let shiftFocus: Element = document.activeElement;
      if (_nDigits) {
        for (let i: number = 0; i < 3; i++)
          if (_nDigits > 0)
            shiftFocus = shiftFocus.nextElementSibling;
          else
            shiftFocus = shiftFocus.previousElementSibling;

        (<HTMLElement>shiftFocus).focus();
      }
    }
  }
}
