"use strict";
// / <reference types="../../../Core/Build/FudgeCore"/>
var FudgeUserInterface;
// / <reference types="../../../Core/Build/FudgeCore"/>
(function (FudgeUserInterface) {
    var ƒ = FudgeCore;
    /**
     * Connects a [[Mutable]] to a DOM-Element and synchronizes that mutable with the mutator stored within.
     * Updates the mutable on interaction with the element and the element in time intervals.
     */
    class Controller {
        constructor(_mutable, _domElement) {
            this.timeUpdate = 190;
            /** [[FudgeCore.Mutator]] used to store the data types of the mutator attributes*/
            this.mutatorTypes = null;
            this.mutateOnInput = (_event) => {
                this.mutator = this.getMutator();
                this.mutable.mutate(this.mutator);
                _event.stopPropagation();
            };
            this.refresh = (_event) => {
                this.updateUserInterface();
            };
            this.domElement = _domElement;
            this.mutable = _mutable;
            this.mutator = _mutable.getMutator();
            if (_mutable instanceof ƒ.Mutable)
                this.mutatorTypes = _mutable.getMutatorAttributeTypes(this.mutator);
            // TODO: examine, if this should register to one common interval, instead of each installing its own.
            window.setInterval(this.refresh, this.timeUpdate);
            this.domElement.addEventListener("input", this.mutateOnInput);
        }
        /**
         * Recursive method taking the [[ƒ.Mutator]] of a [[ƒ.Mutable]] or another existing [[ƒ.Mutator]]
         * as a template and updating its values with those found in the given UI-domElement.
         */
        getMutator(_mutable = this.mutable, _domElement = this.domElement, _mutator, _types) {
            // TODO: examine if this.mutator should also be addressed in some way...
            let mutator = _mutator || _mutable.getMutator();
            // TODO: Mutator type now only used for enums. Examine if there is another way
            let mutatorTypes = _types || _mutable.getMutatorAttributeTypes(mutator);
            for (let key in mutator) {
                let element = _domElement.querySelector(`[key=${key}]`);
                if (element == null)
                    return mutator;
                if (element instanceof FudgeUserInterface.CustomElement)
                    mutator[key] = element.getMutatorValue();
                else if (mutatorTypes[key] instanceof Object)
                    element.value = mutator[key];
                else {
                    let subMutator = Reflect.get(mutator, key);
                    let subMutable;
                    subMutable = Reflect.get(_mutable, key);
                    // let subTypes: ƒ.Mutator = subMutable.getMutatorAttributeTypes(subMutator);
                    if (subMutable instanceof ƒ.Mutable)
                        mutator[key] = this.getMutator(subMutable, element, subMutator); //, subTypes);
                }
            }
            return mutator;
        }
        /**
         * Recursive method taking the [[ƒ.Mutator]] of a [[ƒ.Mutable]] and updating the UI-domElement accordingly
         */
        updateUserInterface(_mutable = this.mutable, _domElement = this.domElement) {
            // TODO: should get Mutator for UI or work with this.mutator (examine)
            this.mutable.updateMutator(this.mutator);
            let mutator = _mutable.getMutator();
            let mutatorTypes = {};
            if (_mutable instanceof ƒ.Mutable)
                mutatorTypes = _mutable.getMutatorAttributeTypes(mutator);
            for (let key in mutator) {
                let element = _domElement.querySelector(`[key=${key}]`);
                if (!element)
                    continue;
                let value = mutator[key];
                if (element instanceof FudgeUserInterface.CustomElement && element != document.activeElement)
                    element.setMutatorValue(value);
                else if (mutatorTypes[key] instanceof Object)
                    element.setMutatorValue(value);
                else {
                    // let fieldset: HTMLFieldSetElement = <HTMLFieldSetElement><HTMLElement>element;
                    let subMutable = Reflect.get(_mutable, key);
                    if (subMutable instanceof ƒ.Mutable)
                        this.updateUserInterface(subMutable, element);
                    else
                        //element.setMutatorValue(value);
                        Reflect.set(element, "value", value);
                }
            }
        }
    }
    FudgeUserInterface.Controller = Controller;
})(FudgeUserInterface || (FudgeUserInterface = {}));
/// <reference path="../../../Core/Build/FudgeCore.d.ts"/>
var FudgeUserInterface;
/// <reference path="../../../Core/Build/FudgeCore.d.ts"/>
(function (FudgeUserInterface) {
    var ƒ = FudgeCore;
    /**
     * Static class generating UI-domElements from the information found in [[ƒ.Mutable]]s and [[ƒ.Mutator]]s
     */
    class Generator {
        /**
         * Creates a [[Controller]] from a [[FudgeCore.Mutable]] using a CustomFieldSet
         */
        static createController(_mutable, _name) {
            let controller = new FudgeUserInterface.Controller(_mutable, Generator.createFieldSetFromMutable(_mutable, _name));
            controller.updateUserInterface();
            return controller;
        }
        /**
         * Create a custom fieldset for the [[FudgeCore.Mutator]] or the [[FudgeCore.Mutable]]
         */
        static createFieldSetFromMutable(_mutable, _name, _mutator) {
            let name = _name || _mutable.constructor.name;
            let mutator = _mutator || _mutable.getMutator();
            let mutatorTypes = _mutable.getMutatorAttributeTypes(mutator);
            let fieldset = Generator.createFoldableFieldset(name);
            for (let key in mutatorTypes) {
                let type = mutatorTypes[key];
                let value = mutator[key];
                let element = Generator.createMutatorElement(key, type, value);
                if (!element) {
                    let subMutable;
                    subMutable = Reflect.get(_mutable, key);
                    if (subMutable instanceof ƒ.Mutable)
                        element = Generator.createFieldSetFromMutable(subMutable, key, mutator[key]);
                    else //HACK! Display an enumerated select here
                        element = new FudgeUserInterface.CustomElementTextInput({ key: key, label: key, value: type.toString() });
                    // let fieldset: FoldableFieldSet = Generator.createFieldsetFromMutable(subMutable, key, <ƒ.Mutator>_mutator[key]);
                    // _parent.appendChild(fieldset);
                }
                fieldset.content.appendChild(element);
                fieldset.content.appendChild(document.createElement("br"));
            }
            return fieldset;
        }
        /**
         * Create a specific CustomElement for the given data, using _key as identification
         */
        static createMutatorElement(_key, _type, _value) {
            let element;
            try {
                if (_type instanceof Object) {
                    //TODO: refactor for enums and get rid of the two old generator functions
                    // element = document.createElement("span");
                    // Generator.createLabelElement(_key, element);
                    // Generator.createDropdown(_key, _type, _value.toString(), element);
                    let elementType = FudgeUserInterface.CustomElement.get("Object");
                    // @ts-ignore: instantiate abstract class
                    element = new elementType({ key: _key, label: _key, value: _value.toString() }, _type);
                }
                else {
                    // TODO: remove switch and use registered custom elements instead
                    // let elementType: typeof CustomElement = CustomElement.get(<ObjectConstructor>_value.constructor);
                    let elementType = FudgeUserInterface.CustomElement.get(_type);
                    // console.log("CustomElement", _type, elementType);
                    if (!elementType)
                        return element;
                    // @ts-ignore: instantiate abstract class
                    element = new elementType({ key: _key, label: _key, value: _value.toString() });
                }
            }
            catch (_error) {
                ƒ.Debug.fudge(_error);
            }
            return element;
        }
        /**
         * TODO: refactor for enums
         */
        static createDropdown(_name, _content, _value, _parent, _cssClass) {
            let dropdown = document.createElement("select");
            // TODO: unique ids
            // dropdown.id = _name;
            dropdown.name = _name;
            for (let value in _content) {
                let entry = document.createElement("option");
                entry.text = value;
                entry.value = value;
                if (value.toUpperCase() == _value.toUpperCase()) {
                    entry.selected = true;
                }
                dropdown.add(entry);
            }
            _parent.appendChild(dropdown);
            return dropdown;
        }
        // TODO: implement CustomFieldSet and replace this
        static createFoldableFieldset(_key) {
            let cntFoldFieldset = new FudgeUserInterface.FoldableFieldSet(_key);
            //TODO: unique ids
            // cntFoldFieldset.id = _legend;
            cntFoldFieldset.setAttribute("key", _key);
            return cntFoldFieldset;
        }
        //TODO: delete
        static createLabelElement(_name, _parent, params = {}) {
            let label = document.createElement("label");
            if (params.value == undefined)
                params.value = _name;
            label.innerText = params.value;
            if (params.cssClass != undefined)
                label.classList.add(params.cssClass);
            label.setAttribute("name", _name);
            _parent.appendChild(label);
            return label;
        }
    }
    FudgeUserInterface.Generator = Generator;
})(FudgeUserInterface || (FudgeUserInterface = {}));
var FudgeUserInterface;
(function (FudgeUserInterface) {
    var ƒ = FudgeCore;
    /**
     * Handles the mapping of CustomElements to their HTML-Tags via customElement.define
     * and to the data types and [[FudgeCore.Mutable]]s they render an interface for.
     */
    let CustomElement = /** @class */ (() => {
        class CustomElement extends HTMLElement {
            constructor(_attributes) {
                super();
                this.initialized = false;
                if (_attributes)
                    for (let name in _attributes)
                        this.setAttribute(name, _attributes[name]);
            }
            /**
             * Return the key (name) of the attribute this element represents
             */
            get key() {
                return this.getAttribute("key");
            }
            /**
             * Retrieve an id to use for children of this element, needed e.g. for standard interaction with the label
             */
            static get nextId() {
                return "ƒ" + CustomElement.idCounter++;
            }
            /**
             * Register map the given element type to the given tag and the given type of data
             */
            static register(_tag, _typeCustomElement, _typeObject) {
                // console.log(_tag, _class);
                _typeCustomElement.tag = _tag;
                // @ts-ignore
                customElements.define(_tag, _typeCustomElement);
                if (_typeObject)
                    CustomElement.map(_typeObject.name, _typeCustomElement);
            }
            /**
             * Retrieve the element representing the given data type (if registered)
             */
            static get(_type) {
                let element = CustomElement.mapObjectToCustomElement.get(_type);
                if (typeof (element) == "string")
                    element = customElements.get(element);
                return element;
            }
            static map(_type, _typeCustomElement) {
                ƒ.Debug.fudge("Map", _type.constructor.name, _typeCustomElement.constructor.name);
                CustomElement.mapObjectToCustomElement.set(_type, _typeCustomElement);
            }
            /**
             * Add a label-element as child to this element
             */
            appendLabel() {
                let label = document.createElement("label");
                label.textContent = this.getAttribute("label");
                this.appendChild(label);
                return label;
            }
            /**
             * Set the value of this element using a format compatible with [[FudgeCore.Mutator]]
             */
            setMutatorValue(_value) {
                Reflect.set(this, "value", _value);
            }
        }
        CustomElement.mapObjectToCustomElement = new Map();
        CustomElement.idCounter = 0;
        return CustomElement;
    })();
    FudgeUserInterface.CustomElement = CustomElement;
})(FudgeUserInterface || (FudgeUserInterface = {}));
var FudgeUserInterface;
(function (FudgeUserInterface) {
    /**
     * A standard checkbox with a label to it
     */
    let CustomElementBoolean = /** @class */ (() => {
        class CustomElementBoolean extends FudgeUserInterface.CustomElement {
            constructor(_attributes) {
                super(_attributes);
                if (!_attributes.label)
                    this.setAttribute("label", _attributes.key);
            }
            /**
             * Creates the content of the element when connected the first time
             */
            connectedCallback() {
                if (this.initialized)
                    return;
                this.initialized = true;
                // TODO: delete tabindex from checkbox and get space-key on this
                // this.tabIndex = 0;
                let input = document.createElement("input");
                input.type = "checkbox";
                input.id = FudgeUserInterface.CustomElement.nextId;
                input.checked = this.getAttribute("value") == "true";
                this.appendChild(input);
                this.appendLabel().htmlFor = input.id;
            }
            /**
             * Retrieves the status of the checkbox as boolean value
             */
            getMutatorValue() {
                return this.querySelector("input").checked;
            }
            /**
             * Sets the status of the checkbox
             */
            setMutatorValue(_value) {
                this.querySelector("input").checked = _value;
            }
        }
        // @ts-ignore
        CustomElementBoolean.customElement = FudgeUserInterface.CustomElement.register("fudge-boolean", CustomElementBoolean, Boolean);
        return CustomElementBoolean;
    })();
    FudgeUserInterface.CustomElementBoolean = CustomElementBoolean;
})(FudgeUserInterface || (FudgeUserInterface = {}));
var FudgeUserInterface;
(function (FudgeUserInterface) {
    var ƒ = FudgeCore;
    /**
     * A color picker with a label to it and a slider for opacity
     */
    let CustomElementColor = /** @class */ (() => {
        class CustomElementColor extends FudgeUserInterface.CustomElement {
            constructor(_attributes) {
                super(_attributes);
                this.color = new ƒ.Color();
                if (!_attributes.label)
                    this.setAttribute("label", _attributes.key);
            }
            /**
             * Creates the content of the element when connected the first time
             */
            connectedCallback() {
                if (this.initialized)
                    return;
                this.initialized = true;
                this.appendLabel();
                let picker = document.createElement("input");
                picker.type = "color";
                picker.tabIndex = 0;
                this.appendChild(picker);
                let slider = document.createElement("input");
                slider.type = "range";
                slider.min = "0";
                slider.max = "1";
                slider.step = "0.01";
                this.appendChild(slider);
            }
            /**
             * Retrieves the values of picker and slider as ƒ.Mutator
             */
            getMutatorValue() {
                let hex = this.querySelector("input[type=color").value;
                let alpha = this.querySelector("input[type=range").value;
                this.color.setHex(hex.substr(1, 6) + "ff");
                this.color.a = parseFloat(alpha);
                return this.color.getMutator();
            }
            /**
             * Sets the values of color picker and slider
             */
            setMutatorValue(_value) {
                this.color.mutate(_value);
                let hex = this.color.getHex();
                this.querySelector("input[type=color").value = "#" + hex.substr(0, 6);
                this.querySelector("input[type=range").value = this.color.a.toString();
            }
        }
        // @ts-ignore
        CustomElementColor.customElement = FudgeUserInterface.CustomElement.register("fudge-color", CustomElementColor, ƒ.Color);
        return CustomElementColor;
    })();
    FudgeUserInterface.CustomElementColor = CustomElementColor;
})(FudgeUserInterface || (FudgeUserInterface = {}));
var FudgeUserInterface;
(function (FudgeUserInterface) {
    /**
     * Represents a single digit number to be used in groups to represent a multidigit value.
     * Is tabbable and in-/decreases previous sibling when flowing over/under.
     */
    let CustomElementDigit = /** @class */ (() => {
        class CustomElementDigit extends HTMLElement {
            constructor() {
                super();
                this.initialized = false;
            }
            connectedCallback() {
                if (this.initialized)
                    return;
                this.initialized = true;
                this.value = 0;
                this.tabIndex = -1;
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
        // @ts-ignore
        CustomElementDigit.customElement = FudgeUserInterface.CustomElement.register("fudge-digit", CustomElementDigit);
        return CustomElementDigit;
    })();
    FudgeUserInterface.CustomElementDigit = CustomElementDigit;
})(FudgeUserInterface || (FudgeUserInterface = {}));
///<reference path="CustomElement.ts"/>
var FudgeUserInterface;
///<reference path="CustomElement.ts"/>
(function (FudgeUserInterface) {
    var ƒ = FudgeCore;
    /**
     * Creates a CustomElement from an HTML-Template-Tag
     */
    let CustomElementTemplate = /** @class */ (() => {
        class CustomElementTemplate extends FudgeUserInterface.CustomElement {
            constructor(_attributes) {
                super(_attributes);
            }
            /**
             * Browses through the templates in the current document and registers the one defining the given tagname.
             * To be called from a script tag implemented with the template in HTML.
             */
            static register(_tagName) {
                for (let template of document.querySelectorAll("template")) {
                    if (template.content.firstElementChild.localName == _tagName) {
                        ƒ.Debug.fudge("Register", template);
                        CustomElementTemplate.fragment.set(_tagName, template.content);
                    }
                }
            }
            /**
             * When connected the first time, the element gets constructed as a deep clone of the template.
             */
            connectedCallback() {
                if (this.initialized)
                    return;
                this.initialized = true;
                let fragment = CustomElementTemplate.fragment.get(Reflect.get(this.constructor, "tag"));
                let content = fragment.firstElementChild;
                let style = this.style;
                for (let entry of content.style) {
                    style.setProperty(entry, Reflect.get(content.style, entry));
                }
                for (let child of content.childNodes) {
                    this.appendChild(child.cloneNode(true));
                }
            }
        }
        CustomElementTemplate.fragment = new Map();
        return CustomElementTemplate;
    })();
    FudgeUserInterface.CustomElementTemplate = CustomElementTemplate;
})(FudgeUserInterface || (FudgeUserInterface = {}));
///<reference path="CustomElementTemplate.ts"/>
var FudgeUserInterface;
///<reference path="CustomElementTemplate.ts"/>
(function (FudgeUserInterface) {
    class CustomElementMatrix4x4 extends FudgeUserInterface.CustomElementTemplate {
        getMutatorValue() {
            let steppers = this.querySelectorAll("fudge-stepper");
            let mutator = { translation: {}, rotation: {}, scaling: {} };
            let count = 0;
            for (let vector of ["translation", "rotation", "scaling"])
                for (let dimension of ["x", "y", "z"])
                    mutator[vector][dimension] = steppers[count++].getMutatorValue();
            return mutator;
        }
        setMutatorValue(_mutator) {
            let steppers = this.querySelectorAll("fudge-stepper");
            let count = 0;
            for (let vector of ["translation", "rotation", "scaling"])
                for (let dimension of ["x", "y", "z"])
                    steppers[count++].setMutatorValue(Number(_mutator[vector][dimension]));
        }
        connectedCallback() {
            super.connectedCallback();
            // console.log("Matrix Callback");
            let label = this.querySelector("label");
            label.textContent = this.getAttribute("label");
        }
    }
    FudgeUserInterface.CustomElementMatrix4x4 = CustomElementMatrix4x4;
})(FudgeUserInterface || (FudgeUserInterface = {}));
var FudgeUserInterface;
(function (FudgeUserInterface) {
    /**
     * A dropdown menu to display enums
     */
    let CustomElementSelect = /** @class */ (() => {
        class CustomElementSelect extends FudgeUserInterface.CustomElement {
            constructor(_attributes, _content = {}) {
                super(_attributes);
                if (!_attributes.label)
                    this.setAttribute("label", _attributes.key);
                this.content = _content;
            }
            /**
             * Creates the content of the element when connected the first time
             */
            connectedCallback() {
                if (this.initialized)
                    return;
                this.initialized = true;
                this.appendLabel();
                let select = document.createElement("select");
                for (let key in this.content) {
                    if (!isNaN(parseInt(key))) //key being a number will not be shown, assuming it's a simple enum with double entries
                        continue;
                    let entry = document.createElement("option");
                    entry.text = key;
                    entry.value = this.content[key];
                    if (key == this.getAttribute("value")) {
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
            getMutatorValue() {
                return this.querySelector("select").value;
            }
            /**
             * Sets the status of the checkbox
             */
            setMutatorValue(_value) {
                this.querySelector("select").value = _value;
            }
        }
        // @ts-ignore
        CustomElementSelect.customElement = FudgeUserInterface.CustomElement.register("fudge-select", CustomElementSelect, Object);
        return CustomElementSelect;
    })();
    FudgeUserInterface.CustomElementSelect = CustomElementSelect;
})(FudgeUserInterface || (FudgeUserInterface = {}));
var FudgeUserInterface;
(function (FudgeUserInterface) {
    var ƒ = FudgeCore;
    /**
     * An interactive number stepper with exponential display and complex handling using keyboard and mouse
     */
    let CustomElementStepper = /** @class */ (() => {
        class CustomElementStepper extends FudgeUserInterface.CustomElement {
            constructor(_attributes) {
                super(_attributes);
                this.value = 0;
                /**
                 * Handle keyboard input on this element and its digits
                 */
                this.hndKey = (_event) => {
                    let active = document.activeElement;
                    let numEntered = _event.key.charCodeAt(0) - 48;
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
                        if (_event.key == ƒ.KEYBOARD_CODE.ENTER || _event.key == ƒ.KEYBOARD_CODE.NUMPAD_ENTER || _event.key == ƒ.KEYBOARD_CODE.TABULATOR) {
                            this.value = Number(active.value);
                            this.display();
                            this.openInput(false);
                            this.focus();
                            this.dispatchEvent(new Event("input", { bubbles: true }));
                        }
                        return;
                    }
                    if (numEntered >= 0 && numEntered <= 9) {
                        let difference = numEntered - Number(active.textContent) * (this.value < 0 ? -1 : 1);
                        this.changeDigitFocussed(difference);
                        let next = active.nextElementSibling;
                        if (next)
                            next.focus();
                        this.dispatchEvent(new Event("input", { bubbles: true }));
                        return;
                    }
                    if (_event.key == "-" || _event.key == "+") {
                        this.value = (_event.key == "-" ? -1 : 1) * Math.abs(this.value);
                        this.display();
                        this.dispatchEvent(new Event("input", { bubbles: true }));
                        return;
                    }
                    switch (_event.code) {
                        case ƒ.KEYBOARD_CODE.ARROW_DOWN:
                            this.changeDigitFocussed(-1);
                            this.dispatchEvent(new Event("input", { bubbles: true }));
                            break;
                        case ƒ.KEYBOARD_CODE.ARROW_UP:
                            this.changeDigitFocussed(+1);
                            this.dispatchEvent(new Event("input", { bubbles: true }));
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
                    this.dispatchEvent(new Event("input", { bubbles: true }));
                };
                this.hndInput = (_event) => {
                    this.openInput(false);
                };
                this.hndFocus = (_event) => {
                    if (this.contains(document.activeElement))
                        return;
                    this.activateInnerTabs(false);
                };
                if (_attributes && _attributes["value"])
                    this.value = parseFloat(_attributes["value"]);
            }
            /**
             * Creates the content of the element when connected the first time
             */
            connectedCallback() {
                if (this.initialized)
                    return;
                this.initialized = true;
                this.tabIndex = 0;
                this.appendLabel();
                let input = document.createElement("input");
                input.type = "number";
                input.style.position = "absolute";
                input.style.display = "none";
                input.addEventListener("input", (_event) => { event.stopPropagation(); });
                this.appendChild(input);
                let sign = document.createElement("span");
                sign.textContent = "+";
                this.appendChild(sign);
                for (let exp = 2; exp > -4; exp--) {
                    let digit = new FudgeUserInterface.CustomElementDigit();
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
                // input.addEventListener("change", this.hndInput);
                input.addEventListener("blur", this.hndInput);
                this.addEventListener("blur", this.hndFocus);
                this.addEventListener("keydown", this.hndKey);
                this.addEventListener("wheel", this.hndWheel);
            }
            /**
             * De-/Activates tabbing for the inner digits
             */
            activateInnerTabs(_on) {
                let index = _on ? 0 : -1;
                let spans = this.querySelectorAll("span");
                spans[1].tabIndex = index;
                let digits = this.querySelectorAll("fudge-digit");
                for (let digit of digits)
                    digit.tabIndex = index;
            }
            /**
             * Opens/Closes a standard number input for typing the value at once
             */
            openInput(_open) {
                let input = this.querySelector("input");
                if (_open) {
                    input.style.display = "inline";
                    input.value = this.value.toString();
                    input.focus();
                }
                else {
                    input.style.display = "none";
                }
            }
            /**
             * Retrieve the value of this
             */
            getMutatorValue() {
                return this.value;
            }
            /**
             * Sets its value and displays it
             */
            setMutatorValue(_value) {
                this.value = _value;
                this.display();
            }
            /**
             * Retrieve mantissa and exponent separately as an array of two members
             */
            getMantissaAndExponent() {
                let prec = this.value.toExponential(6);
                let exp = parseInt(prec.split("e")[1]);
                let exp3 = Math.trunc(exp / 3);
                let mantissa = this.value / Math.pow(10, exp3 * 3);
                mantissa = Math.round(mantissa * 1000) / 1000;
                return [mantissa, exp3 * 3];
            }
            /**
             * Retrieves this value as a string
             */
            toString() {
                let [mantissa, exp] = this.getMantissaAndExponent();
                let prefixMantissa = (mantissa < 0) ? "" : "+";
                let prefixExp = (exp < 0) ? "" : "+";
                return prefixMantissa + mantissa.toFixed(3) + "e" + prefixExp + exp;
            }
            /**
             * Displays this value by setting the contents of the digits and the exponent
             */
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
                // @ts-ignore (mantissa not used)
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
        CustomElementStepper.customElement = FudgeUserInterface.CustomElement.register("fudge-stepper", CustomElementStepper, Number);
        return CustomElementStepper;
    })();
    FudgeUserInterface.CustomElementStepper = CustomElementStepper;
})(FudgeUserInterface || (FudgeUserInterface = {}));
var FudgeUserInterface;
(function (FudgeUserInterface) {
    /**
     * A standard text input field with a label to it.
     */
    let CustomElementTextInput = /** @class */ (() => {
        class CustomElementTextInput extends FudgeUserInterface.CustomElement {
            constructor(_attributes) {
                super(_attributes);
            }
            /**
             * Creates the content of the element when connected the first time
             */
            connectedCallback() {
                if (this.initialized)
                    return;
                this.initialized = true;
                this.appendLabel();
                let input = document.createElement("input");
                input.id = FudgeUserInterface.CustomElement.nextId;
                input.value = this.getAttribute("value");
                this.appendChild(input);
            }
            /**
             * Retrieves the content of the input element
             */
            getMutatorValue() {
                return this.querySelector("input").value;
            }
            /**
             * Sets the content of the input element
             */
            setMutatorValue(_value) {
                this.querySelector("input").value = _value;
            }
        }
        // @ts-ignore
        CustomElementTextInput.customElement = FudgeUserInterface.CustomElement.register("fudge-textinput", CustomElementTextInput, String);
        return CustomElementTextInput;
    })();
    FudgeUserInterface.CustomElementTextInput = CustomElementTextInput;
})(FudgeUserInterface || (FudgeUserInterface = {}));
// namespace FudgeUserInterface {
//     /**
//      * <select><option>Hallo</option></select>
//      */
//     import ƒ = FudgeCore;
//     export class ToggleButton extends HTMLButtonElement {
//         private toggleState: boolean;
//         public constructor(style: string) {
//             super();
//             this.type = "button";
//             this.toggleState = true;
//             this.classList.add(style);
//             this.classList.add("ToggleOn");
//             this.addEventListener("click", this.switchToggleState);
//         }
//         public setToggleState(toggleState: boolean): void {
//             this.toggleState = toggleState;
//             if (this.toggleState == true) {
//                 this.classList.add("ToggleOn");
//                 this.classList.remove("ToggleOff");
//             }
//             else {
//                 this.classList.remove("ToggleOn");
//                 this.classList.add("ToggleOff");
//             }
//         }
//         public getToggleState(): boolean {
//             return this.toggleState;
//         }
//         public toggle(): void {
//             this.setToggleState(!this.toggleState);
//         }
//         private switchToggleState = (_event: MouseEvent): void => {
//             this.setToggleState(!this.toggleState);
//         }
//     }
//     export class Stepper extends HTMLInputElement {
//         public constructor(_label: string, params: { min?: number, max?: number, step?: number, value?: number } = {}) {
//             super();
//             this.name = _label;
//             this.type = "number";
//             this.value = params.value.toString();
//             this.id = _label;
//             this.step = String(params.step) || "1";
//         }
//     }
//     export class FoldableFieldSet extends HTMLFieldSetElement {
//         public constructor(_legend: string) {
//             super();
//             let cntLegend: HTMLLegendElement = document.createElement("legend");
//             cntLegend.classList.add("unfoldable");
//             let btnFoldButton: HTMLButtonElement = new ToggleButton("FoldButton");
//             btnFoldButton.addEventListener("click", this.toggleFoldElement);
//             // btnfoldButton.classList.add("unfoldable");
//             let lblTitle: HTMLSpanElement = document.createElement("span");
//             lblTitle.textContent = _legend;
//             // lblTitle.classList.add("unfoldable");
//             cntLegend.appendChild(btnFoldButton);
//             cntLegend.appendChild(lblTitle);
//             this.appendChild(cntLegend);
//         }
//         private toggleFoldElement = (_event: MouseEvent): void => {
//             _event.preventDefault();
//             if (_event.target != _event.currentTarget) return;
//             //Get the fieldset the button belongs to
//             let children: HTMLCollection = this.children;
//             //fold or unfold all children that aren't unfoldable
//             for (let child of children) {
//                 if (!child.classList.contains("unfoldable")) {
//                     child.classList.toggle("folded");
//                 }
//             }
//         }
//     }
//     class MenuButton extends HTMLDivElement {
//         name: string;
//         private signature: string;
//         public constructor(_name: string, textcontent: string, parentSignature: string) {
//             super();
//             this.name = _name;
//             this.signature = parentSignature + "." + _name;
//             let button: HTMLButtonElement = document.createElement("button");
//             button.textContent = textcontent;
//             this.append(button);
//             button.addEventListener("click", this.resolveClick);
//         }
//         private resolveClick = (_event: MouseEvent): void => {
//             let event: CustomEvent = new CustomEvent(EVENT_USERINTERFACE.DROPMENUCLICK, { detail: this.signature, bubbles: true });
//             this.dispatchEvent(event);
//         }
//     }
//     class MenuContent extends HTMLDivElement {
//         public constructor(_submenu?: boolean) {
//             super();
//             if (_submenu) {
//                 this.classList.add("submenu-content");
//             }
//             else {
//                 this.classList.add("dropdown-content");
//             }
//         }
//     }
//     export class DropMenu extends HTMLDivElement {
//         name: string;
//         private content: MenuContent;
//         private signature: string;
//         public constructor(_name: string, _contentList: ƒ.Mutator, params: { _parentSignature?: string, _text?: string }) {
//             super();
//             let button: HTMLButtonElement = document.createElement("button");
//             button.name = _name;
//             if (params._text) {
//                 button.textContent = params._text;
//             }
//             else {
//                 button.textContent = _name;
//             }
//             button.addEventListener("click", this.toggleFoldContent);
//             window.addEventListener("click", this.collapseMenu);
//             let isSubmenu: boolean = (params._parentSignature != null);
//             if (params._parentSignature) {
//                 this.signature = params._parentSignature + "." + _name;
//             }
//             else {
//                 this.signature = _name;
//             }
//             this.append(button);
//             this.content = new MenuContent(isSubmenu);
//             if (params._parentSignature) {
//                 this.classList.add("submenu");
//             }
//             else {
//                 this.classList.add("dropdown");
//             }
//             this.content.classList.toggle("folded");
//             this.name = _name;
//             for (let key in _contentList) {
//                 if (typeof _contentList[key] == "object") {
//                     let subMenu: DropMenu = new DropMenu(key, <ƒ.Mutator>_contentList[key], { _parentSignature: this.signature });
//                     this.content.append(subMenu);
//                 }
//                 else if (typeof _contentList[key] == "string") {
//                     let contentEntry: MenuButton = new MenuButton(key, <string>_contentList[key], this.signature);
//                     this.content.append(contentEntry);
//                 }
//             }
//             this.append(this.content);
//         }
//         private toggleFoldContent = (_event: MouseEvent): void => {
//             this.content.classList.toggle("folded");
//         }
//         private collapseMenu = (_event: MouseEvent): void => {
//             if (!(this.contains(<HTMLElement>_event.target))) {
//                 if (!this.content.classList.contains("folded")) {
//                     this.toggleFoldContent(_event);
//                 }
//             }
//         }
//     }
//     customElements.define("ui-stepper", Stepper, { extends: "input" });
//     customElements.define("ui-toggle-button", ToggleButton, { extends: "button" });
//     customElements.define("ui-fold-fieldset", FoldableFieldSet, { extends: "fieldset" });
//     customElements.define("ui-dropdown", DropMenu, { extends: "div" });
//     customElements.define("ui-dropdown-button", MenuButton, { extends: "div" });
//     customElements.define("ui-dropdown-content", MenuContent, { extends: "div" });
// }
var FudgeUserInterface;
(function (FudgeUserInterface) {
    var ƒ = FudgeCore;
    class FoldableFieldSet extends HTMLFieldSetElement {
        constructor(_legend = "") {
            super();
            this.hndFocus = (_event) => {
                switch (_event.type) {
                    case FudgeUserInterface.EVENT_TREE.FOCUS_NEXT:
                        let next = this.nextElementSibling;
                        if (next && next.tabIndex > -1) {
                            next.focus();
                            _event.stopPropagation();
                        }
                        break;
                    case FudgeUserInterface.EVENT_TREE.FOCUS_PREVIOUS:
                        let previous = this.previousElementSibling;
                        if (previous && previous.tabIndex > -1) {
                            let fieldsets = previous.querySelectorAll("fieldset");
                            let i = fieldsets.length;
                            if (i)
                                do { // focus the last visible fieldset
                                    fieldsets[--i].focus();
                                } while (!fieldsets[i].offsetParent);
                            else
                                previous.focus();
                            _event.stopPropagation();
                        }
                        break;
                    case FudgeUserInterface.EVENT_TREE.FOCUS_SET:
                        if (_event.target != this) {
                            this.focus();
                            _event.stopPropagation();
                        }
                        break;
                }
            };
            this.hndKey = (_event) => {
                _event.stopPropagation();
                // let target: HTMLElement = <HTMLElement>_event.target;
                switch (_event.code) {
                    case ƒ.KEYBOARD_CODE.ARROW_RIGHT:
                        if (!this.isOpen) {
                            this.open(true);
                            return;
                        }
                    case ƒ.KEYBOARD_CODE.ARROW_DOWN:
                        let next = this;
                        if (this.isOpen)
                            next = this.querySelector("fieldset");
                        else
                            do {
                                next = next.nextElementSibling;
                            } while (next && next.tabIndex > -1);
                        if (next)
                            next.focus();
                        // next.dispatchEvent(new KeyboardEvent(EVENT_TREE.FOCUS_NEXT, { bubbles: true, shiftKey: _event.shiftKey, ctrlKey: _event.ctrlKey }));
                        else
                            this.dispatchEvent(new KeyboardEvent(FudgeUserInterface.EVENT_TREE.FOCUS_NEXT, { bubbles: true, shiftKey: _event.shiftKey, ctrlKey: _event.ctrlKey }));
                        break;
                    case ƒ.KEYBOARD_CODE.ARROW_LEFT:
                        if (this.isOpen) {
                            this.open(false);
                            return;
                        }
                    case ƒ.KEYBOARD_CODE.ARROW_UP:
                        let previous = this;
                        do {
                            previous = previous.previousElementSibling;
                        } while (previous && !(previous instanceof FoldableFieldSet));
                        if (previous)
                            if (previous.isOpen)
                                this.dispatchEvent(new KeyboardEvent(FudgeUserInterface.EVENT_TREE.FOCUS_PREVIOUS, { bubbles: true, shiftKey: _event.shiftKey, ctrlKey: _event.ctrlKey }));
                            else
                                previous.focus();
                        else
                            this.parentElement.dispatchEvent(new KeyboardEvent(FudgeUserInterface.EVENT_TREE.FOCUS_SET, { bubbles: true, shiftKey: _event.shiftKey, ctrlKey: _event.ctrlKey }));
                        break;
                }
            };
            let cntLegend = document.createElement("legend");
            this.checkbox = document.createElement("input");
            this.checkbox.type = "checkbox";
            this.checkbox.checked = true;
            this.checkbox.tabIndex = -1;
            let lblTitle = document.createElement("span");
            lblTitle.textContent = _legend;
            this.appendChild(this.checkbox);
            cntLegend.appendChild(lblTitle);
            this.content = document.createElement("div");
            this.appendChild(cntLegend);
            this.appendChild(this.content);
            this.tabIndex = 0;
            this.addEventListener(FudgeUserInterface.EVENT_TREE.KEY_DOWN, this.hndKey);
            this.addEventListener(FudgeUserInterface.EVENT_TREE.FOCUS_NEXT, this.hndFocus);
            this.addEventListener(FudgeUserInterface.EVENT_TREE.FOCUS_PREVIOUS, this.hndFocus);
            this.addEventListener(FudgeUserInterface.EVENT_TREE.FOCUS_SET, this.hndFocus);
            // this.checkbox.addEventListener(EVENT_TREE.KEY_DOWN, this.hndKey);
        }
        open(_open) {
            this.checkbox.checked = _open;
        }
        get isOpen() {
            return this.checkbox.checked;
        }
    }
    FudgeUserInterface.FoldableFieldSet = FoldableFieldSet;
    customElements.define("ui-fold-fieldset", FoldableFieldSet, { extends: "fieldset" });
})(FudgeUserInterface || (FudgeUserInterface = {}));
// namespace FudgeUserInterface {
//     import ƒ = FudgeCore;
//     // export abstract class ListController {
//     //     abstract listRoot: HTMLElement;
//     //     protected abstract toggleCollapse(_event: MouseEvent): void;
//     // }
//     abstract class CollapsableList extends HTMLUListElement {
//         header: HTMLLIElement;
//         content: HTMLElement;
//         constructor() {
//             super();
//             this.header = document.createElement("li");
//             this.content = document.createElement("ul");
//             this.appendChild(this.header);
//             this.appendChild(this.content);
//         }
//         public collapse(element: HTMLElement): void {
//             (<CollapsableList>element).content.classList.toggle("folded");
//         }
//     }
//     export class CollapsableNodeList extends CollapsableList {
//         node: ƒ.Node;
//         constructor(_node: ƒ.Node, _name: string, _unfolded: boolean = false) {
//             super();
//             this.node = _node;
//             let buttonState: string;
//             if (this.node.getChildren().length != 0)
//                 buttonState = "FoldButton";
//             else
//                 buttonState = "invisible";
//             let btnToggle: HTMLButtonElement = new ToggleButton(buttonState);
//             (<ToggleButton>btnToggle).setToggleState(_unfolded);
//             btnToggle.addEventListener("click", this.collapseEvent);
//             this.header.appendChild(btnToggle);
//             let lblName: HTMLSpanElement = document.createElement("span");
//             lblName.textContent = _name;
//             lblName.addEventListener("click", this.selectNode);
//             this.header.appendChild(lblName);
//         }
//         public selectNode = (_event: MouseEvent): void => {
//             let event: Event = new CustomEvent(EVENT_USERINTERFACE.SELECT, { bubbles: true, detail: this.node });
//             this.dispatchEvent(event);
//         }
//         public collapseEvent = (_event: MouseEvent): void => {
//             let event: Event = new CustomEvent(EVENT_USERINTERFACE.COLLAPSE, { bubbles: true, detail: this });
//             this.dispatchEvent(event);
//         }
//     }
//     export class CollapsableAnimationList extends CollapsableList {
//         mutator: ƒ.Mutator;
//         name: string;
//         index: ƒ.Mutator;
//         constructor(_mutator: ƒ.Mutator, _name: string, _unfolded: boolean = false) {
//             super();
//             this.mutator = _mutator;
//             this.name = _name;
//             this.index = {};
//             let btnToggle: HTMLButtonElement = new ToggleButton("FoldButton");
//             (<ToggleButton>btnToggle).setToggleState(_unfolded);
//             btnToggle.addEventListener("click", this.collapseEvent);
//             this.header.appendChild(btnToggle);
//             let lblName: HTMLSpanElement = document.createElement("span");
//             lblName.textContent = _name;
//             this.header.appendChild(lblName);
//             this.buildContent(_mutator);
//             this.content.addEventListener("input", this.updateMutator);
//         }
//         public collapseEvent = (_event: MouseEvent): void => {
//             let event: Event = new CustomEvent(EVENT_USERINTERFACE.COLLAPSE, { bubbles: true, detail: this });
//             this.dispatchEvent(event);
//         }
//         public buildContent(_mutator: ƒ.Mutator): void {
//             for (let key in _mutator) {
//                 if (typeof _mutator[key] == "object") {
//                     let newList: CollapsableAnimationList = new CollapsableAnimationList(<ƒ.Mutator>_mutator[key], key);
//                     this.content.append(newList);
//                     this.index[key] = newList.getElementIndex();
//                 }
//                 else {
//                     let listEntry: HTMLLIElement = document.createElement("li");
//                     Generator.createLabelElement(key, listEntry);
//                     let inputEntry: HTMLSpanElement = Generator.createStepperElement(key, listEntry, { _value: (<number>_mutator[key]) });
//                     this.content.append(listEntry);
//                     this.index[key] = inputEntry;
//                 }
//             }
//         }
//         public getMutator(): ƒ.Mutator {
//             return this.mutator;
//         }
//         public setMutator(_mutator: ƒ.Mutator): void {
//             this.collapse(this.content);
//             this.mutator = _mutator;
//             this.buildContent(_mutator);
//         }
//         public getElementIndex(): ƒ.Mutator {
//             return this.index;
//         }
//         private updateMutator = (_event: Event): void => {
//             let target: HTMLInputElement = <HTMLInputElement>_event.target;
//             this.mutator[target.id] = parseFloat(target.value);
//             _event.cancelBubble = true;
//             let event: Event = new CustomEvent(EVENT_USERINTERFACE.UPDATE, { bubbles: true, detail: this.mutator });
//             this.dispatchEvent(event);
//         }
//     }
//     customElements.define("ui-node-list", CollapsableNodeList, { extends: "ul" });
//     customElements.define("ui-animation-list", CollapsableAnimationList, { extends: "ul" });
// }
var FudgeUserInterface;
(function (FudgeUserInterface) {
    class MenuButton extends HTMLDivElement {
        constructor(_name, textcontent, parentSignature) {
            super();
            this.resolveClick = (_event) => {
                let event = new CustomEvent("dropMenuClick" /* DROPMENUCLICK */, { detail: this.signature, bubbles: true });
                this.dispatchEvent(event);
            };
            this.name = _name;
            this.signature = parentSignature + "." + _name;
            let button = document.createElement("button");
            button.textContent = textcontent;
            this.append(button);
            button.addEventListener("click", this.resolveClick);
        }
    }
    class MenuContent extends HTMLDivElement {
        constructor(_submenu) {
            super();
            if (_submenu) {
                this.classList.add("submenu-content");
            }
            else {
                this.classList.add("dropdown-content");
            }
        }
    }
    class DropMenu extends HTMLDivElement {
        constructor(_name, _contentList, params) {
            super();
            this.toggleFoldContent = (_event) => {
                this.content.classList.toggle("folded");
            };
            this.collapseMenu = (_event) => {
                if (!(this.contains(_event.target))) {
                    if (!this.content.classList.contains("folded")) {
                        this.toggleFoldContent(_event);
                    }
                }
            };
            let button = document.createElement("button");
            button.name = _name;
            if (params._text) {
                button.textContent = params._text;
            }
            else {
                button.textContent = _name;
            }
            button.addEventListener("click", this.toggleFoldContent);
            window.addEventListener("click", this.collapseMenu);
            let isSubmenu = (params._parentSignature != null);
            if (params._parentSignature) {
                this.signature = params._parentSignature + "." + _name;
            }
            else {
                this.signature = _name;
            }
            this.append(button);
            this.content = new MenuContent(isSubmenu);
            if (params._parentSignature) {
                this.classList.add("submenu");
            }
            else {
                this.classList.add("dropdown");
            }
            this.content.classList.toggle("folded");
            this.name = _name;
            for (let key in _contentList) {
                if (typeof _contentList[key] == "object") {
                    let subMenu = new DropMenu(key, _contentList[key], { _parentSignature: this.signature });
                    this.content.append(subMenu);
                }
                else if (typeof _contentList[key] == "string") {
                    let contentEntry = new MenuButton(key, _contentList[key], this.signature);
                    this.content.append(contentEntry);
                }
            }
            this.append(this.content);
        }
    }
    FudgeUserInterface.DropMenu = DropMenu;
    // customElements.define("ui-dropdown", DropMenu, { extends: "div" });
    // customElements.define("ui-dropdown-button", MenuButton, { extends: "div" });
    customElements.define("ui-dropdown-content", MenuContent, { extends: "div" });
})(FudgeUserInterface || (FudgeUserInterface = {}));
var FudgeUserInterface;
(function (FudgeUserInterface) {
    class MultiLevelMenuManager {
        static buildFromSignature(_signature, _mutator) {
            let mutator = _mutator || {};
            let signatureLevels = _signature.split(".");
            if (signatureLevels.length > 1) {
                let subSignature = signatureLevels[1];
                for (let i = 2; i < signatureLevels.length; i++) {
                    subSignature = subSignature + "." + signatureLevels[i];
                }
                if (mutator[signatureLevels[0]] != null) {
                    mutator[signatureLevels[0]] = this.buildFromSignature(subSignature, mutator[signatureLevels[0]]);
                }
                else {
                    mutator[signatureLevels[0]] = this.buildFromSignature(subSignature);
                }
            }
            else {
                mutator[signatureLevels[0]] = signatureLevels[0];
            }
            return mutator;
        }
    }
    FudgeUserInterface.MultiLevelMenuManager = MultiLevelMenuManager;
})(FudgeUserInterface || (FudgeUserInterface = {}));
///<reference path="../../../../Core/Build/FudgeCore.d.ts"/>
var FudgeUserInterface;
///<reference path="../../../../Core/Build/FudgeCore.d.ts"/>
(function (FudgeUserInterface) {
    /**
    * Extension of ul-element that keeps a list of [[TreeItem]]s to represent a branch in a tree
    */
    class TreeList extends HTMLUListElement {
        constructor(_items = []) {
            super();
            this.addItems(_items);
            this.className = "tree";
        }
        /**
         * Opens the tree along the given path to show the objects the path includes
         * @param _path An array of objects starting with one being contained in this treelist and following the correct hierarchy of successors
         * @param _focus If true (default) the last object found in the tree gets the focus
         */
        show(_path, _focus = true) {
            let currentTree = this;
            for (let data of _path) {
                let item = currentTree.findItem(data);
                item.focus();
                let content = item.getBranch();
                if (!content) {
                    item.open(true);
                    content = item.getBranch();
                }
                currentTree = content;
            }
        }
        /**
         * Restructures the list to sync with the given list.
         * [[TreeItem]]s referencing the same object remain in the list, new items get added in the order of appearance, obsolete ones are deleted.
         * @param _tree A list to sync this with
         */
        restructure(_tree) {
            let items = [];
            for (let item of _tree.getItems()) {
                let found = this.findItem(item.data);
                if (found) {
                    found.setLabel(item.display);
                    found.hasChildren = item.hasChildren;
                    if (!found.hasChildren)
                        found.open(false);
                    items.push(found);
                }
                else
                    items.push(item);
            }
            this.innerHTML = "";
            this.addItems(items);
        }
        /**
         * Returns the [[TreeItem]] of this list referencing the given object or null, if not found
         */
        findItem(_data) {
            for (let item of this.children)
                if (item.data == _data)
                    return item;
            return null;
        }
        /**
         * Adds the given [[TreeItem]]s at the end of this list
         */
        addItems(_items) {
            for (let item of _items) {
                this.appendChild(item);
            }
        }
        /**
         * Returns the content of this list as array of [[TreeItem]]s
         */
        getItems() {
            return this.children;
        }
        displaySelection(_data) {
            let items = this.querySelectorAll("li");
            for (let item of items)
                item.selected = (_data != null && _data.indexOf(item.data) > -1);
        }
        selectInterval(_dataStart, _dataEnd) {
            let items = this.querySelectorAll("li");
            let selecting = false;
            let end = null;
            for (let item of items) {
                if (!selecting) {
                    selecting = true;
                    if (item.data == _dataStart)
                        end = _dataEnd;
                    else if (item.data == _dataEnd)
                        end = _dataStart;
                    else
                        selecting = false;
                }
                if (selecting) {
                    item.select(true, false);
                    if (item.data == end)
                        break;
                }
            }
        }
        delete(_data) {
            let items = this.querySelectorAll("li");
            let deleted = [];
            for (let item of items)
                if (_data.indexOf(item.data) > -1) {
                    item.dispatchEvent(new Event(FudgeUserInterface.EVENT_TREE.UPDATE, { bubbles: true }));
                    deleted.push(item.parentNode.removeChild(item));
                }
            return deleted;
        }
        findOpen(_data) {
            let items = this.querySelectorAll("li");
            for (let item of items)
                if (_data == item.data)
                    return item;
            return null;
        }
    }
    FudgeUserInterface.TreeList = TreeList;
    customElements.define("ul-tree-list", TreeList, { extends: "ul" });
})(FudgeUserInterface || (FudgeUserInterface = {}));
///<reference path="TreeList.ts"/>
var FudgeUserInterface;
///<reference path="TreeList.ts"/>
(function (FudgeUserInterface) {
    let TREE_CLASS;
    (function (TREE_CLASS) {
        TREE_CLASS["SELECTED"] = "selected";
        TREE_CLASS["INACTIVE"] = "inactive";
    })(TREE_CLASS = FudgeUserInterface.TREE_CLASS || (FudgeUserInterface.TREE_CLASS = {}));
    let EVENT_TREE;
    (function (EVENT_TREE) {
        EVENT_TREE["RENAME"] = "rename";
        EVENT_TREE["OPEN"] = "open";
        EVENT_TREE["FOCUS_NEXT"] = "focusNext";
        EVENT_TREE["FOCUS_PREVIOUS"] = "focusPrevious";
        EVENT_TREE["FOCUS_IN"] = "focusin";
        EVENT_TREE["FOCUS_OUT"] = "focusout";
        EVENT_TREE["DELETE"] = "delete";
        EVENT_TREE["CHANGE"] = "change";
        EVENT_TREE["DOUBLE_CLICK"] = "dblclick";
        EVENT_TREE["KEY_DOWN"] = "keydown";
        EVENT_TREE["DRAG_START"] = "dragstart";
        EVENT_TREE["DRAG_OVER"] = "dragover";
        EVENT_TREE["DROP"] = "drop";
        EVENT_TREE["POINTER_UP"] = "pointerup";
        EVENT_TREE["SELECT"] = "itemselect";
        EVENT_TREE["UPDATE"] = "update";
        EVENT_TREE["ESCAPE"] = "escape";
        EVENT_TREE["COPY"] = "copy";
        EVENT_TREE["CUT"] = "cut";
        EVENT_TREE["PASTE"] = "paste";
        EVENT_TREE["FOCUS_SET"] = "focusSet";
    })(EVENT_TREE = FudgeUserInterface.EVENT_TREE || (FudgeUserInterface.EVENT_TREE = {}));
    /**
     * Extension of [[TreeList]] that represents the root of a tree control
     * ```plaintext
     * tree <ul>
     * ├ treeItem <li>
     * ├ treeItem <li>
     * │ └ treeList <ul>
     * │   ├ treeItem <li>
     * │   └ treeItem <li>
     * └ treeItem <li>
     * ```
     */
    class Tree extends FudgeUserInterface.TreeList {
        constructor(_controller, _root) {
            super([]);
            this.hndDelete = (_event) => {
                let target = _event.target;
                _event.stopPropagation();
                let remove = this.controller.delete([target.data]);
                this.delete(remove);
            };
            this.hndEscape = (_event) => {
                this.clearSelection();
            };
            this.hndCopyPaste = (_event) => {
                // console.log(_event);
                _event.stopPropagation();
                let target = _event.target;
                switch (_event.type) {
                    case EVENT_TREE.COPY:
                        this.controller.copyPaste.sources = this.controller.copy([...this.controller.selection]);
                        break;
                    case EVENT_TREE.PASTE:
                        this.addChildren(this.controller.copyPaste.sources, target.data);
                        break;
                    case EVENT_TREE.CUT:
                        this.controller.copyPaste.sources = this.controller.copy([...this.controller.selection]);
                        let cut = this.controller.delete(this.controller.selection);
                        this.delete(cut);
                        break;
                }
            };
            this.hndFocus = (_event) => {
                _event.stopPropagation();
                let items = Array.from(this.querySelectorAll("li"));
                let target = _event.target;
                let index = items.indexOf(target);
                if (index < 0)
                    return;
                if (_event.shiftKey && this.controller.selection.length == 0)
                    target.select(true);
                switch (_event.type) {
                    case EVENT_TREE.FOCUS_NEXT:
                        if (++index < items.length)
                            items[index].focus();
                        break;
                    case EVENT_TREE.FOCUS_PREVIOUS:
                        if (--index >= 0)
                            items[index].focus();
                        break;
                    default:
                        break;
                }
                if (_event.shiftKey)
                    document.activeElement.select(true);
                else if (!_event.ctrlKey)
                    this.clearSelection();
            };
            this.controller = _controller;
            let root = new FudgeUserInterface.TreeItem(this.controller, _root);
            this.appendChild(root);
            this.addEventListener(EVENT_TREE.OPEN, this.hndOpen);
            this.addEventListener(EVENT_TREE.RENAME, this.hndRename);
            this.addEventListener(EVENT_TREE.SELECT, this.hndSelect);
            this.addEventListener(EVENT_TREE.DROP, this.hndDrop);
            this.addEventListener(EVENT_TREE.DELETE, this.hndDelete);
            this.addEventListener(EVENT_TREE.ESCAPE, this.hndEscape);
            this.addEventListener(EVENT_TREE.COPY, this.hndCopyPaste);
            this.addEventListener(EVENT_TREE.PASTE, this.hndCopyPaste);
            this.addEventListener(EVENT_TREE.CUT, this.hndCopyPaste);
            // @ts-ignore
            this.addEventListener(EVENT_TREE.FOCUS_NEXT, this.hndFocus);
            // @ts-ignore
            this.addEventListener(EVENT_TREE.FOCUS_PREVIOUS, this.hndFocus);
        }
        /**
         * Clear the current selection
         */
        clearSelection() {
            this.controller.selection.splice(0);
            this.displaySelection(this.controller.selection);
        }
        /**
         * Return the object in focus
         */
        getFocussed() {
            let items = Array.from(this.querySelectorAll("li"));
            let found = items.indexOf(document.activeElement);
            if (found > -1)
                return items[found].data;
            return null;
        }
        hndOpen(_event) {
            let item = _event.target;
            let children = this.controller.getChildren(item.data);
            if (!children || children.length == 0)
                return;
            let branch = this.createBranch(children);
            item.setBranch(branch);
            this.displaySelection(this.controller.selection);
        }
        createBranch(_data) {
            let branch = new FudgeUserInterface.TreeList([]);
            for (let child of _data) {
                branch.addItems([new FudgeUserInterface.TreeItem(this.controller, child)]);
            }
            return branch;
        }
        hndRename(_event) {
            let item = _event.target.parentNode;
            let renamed = this.controller.rename(item.data, item.getLabel());
            if (renamed)
                item.setLabel(this.controller.getLabel(item.data));
        }
        // Callback / Eventhandler in Tree
        hndSelect(_event) {
            _event.stopPropagation();
            let detail = _event.detail;
            let index = this.controller.selection.indexOf(detail.data);
            if (detail.interval) {
                let dataStart = this.controller.selection[0];
                let dataEnd = detail.data;
                this.clearSelection();
                this.selectInterval(dataStart, dataEnd);
                return;
            }
            if (index >= 0 && detail.additive)
                this.controller.selection.splice(index, 1);
            else {
                if (!detail.additive)
                    this.clearSelection();
                this.controller.selection.push(detail.data);
            }
            this.displaySelection(this.controller.selection);
        }
        hndDrop(_event) {
            _event.stopPropagation();
            this.addChildren(this.controller.dragDrop.sources, this.controller.dragDrop.target);
        }
        addChildren(_children, _target) {
            // if drop target included in children -> refuse
            if (_children.indexOf(_target) > -1)
                return;
            // add only the objects the addChildren-method of the controller returns
            let move = this.controller.addChildren(_children, _target);
            if (!move || move.length == 0)
                return;
            // TODO: don't, when copying or coming from another source
            this.delete(move);
            let targetData = _target;
            let targetItem = this.findOpen(targetData);
            let branch = this.createBranch(this.controller.getChildren(targetData));
            let old = targetItem.getBranch();
            targetItem.hasChildren = true;
            if (old)
                old.restructure(branch);
            else
                targetItem.open(true);
            _children = [];
            _target = null;
        }
    }
    FudgeUserInterface.Tree = Tree;
    customElements.define("ul-tree", Tree, { extends: "ul" });
})(FudgeUserInterface || (FudgeUserInterface = {}));
var FudgeUserInterface;
(function (FudgeUserInterface) {
    /**
     * Subclass this to create a broker between your data and a [[Tree]] to display and manipulate it.
     * The [[Tree]] doesn't know how your data is structured and how to handle it, the controller implements the methods needed
     */
    class TreeController {
        constructor() {
            /** Stores references to selected objects. Override with a reference in outer scope, if selection should also operate outside of tree */
            this.selection = [];
            /** Stores references to objects being dragged, and objects to drop on. Override with a reference in outer scope, if drag&drop should operate outside of tree */
            this.dragDrop = { sources: [], target: null };
            /** Stores references to objects being dragged, and objects to drop on. Override with a reference in outer scope, if drag&drop should operate outside of tree */
            this.copyPaste = { sources: [], target: null };
        }
    }
    FudgeUserInterface.TreeController = TreeController;
})(FudgeUserInterface || (FudgeUserInterface = {}));
///<reference path="../../../../Core/Build/FudgeCore.d.ts"/>
var FudgeUserInterface;
///<reference path="../../../../Core/Build/FudgeCore.d.ts"/>
(function (FudgeUserInterface) {
    var ƒ = FudgeCore;
    /**
     * Extension of li-element that represents an object in a [[TreeList]] with a checkbox and a textinput as content.
     * Additionally, may hold an instance of [[TreeList]] as branch to display children of the corresponding object.
     */
    class TreeItem extends HTMLLIElement {
        constructor(_controller, _data) {
            super();
            this.display = "TreeItem";
            this.classes = [];
            this.data = null;
            this.hndFocus = (_event) => {
                if (_event.target == this.label)
                    this.label.disabled = true;
            };
            this.hndKey = (_event) => {
                _event.stopPropagation();
                let content = this.querySelector("ul");
                switch (_event.code) {
                    case ƒ.KEYBOARD_CODE.ARROW_RIGHT:
                        if (this.hasChildren && !content)
                            this.open(true);
                        else
                            this.dispatchEvent(new KeyboardEvent(FudgeUserInterface.EVENT_TREE.FOCUS_NEXT, { bubbles: true, shiftKey: _event.shiftKey, ctrlKey: _event.ctrlKey }));
                        break;
                    case ƒ.KEYBOARD_CODE.ARROW_LEFT:
                        if (content)
                            this.open(false);
                        else
                            this.dispatchEvent(new KeyboardEvent(FudgeUserInterface.EVENT_TREE.FOCUS_PREVIOUS, { bubbles: true, shiftKey: _event.shiftKey, ctrlKey: _event.ctrlKey }));
                        break;
                    case ƒ.KEYBOARD_CODE.ARROW_DOWN:
                        this.dispatchEvent(new KeyboardEvent(FudgeUserInterface.EVENT_TREE.FOCUS_NEXT, { bubbles: true, shiftKey: _event.shiftKey, ctrlKey: _event.ctrlKey }));
                        break;
                    case ƒ.KEYBOARD_CODE.ARROW_UP:
                        this.dispatchEvent(new KeyboardEvent(FudgeUserInterface.EVENT_TREE.FOCUS_PREVIOUS, { bubbles: true, shiftKey: _event.shiftKey, ctrlKey: _event.ctrlKey }));
                        break;
                    case ƒ.KEYBOARD_CODE.F2:
                        this.startTypingLabel();
                        break;
                    case ƒ.KEYBOARD_CODE.SPACE:
                        this.select(_event.ctrlKey, _event.shiftKey);
                        break;
                    case ƒ.KEYBOARD_CODE.DELETE:
                        this.dispatchEvent(new Event(FudgeUserInterface.EVENT_TREE.DELETE, { bubbles: true }));
                        break;
                    case ƒ.KEYBOARD_CODE.C:
                        if (!_event.ctrlKey)
                            break;
                        event.preventDefault();
                        this.dispatchEvent(new Event(FudgeUserInterface.EVENT_TREE.COPY, { bubbles: true }));
                        break;
                    case ƒ.KEYBOARD_CODE.V:
                        if (!_event.ctrlKey)
                            break;
                        event.preventDefault();
                        this.dispatchEvent(new Event(FudgeUserInterface.EVENT_TREE.PASTE, { bubbles: true }));
                        break;
                    case ƒ.KEYBOARD_CODE.X:
                        if (!_event.ctrlKey)
                            break;
                        event.preventDefault();
                        this.dispatchEvent(new Event(FudgeUserInterface.EVENT_TREE.CUT, { bubbles: true }));
                        break;
                }
            };
            this.hndDblClick = (_event) => {
                _event.stopPropagation();
                if (_event.target != this.checkbox)
                    this.startTypingLabel();
            };
            this.hndChange = (_event) => {
                let target = _event.target;
                let item = target.parentElement;
                _event.stopPropagation();
                switch (target.type) {
                    case "checkbox":
                        this.open(target.checked);
                        break;
                    case "text":
                        target.disabled = true;
                        item.focus();
                        target.dispatchEvent(new Event(FudgeUserInterface.EVENT_TREE.RENAME, { bubbles: true }));
                        break;
                    case "default":
                        // console.log(target);
                        break;
                }
            };
            this.hndDragStart = (_event) => {
                _event.stopPropagation();
                this.controller.dragDrop.sources = [];
                if (this.selected)
                    this.controller.dragDrop.sources = this.controller.selection;
                else
                    this.controller.dragDrop.sources = [this.data];
                _event.dataTransfer.effectAllowed = "all";
            };
            this.hndDragOver = (_event) => {
                _event.stopPropagation();
                _event.preventDefault();
                this.controller.dragDrop.target = this.data;
                _event.dataTransfer.dropEffect = "move";
            };
            this.hndPointerUp = (_event) => {
                _event.stopPropagation();
                if (_event.target == this.checkbox)
                    return;
                this.select(_event.ctrlKey, _event.shiftKey);
            };
            this.hndUpdate = (_event) => {
                if (_event.currentTarget == _event.target)
                    return;
                _event.stopPropagation();
                this.hasChildren = this.controller.hasChildren(this.data);
            };
            this.controller = _controller;
            this.data = _data;
            this.display = this.controller.getLabel(_data);
            // TODO: handle cssClasses
            this.create();
            this.hasChildren = this.controller.hasChildren(_data);
            this.addEventListener(FudgeUserInterface.EVENT_TREE.CHANGE, this.hndChange);
            this.addEventListener(FudgeUserInterface.EVENT_TREE.DOUBLE_CLICK, this.hndDblClick);
            this.addEventListener(FudgeUserInterface.EVENT_TREE.FOCUS_OUT, this.hndFocus);
            this.addEventListener(FudgeUserInterface.EVENT_TREE.KEY_DOWN, this.hndKey);
            // this.addEventListener(EVENT_TREE.FOCUS_NEXT, this.hndFocus);
            // this.addEventListener(EVENT_TREE.FOCUS_PREVIOUS, this.hndFocus);
            this.draggable = true;
            this.addEventListener(FudgeUserInterface.EVENT_TREE.DRAG_START, this.hndDragStart);
            this.addEventListener(FudgeUserInterface.EVENT_TREE.DRAG_OVER, this.hndDragOver);
            this.addEventListener(FudgeUserInterface.EVENT_TREE.POINTER_UP, this.hndPointerUp);
            this.addEventListener(FudgeUserInterface.EVENT_TREE.UPDATE, this.hndUpdate);
        }
        /**
         * Returns true, when this item has a visible checkbox in front to open the subsequent branch
         */
        get hasChildren() {
            return this.checkbox.style.visibility != "hidden";
        }
        /**
         * Shows or hides the checkbox for opening the subsequent branch
         */
        set hasChildren(_has) {
            this.checkbox.style.visibility = _has ? "visible" : "hidden";
        }
        /**
         * Set the label text to show
         */
        setLabel(_text) {
            this.label.value = _text;
        }
        /**
         * Get the label text shown
         */
        getLabel() {
            return this.label.value;
        }
        /**
         * Tries to open the [[TreeList]] of children, by dispatching [[EVENT_TREE.OPEN]].
         * The user of the tree needs to add an event listener to the tree
         * in order to create that [[TreeList]] and add it as branch to this item
         * @param _open If false, the item will be closed
         */
        open(_open) {
            this.removeBranch();
            if (_open)
                this.dispatchEvent(new Event(FudgeUserInterface.EVENT_TREE.OPEN, { bubbles: true }));
            this.querySelector("input[type='checkbox']").checked = _open;
        }
        /**
         * Returns a list of all data referenced by the items succeeding this
         */
        getOpenData() {
            let list = this.querySelectorAll("li");
            let data = [];
            for (let item of list)
                data.push(item.data);
            return data;
        }
        /**
         * Sets the branch of children of this item. The branch must be a previously compiled [[TreeList]]
         */
        setBranch(_branch) {
            this.removeBranch();
            if (_branch)
                this.appendChild(_branch);
        }
        /**
         * Returns the branch of children of this item.
         */
        getBranch() {
            return this.querySelector("ul");
        }
        /**
         * Returns attaches or detaches the [[TREE_CLASS.SELECTED]] to this item
         */
        set selected(_on) {
            if (_on)
                this.classList.add(FudgeUserInterface.TREE_CLASS.SELECTED);
            else
                this.classList.remove(FudgeUserInterface.TREE_CLASS.SELECTED);
        }
        /**
         * Returns true if the [[TREE_CLASSES.SELECTED]] is attached to this item
         */
        get selected() {
            return this.classList.contains(FudgeUserInterface.TREE_CLASS.SELECTED);
        }
        /**
         * Dispatches the [[EVENT_TREE.SELECT]] event
         * @param _additive For multiple selection (+Ctrl)
         * @param _interval For selection over interval (+Shift)
         */
        select(_additive, _interval = false) {
            let event = new CustomEvent(FudgeUserInterface.EVENT_TREE.SELECT, { bubbles: true, detail: { data: this.data, additive: _additive, interval: _interval } });
            this.dispatchEvent(event);
        }
        /**
         * Removes the branch of children from this item
         */
        removeBranch() {
            let content = this.getBranch();
            if (!content)
                return;
            this.removeChild(content);
        }
        create() {
            this.checkbox = document.createElement("input");
            this.checkbox.type = "checkbox";
            this.appendChild(this.checkbox);
            this.label = document.createElement("input");
            this.label.type = "text";
            this.label.disabled = true;
            this.label.value = this.display;
            this.appendChild(this.label);
            this.tabIndex = 0;
        }
        startTypingLabel() {
            this.label.disabled = false;
            this.label.focus();
        }
    }
    FudgeUserInterface.TreeItem = TreeItem;
    customElements.define("li-tree-item", TreeItem, { extends: "li" });
})(FudgeUserInterface || (FudgeUserInterface = {}));
