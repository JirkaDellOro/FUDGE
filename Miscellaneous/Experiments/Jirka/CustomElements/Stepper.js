///<reference path="../../../../Core/Build/FudgeCore.d.ts"/>
var Custom;
(function (Custom) {
    var ƒ = FudgeCore;
    let CustomElement = /** @class */ (() => {
        class CustomElement extends HTMLElement {
            constructor(_key) {
                super();
                this.initialized = false;
                if (_key)
                    this.setAttribute("key", _key);
            }
            get key() {
                return this.getAttribute("key");
            }
            static get nextId() {
                return "ƒ" + CustomElement.idCounter++;
            }
        }
        CustomElement.idCounter = 0;
        return CustomElement;
    })();
    Custom.CustomElement = CustomElement;
    let CustomElementDigit = /** @class */ (() => {
        class CustomElementDigit extends HTMLElement {
            constructor() {
                super();
            }
            connectedCallback() {
                this.value = 0;
                this.tabIndex = 0;
                // this.style.float = "left";
                // this.addEventListener("keydown", this.hndKey);
            }
            set value(_value) {
                _value = Math.trunc(_value);
                if (_value > 9 || _value < 0)
                    return;
                this.textContent = _value.toString();
            }
            get value() {
                return parseInt(this.textContent);
            }
            add(_addend) {
                _addend = Math.trunc(_addend);
                if (_addend == 0)
                    return;
                if (_addend > 0) {
                    if (this.value < 9)
                        this.value++;
                    else {
                        let prev = this.previousElementSibling;
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
                        let prev = this.previousElementSibling;
                        if (!(prev && prev instanceof CustomElementDigit))
                            return;
                        prev.add(-1);
                        this.value = 9;
                    }
                }
            }
        }
        // @ ts-ignore
        CustomElementDigit.customElement = customElements.define("fudge-digit", CustomElementDigit);
        return CustomElementDigit;
    })();
    Custom.CustomElementDigit = CustomElementDigit;
    let CustomElementStepper = /** @class */ (() => {
        class CustomElementStepper extends CustomElement {
            constructor(_key, _label, _params) {
                super(_key);
                this.value = 0;
                this.prevDisplay = 0;
                this.hndKey = (_event) => {
                    let digit = _event.target;
                    let expDigit = parseInt(digit.getAttribute("exp"));
                    let expValue = parseInt(this.toString().split("e")[1]);
                    switch (_event.code) {
                        case ƒ.KEYBOARD_CODE.ARROW_DOWN:
                            this.value -= Math.pow(10, expDigit + expValue);
                            break;
                        case ƒ.KEYBOARD_CODE.ARROW_UP:
                            this.value += Math.pow(10, expDigit + expValue);
                            break;
                        case ƒ.KEYBOARD_CODE.ARROW_LEFT:
                            digit.previousElementSibling.focus();
                            break;
                        case ƒ.KEYBOARD_CODE.ARROW_RIGHT:
                            let next = digit.nextElementSibling;
                            if (next)
                                next.focus();
                            break;
                        default:
                            break;
                    }
                    console.log(this.value);
                    console.log(this.toString());
                    this.display();
                };
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
            connectedCallback() {
                let label = document.createElement("label");
                label.textContent = this.getAttribute("label") + " ";
                // label.htmlFor = input.id;
                this.appendChild(label);
                let numbers = document.createElement("span");
                let sign = document.createElement("span");
                sign.textContent = "+";
                numbers.appendChild(sign);
                for (let exp = 2; exp > -4; exp--) {
                    let digit = new CustomElementDigit();
                    digit.setAttribute("exp", exp.toString());
                    numbers.appendChild(digit);
                    if (exp == 0)
                        numbers.innerHTML += ".";
                }
                numbers.innerHTML += "e";
                let exp = document.createElement("span");
                exp.textContent = "+0";
                numbers.appendChild(exp);
                this.appendChild(numbers);
                this.addEventListener("keydown", this.hndKey);
            }
            setValue(_value) {
                this.value = _value;
            }
            getValue() {
                return this.value;
            }
            toString() {
                let prec = this.value.toExponential(6);
                let exp = parseInt(prec.split("e")[1]);
                let exp3 = Math.trunc(exp / 3);
                // console.log(prec, exp, exp3);
                let mantissa = (this.value / Math.pow(10, exp3 * 3)).toFixed(3);
                let prefix = (this.value < 0) ? "" : "+";
                return prefix + mantissa + "e" + exp3 * 3;
            }
            display() {
                // let mantissa: string;
                // let exp: string;
                let [mantissa, exp] = this.toString().split("e");
                let spans = this.children[1].querySelectorAll("span");
                console.log(spans);
                spans[0].textContent = this.value < 0 ? "-" : "+";
                spans[1].textContent = exp;
                let digits = this.querySelectorAll("fudge-digit");
                mantissa = mantissa.substring(1);
                mantissa = mantissa.replace(".", "");
                for (let pos = 0; pos < digits.length; pos++) {
                    let digit = digits[5 - pos];
                    if (pos < mantissa.length) {
                        let char = mantissa.charAt(mantissa.length - 1 - pos);
                        digit.textContent = char;
                        // digit.style.visibility = "visible";
                    }
                    else
                        digit.innerHTML = "&nbsp;";
                    // digit.style.visibility = "hidden";
                }
            }
        }
        // @ts-ignore
        CustomElementStepper.customElement = customElements.define("fudge-stepper", CustomElementStepper);
        return CustomElementStepper;
    })();
    Custom.CustomElementStepper = CustomElementStepper;
})(Custom || (Custom = {}));
//# sourceMappingURL=Stepper.js.map