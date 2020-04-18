///<reference path="../../../../Core/Build/FudgeCore.d.ts"/>

namespace Custom {
  import ƒ = FudgeCore;

  export abstract class CustomElement extends HTMLElement {
    private static idCounter: number = 0;
    protected initialized: boolean = false;

    public constructor(_key: string) {
      super();
      if (_key)
        this.setAttribute("key", _key);
    }

    public get key(): string {
      return this.getAttribute("key");
    }

    public static get nextId(): string {
      return "ƒ" + CustomElement.idCounter++;
    }
  }


  export class CustomElementDigit extends HTMLElement {
    // @ ts-ignore
    private static customElement: void = customElements.define("fudge-digit", CustomElementDigit);

    constructor() {
      super();
    }

    connectedCallback(): void {
      this.value = 0;
      this.tabIndex = 0;
      // this.style.float = "left";
      // this.addEventListener("keydown", this.hndKey);
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

    public add(_addend: number): number {
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

  export class CustomElementStepper extends CustomElement {
    // @ts-ignore
    private static customElement: void = customElements.define("fudge-stepper", CustomElementStepper);
    public value: number = 0;
    public params: string;
    private prevDisplay: number = 0;

    constructor(_key: string, _label?: string, _params?: Object) {
      super(_key);
      if (_label == undefined)
        _label = _key;
      if (_label)
        this.setAttribute("label", _label);
      if (_params)
        for (let key in _params)
          this.setAttribute(key, _params[key]);
      if (_params && _params["value"])
        this.value = parseFloat(_params["value"]);
    }

    connectedCallback(): void {
      let label: HTMLLabelElement = document.createElement("label");
      label.textContent = this.getAttribute("label") + " ";
      // label.htmlFor = input.id;
      this.appendChild(label);

      let numbers: HTMLSpanElement = document.createElement("span");
      numbers.style.fontFamily = "monospace";
      this.appendChild(numbers);

      let sign: HTMLSpanElement = document.createElement("span");
      sign.textContent = "+";
      numbers.appendChild(sign);
      for (let exp: number = 2; exp > -4; exp--) {
        let digit: CustomElementDigit = new CustomElementDigit();
        digit.setAttribute("exp", exp.toString());
        numbers.appendChild(digit);
        if (exp == 0)
          numbers.innerHTML += ".";
      }
      numbers.innerHTML += "e";

      let exp: HTMLSpanElement = document.createElement("span");
      exp.textContent = "+0";
      numbers.appendChild(exp);

      this.addEventListener("keydown", this.hndKey);
      this.addEventListener("wheel", this.hndWheel);
    }

    public setValue(_value: number): void {
      this.value = _value;
    }
    public getValue(): number {
      return this.value;
    }

    public getMantissaAndExponent(): number[] {
      let prec: string = this.value.toExponential(6);
      let exp: number = parseInt(prec.split("e")[1]);
      let exp3: number = Math.trunc(exp / 3);
      let mantissa: number = this.value / Math.pow(10, exp3 * 3);
      return [mantissa, exp3 * 3];
    }

    public toString(): string {
      let [mantissa, exp]: number[] = this.getMantissaAndExponent();
      let prefixMantissa: string = (mantissa < 0) ? "" : "+";
      let prefixExp: string = (exp < 0) ? "" : "+";
      return prefixMantissa + mantissa.toFixed(3) + "e" + prefixExp + exp;
    }

    private display(): void {
      let [mantissa, exp]: string[] = this.toString().split("e");
      let spans: NodeListOf<HTMLSpanElement> = this.children[1].querySelectorAll("span");
      spans[0].textContent = this.value < 0 ? "-" : "+";
      spans[1].textContent = exp;

      let digits: NodeListOf<CustomElementDigit> = this.querySelectorAll("fudge-digit");
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

    private hndKey = (_event: KeyboardEvent): void => {
      let digit: Element = document.activeElement;

      switch (_event.code) {
        case ƒ.KEYBOARD_CODE.ARROW_DOWN:
          this.changeDigitFocussed(-1);
          break;
        case ƒ.KEYBOARD_CODE.ARROW_UP:
          this.changeDigitFocussed(+1);
          break;
        case ƒ.KEYBOARD_CODE.ARROW_LEFT:
          (<HTMLElement>digit.previousElementSibling).focus();
          break;
        case ƒ.KEYBOARD_CODE.ARROW_RIGHT:
          let next: HTMLElement = <HTMLElement>digit.nextElementSibling;
          if (next)
            next.focus();
          break;
        default:
          break;
      }
    }

    private hndWheel = (_event: WheelEvent): void => {
      let change: number = _event.deltaY < 0 ? -1 : +1;
      this.changeDigitFocussed(change);
    }

    private changeDigitFocussed(_amount: number): void {
      let digit: Element = document.activeElement;
      if (!this.contains(digit))
        return;
          
      _amount = Math.round(_amount);
      if (_amount == 0)
        return;


      let expDigit: number = parseInt(digit.getAttribute("exp"));
      let [mantissa, expValue]: number[] = this.getMantissaAndExponent();

      this.value += _amount * Math.pow(10, expDigit + expValue);

      let expNew: number;
      [mantissa, expNew] = this.getMantissaAndExponent();
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
