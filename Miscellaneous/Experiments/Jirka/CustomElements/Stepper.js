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
                this.tabIndex = -1;
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
            constructor(_key, _params) {
                super(_key);
                this.value = 0;
                this.prevDisplay = 0;
                this.hndKey = (_event) => {
                    let active = document.activeElement;
                    let numEntered = _event.key.charCodeAt(0) - 48;
                    if (active == this) {
                        switch (_event.code) {
                            case ƒ.KEYBOARD_CODE.ENTER:
                            case ƒ.KEYBOARD_CODE.NUMPAD_ENTER:
                            case ƒ.KEYBOARD_CODE.SPACE:
                            case ƒ.KEYBOARD_CODE.ARROW_UP:
                            case ƒ.KEYBOARD_CODE.ARROW_DOWN:
                                this.activateInnerTabs(true);
                                this.querySelectorAll("fudge-digit")[2].focus();
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
                        if (_event.key == ƒ.KEYBOARD_CODE.ENTER || _event.key == ƒ.KEYBOARD_CODE.NUMPAD_ENTER) {
                            this.value = Number(active.value);
                            this.display();
                            this.openInput(false);
                            this.focus();
                        }
                        return;
                    }
                    if (numEntered >= 0 && numEntered <= 9) {
                        let difference = numEntered - Number(active.textContent) * (this.value < 0 ? -1 : 1);
                        this.changeDigitFocussed(difference);
                        let next = active.nextElementSibling;
                        if (next)
                            next.focus();
                        return;
                    }
                    if (_event.key == "-" || _event.key == "+") {
                        this.value = (_event.key == "-" ? -1 : 1) * Math.abs(this.value);
                        this.display();
                        return;
                    }
                    switch (_event.code) {
                        case ƒ.KEYBOARD_CODE.ARROW_DOWN:
                            this.changeDigitFocussed(-1);
                            break;
                        case ƒ.KEYBOARD_CODE.ARROW_UP:
                            this.changeDigitFocussed(+1);
                            break;
                        case ƒ.KEYBOARD_CODE.ARROW_LEFT:
                            active.previousElementSibling.focus();
                            break;
                        case ƒ.KEYBOARD_CODE.ARROW_RIGHT:
                            let next = active.nextElementSibling;
                            if (next)
                                next.focus();
                            break;
                        case ƒ.KEYBOARD_CODE.ENTER:
                        case ƒ.KEYBOARD_CODE.NUMPAD_ENTER:
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
                };
                this.hndWheel = (_event) => {
                    let change = _event.deltaY < 0 ? +1 : -1;
                    this.changeDigitFocussed(change);
                };
                this.hndInput = (_event) => {
                    this.openInput(false);
                };
                this.hndFocus = (_event) => {
                    if (this.contains(document.activeElement))
                        return;
                    this.activateInnerTabs(false);
                };
                if (_params)
                    for (let key in _params)
                        this.setAttribute(key, _params[key]);
                if (_params && _params["value"])
                    this.value = parseFloat(_params["value"]);
            }
            connectedCallback() {
                this.style.fontFamily = "monospace";
                this.tabIndex = 0;
                let sign = document.createElement("span");
                sign.textContent = "+";
                this.appendChild(sign);
                for (let exp = 2; exp > -4; exp--) {
                    let digit = new CustomElementDigit();
                    digit.setAttribute("exp", exp.toString());
                    this.appendChild(digit);
                    if (exp == 0)
                        this.innerHTML += ".";
                }
                this.innerHTML += "e";
                let exp = document.createElement("span");
                exp.textContent = "+0";
                exp.tabIndex = -1;
                exp.setAttribute("name", "exp");
                this.appendChild(exp);
                let input = document.createElement("input");
                input.type = "number";
                input.style.position = "absolute";
                input.style.left = "0px";
                input.style.display = "none";
                this.appendChild(input);
                // input.addEventListener("change", this.hndInput);
                input.addEventListener("blur", this.hndInput);
                this.addEventListener("blur", this.hndFocus);
                this.addEventListener("keydown", this.hndKey);
                this.addEventListener("wheel", this.hndWheel);
            }
            activateInnerTabs(_on) {
                let index = _on ? 0 : -1;
                let spans = this.querySelectorAll("span");
                spans[1].tabIndex = index;
                let digits = this.querySelectorAll("fudge-digit");
                for (let digit of digits)
                    digit.tabIndex = index;
            }
            openInput(_open) {
                let input = this.querySelector("input");
                if (_open) {
                    input.style.display = "inline-block";
                    input.value = this.value.toString();
                    input.focus();
                }
                else {
                    input.style.display = "none";
                }
            }
            setValue(_value) {
                this.value = _value;
            }
            getValue() {
                return this.value;
            }
            getMantissaAndExponent() {
                let prec = this.value.toExponential(6);
                let exp = parseInt(prec.split("e")[1]);
                let exp3 = Math.trunc(exp / 3);
                let mantissa = this.value / Math.pow(10, exp3 * 3);
                mantissa = Math.round(mantissa * 1000) / 1000;
                return [mantissa, exp3 * 3];
            }
            toString() {
                let [mantissa, exp] = this.getMantissaAndExponent();
                let prefixMantissa = (mantissa < 0) ? "" : "+";
                let prefixExp = (exp < 0) ? "" : "+";
                return prefixMantissa + mantissa.toFixed(3) + "e" + prefixExp + exp;
            }
            display() {
                let [mantissa, exp] = this.toString().split("e");
                let spans = this.querySelectorAll("span");
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
                    }
                    else
                        digit.innerHTML = "&nbsp;";
                }
                console.log(this.value);
            }
            changeDigitFocussed(_amount) {
                let digit = document.activeElement;
                if (!this.contains(digit))
                    return;
                _amount = Math.round(_amount);
                if (_amount == 0)
                    return;
                if (digit == this.querySelector("[name=exp]")) {
                    this.value *= Math.pow(10, _amount);
                    this.display();
                    return;
                }
                let expDigit = parseInt(digit.getAttribute("exp"));
                let [mantissa, expValue] = this.getMantissaAndExponent();
                this.value += _amount * Math.pow(10, expDigit + expValue);
                let expNew;
                [mantissa, expNew] = this.getMantissaAndExponent();
                this.shiftFocus(expNew - expValue);
                this.display();
            }
            shiftFocus(_nDigits) {
                let shiftFocus = document.activeElement;
                if (_nDigits) {
                    for (let i = 0; i < 3; i++)
                        if (_nDigits > 0)
                            shiftFocus = shiftFocus.nextElementSibling;
                        else
                            shiftFocus = shiftFocus.previousElementSibling;
                    shiftFocus.focus();
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