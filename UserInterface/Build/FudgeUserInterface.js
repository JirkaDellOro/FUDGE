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
        // TODO: examine the use of the attribute key vs name. Key signals the use by FUDGE while name is standard and supported by forms
        domElement;
        timeUpdate = 190;
        /** Refererence to the [[FudgeCore.Mutable]] this ui refers to */
        mutable;
        /** [[FudgeCore.Mutator]] used to convey data to and from the mutable*/
        mutator;
        /** [[FudgeCore.Mutator]] used to store the data types of the mutator attributes*/
        mutatorTypes = null;
        idInterval;
        constructor(_mutable, _domElement) {
            this.domElement = _domElement;
            this.setMutable(_mutable);
            // TODO: examine, if this should register to one common interval, instead of each installing its own.
            this.startRefresh();
            this.domElement.addEventListener("input" /* INPUT */, this.mutateOnInput);
            this.domElement.addEventListener("rearrangeArray" /* REARRANGE_ARRAY */, this.rearrangeArray);
        }
        /**
         * Recursive method taking an existing [[ƒ.Mutator]] as a template
         * and updating its values with those found in the given UI-domElement.
         */
        static updateMutator(_domElement, _mutator) {
            for (let key in _mutator) {
                let element = Controller.findChildElementByKey(_domElement, key);
                if (element == null)
                    continue;
                if (element instanceof FudgeUserInterface.CustomElement)
                    _mutator[key] = element.getMutatorValue();
                else if (_mutator[key] instanceof Object)
                    _mutator[key] = Controller.updateMutator(element, _mutator[key]);
                else
                    _mutator[key] = element.value;
            }
            return _mutator;
        }
        /**
         * Recursive method taking the a [[ƒ.Mutable]] as a template to create a [[ƒ.Mutator]] or update the given [[ƒ.Mutator]]
         * with the values in the given UI-domElement
         */
        static getMutator(_mutable, _domElement, _mutator, _types) {
            // TODO: examine if this.mutator should also be addressed in some way...
            let mutator = _mutator || _mutable.getMutatorForUserInterface();
            // TODO: Mutator type now only used for enums. Examine if there is another way
            let mutatorTypes = _types || _mutable.getMutatorAttributeTypes(mutator);
            for (let key in mutator) {
                let element = Controller.findChildElementByKey(_domElement, key);
                if (element == null)
                    return mutator;
                if (element instanceof FudgeUserInterface.CustomElement)
                    mutator[key] = element.getMutatorValue();
                else if (element instanceof HTMLInputElement)
                    mutator[key] = element.value;
                else if (mutatorTypes[key] instanceof Object)
                    // TODO: setting a value of the dom element doesn't make sense... examine what this line was supposed to do. Assumably enums
                    mutator[key] = element.value;
                else {
                    let subMutator = Reflect.get(mutator, key);
                    let subMutable;
                    subMutable = Reflect.get(_mutable, key);
                    if (subMutable instanceof ƒ.MutableArray || subMutable instanceof ƒ.Mutable)
                        mutator[key] = this.getMutator(subMutable, element, subMutator); //, subTypes);
                }
            }
            return mutator;
        }
        /**
         * Recursive method taking the [[ƒ.Mutator]] of a [[ƒ.Mutable]] and updating the UI-domElement accordingly.
         * If an additional [[ƒ.Mutator]] is passed, its values are used instead of those of the [[ƒ.Mutable]].
         */
        static updateUserInterface(_mutable, _domElement, _mutator) {
            let mutator = _mutator || _mutable.getMutatorForUserInterface();
            let mutatorTypes = {};
            if (_mutable instanceof ƒ.Mutable)
                mutatorTypes = _mutable.getMutatorAttributeTypes(mutator);
            for (let key in mutator) {
                let element = Controller.findChildElementByKey(_domElement, key);
                if (!element)
                    continue;
                let value = mutator[key];
                if (element instanceof FudgeUserInterface.CustomElement && element != document.activeElement)
                    element.setMutatorValue(value);
                else if (mutatorTypes[key] instanceof Object)
                    element.setMutatorValue(value);
                else {
                    let subMutable = Reflect.get(_mutable, key);
                    if (subMutable instanceof ƒ.MutableArray || subMutable instanceof ƒ.Mutable)
                        this.updateUserInterface(subMutable, element, mutator[key]);
                    else
                        //element.setMutatorValue(value);
                        Reflect.set(element, "value", value);
                }
            }
        }
        static findChildElementByKey(_domElement, key) {
            let result;
            try {
                result = _domElement.querySelector(`[key = ${key}]`);
            }
            catch (_error) {
                result = _domElement.querySelector(`[key = ${"ƒ" + key}]`);
            }
            return result;
        }
        getMutator(_mutator, _types) {
            // TODO: should get Mutator for UI or work with this.mutator (examine)
            this.mutable.updateMutator(this.mutator);
            return Controller.getMutator(this.mutable, this.domElement, _mutator, _types);
        }
        updateUserInterface() {
            Controller.updateUserInterface(this.mutable, this.domElement);
        }
        setMutable(_mutable) {
            this.mutable = _mutable;
            this.mutator = _mutable.getMutatorForUserInterface();
            if (_mutable instanceof ƒ.Mutable)
                this.mutatorTypes = _mutable.getMutatorAttributeTypes(this.mutator);
        }
        getMutable() {
            return this.mutable;
        }
        startRefresh() {
            window.clearInterval(this.idInterval);
            this.idInterval = window.setInterval(this.refresh, this.timeUpdate);
        }
        mutateOnInput = async (_event) => {
            this.mutator = this.getMutator();
            await this.mutable.mutate(this.mutator);
            _event.stopPropagation();
            this.domElement.dispatchEvent(new Event("mutate" /* MUTATE */, { bubbles: true }));
        };
        rearrangeArray = async (_event) => {
            let sequence = _event.detail.sequence;
            let path = [];
            let details = _event.target;
            let mutable;
            { // find the MutableArray connected to this DetailsArray
                let element = details;
                while (element != this.domElement) {
                    if (element.getAttribute("key"))
                        path.push(element.getAttribute("key"));
                    element = element.parentElement;
                }
                // console.log(path);
                mutable = this.mutable;
                for (let key of path)
                    mutable = Reflect.get(mutable, key);
            }
            // rearrange that mutable
            mutable.rearrange(sequence);
        };
        refresh = (_event) => {
            if (document.body.contains(this.domElement)) {
                this.updateUserInterface();
                return;
            }
            window.clearInterval(this.idInterval);
        };
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
         * Creates a [[Controller]] from a [[FudgeCore.Mutable]] with expandable details or a list
         */
        static createController(_mutable, _name) {
            let controller = new FudgeUserInterface.Controller(_mutable, Generator.createDetailsFromMutable(_mutable, _name));
            controller.updateUserInterface();
            return controller;
        }
        /**
         * Create extendable details for the [[FudgeCore.Mutator]] or the [[FudgeCore.Mutable]]
         */
        static createDetailsFromMutable(_mutable, _name, _mutator) {
            let name = _name || _mutable.constructor.name;
            let details;
            if (_mutable instanceof ƒ.MutableArray)
                details = new FudgeUserInterface.DetailsArray(name);
            else if (_mutable instanceof ƒ.Mutable)
                details = new FudgeUserInterface.Details(name, _mutable.type);
            else
                return null;
            details.setContent(Generator.createInterfaceFromMutable(_mutable, _mutator));
            return details;
        }
        /**
         * Create a div-Elements containing the interface for the [[FudgeCore.Mutator]] or the [[FudgeCore.Mutable]]
         */
        static createInterfaceFromMutable(_mutable, _mutator) {
            let mutator = _mutator || _mutable.getMutatorForUserInterface();
            let mutatorTypes = _mutable.getMutatorAttributeTypes(mutator);
            let div = document.createElement("div");
            for (let key in mutatorTypes) {
                let type = mutatorTypes[key];
                let value = mutator[key];
                let element = Generator.createMutatorElement(key, type, value);
                if (!element) {
                    let subMutable;
                    subMutable = Reflect.get(_mutable, key);
                    element = Generator.createDetailsFromMutable(subMutable, key, mutator[key]);
                    if (!element)
                        //Idea: Display an enumerated select here
                        element = new FudgeUserInterface.CustomElementTextInput({ key: key, label: key, value: type ? type.toString() : "?" });
                }
                div.appendChild(element);
            }
            return div;
        }
        /**
         * Create a div-Element containing the interface for the [[FudgeCore.Mutator]]
         * Does not support nested mutators!
         */
        static createInterfaceFromMutator(_mutator) {
            let div = document.createElement("div");
            for (let key in _mutator) {
                let value = Reflect.get(_mutator, key);
                if (value instanceof Object) {
                    // let details: Details = Generator.createDetails(key, "Details");
                    let details = new FudgeUserInterface.Details(key, "Details");
                    details.content.appendChild(Generator.createInterfaceFromMutator(value));
                    div.appendChild(details);
                }
                else
                    div.appendChild(this.createMutatorElement(key, value.constructor.name, value));
            }
            return div;
        }
        /**
         * Create a specific CustomElement for the given data, using _key as identification
         */
        static createMutatorElement(_key, _type, _value) {
            let element;
            try {
                if (_type instanceof Object) {
                    let elementType = FudgeUserInterface.CustomElement.get("Object");
                    // @ts-ignore: instantiate abstract class
                    element = new elementType({ key: _key, label: _key, value: _value.toString() }, _type);
                }
                // TODO: delete?
                else if (_value instanceof ƒ.MutableArray) {
                    console.log("MutableArray");
                    // insert Array-Controller!
                }
                else {
                    let elementType = FudgeUserInterface.CustomElement.get(_type);
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
    class CustomElement extends HTMLElement {
        static tag;
        static mapObjectToCustomElement = new Map();
        static idCounter = 0;
        initialized = false;
        constructor(_attributes) {
            super();
            if (_attributes)
                for (let name in _attributes) {
                    this.setAttribute(name, _attributes[name]);
                    if (name == "key" && !isNaN(Number(_attributes[name])))
                        // if key is a number, as with arrays, prefix with "ƒ", since numbers are not allowed as attributes for querySelector
                        this.setAttribute(name, "ƒ" + _attributes[name]);
                }
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
            ƒ.Debug.fudge("Map", _type, _typeCustomElement.name);
            CustomElement.mapObjectToCustomElement.set(_type, _typeCustomElement);
        }
        /**
         * Return the key (name) of the attribute this element represents
         */
        get key() {
            return this.getAttribute("key");
        }
        /**
         * Add a label-element as child to this element
         */
        appendLabel() {
            let text = this.getAttribute("label");
            if (!text)
                return null;
            let label = document.createElement("label");
            label.textContent = text;
            this.appendChild(label);
            return label;
        }
        setLabel(_label) {
            let label = this.querySelector("label");
            if (label)
                label.textContent = _label;
        }
        /**
         * Set the value of this element using a format compatible with [[FudgeCore.Mutator]]
         */
        setMutatorValue(_value) {
            Reflect.set(this, "value", _value);
        }
        /** Workaround reconnection of clone */
        cloneNode(_deep) {
            let label = this.getAttribute("label");
            //@ts-ignore
            let clone = new this.constructor(label ? { label: label } : null);
            document.body.appendChild(clone);
            clone.setMutatorValue(this.getMutatorValue());
            for (let attribute of this.attributes)
                clone.setAttribute(attribute.name, attribute.value);
            return clone;
        }
    }
    FudgeUserInterface.CustomElement = CustomElement;
})(FudgeUserInterface || (FudgeUserInterface = {}));
var FudgeUserInterface;
(function (FudgeUserInterface) {
    /**
     * A standard checkbox with a label to it
     */
    class CustomElementBoolean extends FudgeUserInterface.CustomElement {
        // @ts-ignore
        static customElement = FudgeUserInterface.CustomElement.register("fudge-boolean", CustomElementBoolean, Boolean);
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
    FudgeUserInterface.CustomElementBoolean = CustomElementBoolean;
})(FudgeUserInterface || (FudgeUserInterface = {}));
var FudgeUserInterface;
(function (FudgeUserInterface) {
    var ƒ = FudgeCore;
    /**
     * A color picker with a label to it and a slider for opacity
     */
    class CustomElementColor extends FudgeUserInterface.CustomElement {
        // @ts-ignore
        static customElement = FudgeUserInterface.CustomElement.register("fudge-color", CustomElementColor, ƒ.Color);
        color = new ƒ.Color();
        constructor(_attributes) {
            super(_attributes);
            if (!_attributes.label)
                this.setAttribute("label", _attributes.key);
            this.addEventListener("keydown" /* KEY_DOWN */, this.hndKey);
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
            slider.addEventListener("wheel" /* WHEEL */, this.hndWheel);
        }
        /**
         * Retrieves the values of picker and slider as ƒ.Mutator
         */
        getMutatorValue() {
            let hex = this.querySelector("input[type=color").value;
            let alpha = this.querySelector("input[type=range").value;
            this.color.setHex(hex.substr(1, 6) + "ff");
            this.color.a = parseFloat(alpha);
            return this.color.getMutatorForUserInterface();
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
        hndKey(_event) {
            _event.stopPropagation();
        }
        hndWheel(_event) {
            let slider = _event.target;
            if (slider != document.activeElement)
                return;
            _event.stopPropagation();
            _event.preventDefault();
            // console.log(_event.deltaY / 1000);
            let currentValue = Number(slider.value);
            slider.value = String(currentValue - _event.deltaY / 1000);
            slider.dispatchEvent(new Event("input" /* INPUT */, { bubbles: true }));
        }
    }
    FudgeUserInterface.CustomElementColor = CustomElementColor;
})(FudgeUserInterface || (FudgeUserInterface = {}));
var FudgeUserInterface;
(function (FudgeUserInterface) {
    /**
     * Represents a single digit number to be used in groups to represent a multidigit value.
     * Is tabbable and in-/decreases previous sibling when flowing over/under.
     */
    class CustomElementDigit extends HTMLElement {
        // @ts-ignore
        static customElement = FudgeUserInterface.CustomElement.register("fudge-digit", CustomElementDigit);
        initialized = false;
        constructor() {
            super();
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
        connectedCallback() {
            if (this.initialized)
                return;
            this.initialized = true;
            this.value = 0;
            this.tabIndex = -1;
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
    class CustomElementTemplate extends FudgeUserInterface.CustomElement {
        static fragment = new Map();
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
                    ƒ.Debug.fudge("Register", template.content.children[0]);
                    CustomElementTemplate.fragment.set(_tagName, template.content);
                }
            }
        }
        /**
         * Get the value of this element in a format compatible with [[FudgeCore.Mutator]]
         */
        getMutatorValue() {
            let mutator = {};
            let elements = this.querySelectorAll("[key");
            for (let element of elements) {
                let key = element.getAttribute("key");
                if (element instanceof FudgeUserInterface.CustomElement)
                    mutator[key] = element.getMutatorValue();
                else
                    mutator[key] = element.value;
            }
            return mutator;
        }
        setMutatorValue(_mutator) {
            for (let key in _mutator) {
                let element = this.querySelector(`[key=${key}]`);
                if (!element)
                    console.log(`Couldn't find ${key} in`, this);
                if (element instanceof FudgeUserInterface.CustomElement)
                    element.setMutatorValue(_mutator[key]);
                else
                    element.value = _mutator[key];
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
            let label = this.querySelector("label");
            if (label)
                label.textContent = this.getAttribute("label");
        }
    }
    FudgeUserInterface.CustomElementTemplate = CustomElementTemplate;
})(FudgeUserInterface || (FudgeUserInterface = {}));
///<reference path="CustomElementTemplate.ts"/>
var FudgeUserInterface;
///<reference path="CustomElementTemplate.ts"/>
(function (FudgeUserInterface) {
    class CustomElementMatrix3x3 extends FudgeUserInterface.CustomElementTemplate {
        getMutatorValue() {
            let steppers = this.querySelectorAll("fudge-stepper");
            let mutator = { translation: {}, scaling: {}, rotation: 0 };
            let count = 0;
            for (let vector of ["translation", "scaling"])
                for (let dimension of ["x", "y"])
                    mutator[vector][dimension] = steppers[count++].getMutatorValue();
            mutator["rotation"] = steppers[count++].getMutatorValue();
            return mutator;
        }
        setMutatorValue(_mutator) {
            let steppers = this.querySelectorAll("fudge-stepper");
            let count = 0;
            for (let vector of ["translation", "scaling"])
                for (let dimension of ["x", "y"])
                    steppers[count++].setMutatorValue(Number(_mutator[vector][dimension]));
            steppers[count++].setMutatorValue(Number(_mutator["rotation"]));
        }
        connectedCallback() {
            super.connectedCallback();
            // console.log("Matrix Callback");
            let label = this.querySelector("label");
            label.textContent = this.getAttribute("label");
        }
    }
    FudgeUserInterface.CustomElementMatrix3x3 = CustomElementMatrix3x3;
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
    class CustomElementSelect extends FudgeUserInterface.CustomElement {
        // @ts-ignore
        static customElement = FudgeUserInterface.CustomElement.register("fudge-select", CustomElementSelect, Object);
        content;
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
        getMutatorValue() {
            return this.querySelector("select").value;
        }
        /**
         * Sets the status of the checkbox
         */
        setMutatorValue(_value) {
            this.querySelector("select").value = _value;
            // this.value = _value;
        }
    }
    FudgeUserInterface.CustomElementSelect = CustomElementSelect;
})(FudgeUserInterface || (FudgeUserInterface = {}));
var FudgeUserInterface;
(function (FudgeUserInterface) {
    var ƒ = FudgeCore;
    /**
     * An interactive number stepper with exponential display and complex handling using keyboard and mouse
     */
    class CustomElementStepper extends FudgeUserInterface.CustomElement {
        // @ts-ignore
        static customElement = FudgeUserInterface.CustomElement.register("fudge-stepper", CustomElementStepper, Number);
        value = 0;
        constructor(_attributes) {
            super(_attributes);
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
            input.addEventListener("input" /* INPUT */, (_event) => { _event.stopPropagation(); });
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
            // input.addEventListener(EVENT.CHANGE, this.hndInput);
            input.addEventListener("blur" /* BLUR */, this.hndInput);
            this.addEventListener("blur" /* BLUR */, this.hndFocus);
            this.addEventListener("keydown" /* KEY_DOWN */, this.hndKey);
            this.addEventListener("wheel" /* WHEEL */, this.hndWheel);
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
            let digits = this.querySelectorAll("fudge-digit");
            let spans = this.querySelectorAll("span");
            if (!isFinite(this.value)) {
                for (let pos = 0; pos < digits.length; pos++) {
                    let digit = digits[5 - pos];
                    digit.innerHTML = "  ∞   "[5 - pos];
                    spans[1].textContent = "  ";
                }
                return;
            }
            let [mantissa, exp] = this.toString().split("e");
            spans[0].textContent = this.value < 0 ? "-" : "+";
            spans[1].textContent = exp;
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
        /**
         * Handle keyboard input on this element and its digits
         */
        hndKey = (_event) => {
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
                    this.dispatchEvent(new Event("input" /* INPUT */, { bubbles: true }));
                }
                return;
            }
            if (numEntered >= 0 && numEntered <= 9) {
                let difference = numEntered - Number(active.textContent) * (this.value < 0 ? -1 : 1);
                this.changeDigitFocussed(difference);
                let next = active.nextElementSibling;
                if (next)
                    next.focus();
                this.dispatchEvent(new Event("input" /* INPUT */, { bubbles: true }));
                return;
            }
            if (_event.key == "-" || _event.key == "+") {
                this.value = (_event.key == "-" ? -1 : 1) * Math.abs(this.value);
                this.display();
                this.dispatchEvent(new Event("input" /* INPUT */, { bubbles: true }));
                return;
            }
            if (_event.code != ƒ.KEYBOARD_CODE.TABULATOR)
                _event.preventDefault();
            switch (_event.code) {
                case ƒ.KEYBOARD_CODE.ARROW_DOWN:
                    this.changeDigitFocussed(-1);
                    this.dispatchEvent(new Event("input" /* INPUT */, { bubbles: true }));
                    break;
                case ƒ.KEYBOARD_CODE.ARROW_UP:
                    this.changeDigitFocussed(+1);
                    this.dispatchEvent(new Event("input" /* INPUT */, { bubbles: true }));
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
        };
        hndWheel = (_event) => {
            _event.stopPropagation();
            _event.preventDefault();
            let change = _event.deltaY < 0 ? +1 : -1;
            this.changeDigitFocussed(change);
            this.dispatchEvent(new Event("input" /* INPUT */, { bubbles: true }));
        };
        hndInput = (_event) => {
            this.openInput(false);
        };
        hndFocus = (_event) => {
            if (this.contains(document.activeElement))
                return;
            this.activateInnerTabs(false);
        };
        changeDigitFocussed(_amount) {
            let digit = document.activeElement;
            if (digit == this || !this.contains(digit))
                return;
            _amount = Math.round(_amount);
            if (_amount == 0)
                return;
            if (digit == this.querySelector("[name=exp]")) {
                // console.log(this.value);
                let value = this.value * Math.pow(10, _amount);
                console.log(value, this.value);
                if (isFinite(value))
                    this.value = value;
                this.display();
                return;
            }
            let expDigit = parseInt(digit.getAttribute("exp"));
            // @ts-ignore (mantissa not used)
            let [mantissa, expValue] = this.getMantissaAndExponent();
            let prev = this.value;
            this.value += _amount * Math.pow(10, expDigit + expValue);
            // workaround precision problems of javascript
            if (Math.abs(prev / this.value) > 1000)
                this.value = 0;
            let expNew;
            [mantissa, expNew] = this.getMantissaAndExponent();
            // console.log(mantissa);
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
    FudgeUserInterface.CustomElementStepper = CustomElementStepper;
})(FudgeUserInterface || (FudgeUserInterface = {}));
var FudgeUserInterface;
(function (FudgeUserInterface) {
    /**
     * A standard text input field with a label to it.
     */
    class CustomElementTextInput extends FudgeUserInterface.CustomElement {
        // @ts-ignore
        static customElement = FudgeUserInterface.CustomElement.register("fudge-textinput", CustomElementTextInput, String);
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
    FudgeUserInterface.CustomElementTextInput = CustomElementTextInput;
})(FudgeUserInterface || (FudgeUserInterface = {}));
var FudgeUserInterface;
(function (FudgeUserInterface) {
    var ƒ = FudgeCore;
    class Details extends HTMLDetailsElement {
        content;
        constructor(_legend = "", _type) {
            super();
            this.setAttribute("key", _legend);
            this.setAttribute("type", _type);
            this.open = true;
            let lblSummary = document.createElement("summary");
            lblSummary.textContent = _legend;
            this.appendChild(lblSummary);
            this.content = document.createElement("div");
            this.appendChild(this.content);
            this.tabIndex = 0;
            this.addEventListener("keydown" /* KEY_DOWN */, this.hndKey);
            this.addEventListener("focusNext" /* FOCUS_NEXT */, this.hndFocus);
            this.addEventListener("focusPrevious" /* FOCUS_PREVIOUS */, this.hndFocus);
            this.addEventListener("focusSet" /* FOCUS_SET */, this.hndFocus);
            this.addEventListener("toggle" /* TOGGLE */, this.hndToggle);
        }
        get isExpanded() {
            // return this.expander.checked;
            return this.open;
        }
        setContent(_content) {
            this.replaceChild(_content, this.content);
            this.content = _content;
        }
        expand(_expand) {
            // this.expander.checked = _expand;
            this.open = _expand;
            this.hndToggle(null);
        }
        hndToggle = (_event) => {
            if (_event)
                _event.stopPropagation();
            this.dispatchEvent(new Event(this.isExpanded ? "expand" /* EXPAND */ : "collapse" /* COLLAPSE */, { bubbles: true }));
        };
        hndFocus = (_event) => {
            switch (_event.type) {
                case "focusNext" /* FOCUS_NEXT */:
                    let next = this.nextElementSibling;
                    if (next && next.tabIndex > -1) {
                        next.focus();
                        _event.stopPropagation();
                    }
                    break;
                case "focusPrevious" /* FOCUS_PREVIOUS */:
                    let previous = this.previousElementSibling;
                    if (previous && previous.tabIndex > -1) {
                        let sets = previous.querySelectorAll("details");
                        let i = sets.length;
                        if (i)
                            do { // focus the last visible set
                                sets[--i].focus();
                            } while (!sets[i].offsetParent);
                        else
                            previous.focus();
                        _event.stopPropagation();
                    }
                    break;
                case "focusSet" /* FOCUS_SET */:
                    if (_event.target != this) {
                        this.focus();
                        _event.stopPropagation();
                    }
                    break;
            }
        };
        hndKey = (_event) => {
            _event.stopPropagation();
            // let target: HTMLElement = <HTMLElement>_event.target;
            switch (_event.code) {
                case ƒ.KEYBOARD_CODE.ARROW_RIGHT:
                    if (!this.isExpanded) {
                        this.expand(true);
                        return;
                    }
                case ƒ.KEYBOARD_CODE.ARROW_DOWN:
                    let next = this;
                    if (this.isExpanded)
                        next = this.querySelector("details");
                    else
                        do {
                            next = next.nextElementSibling;
                        } while (next && next.tabIndex > -1);
                    if (next)
                        next.focus();
                    // next.dispatchEvent(new KeyboardEvent(EVENT_TREE.FOCUS_NEXT, { bubbles: true, shiftKey: _event.shiftKey, ctrlKey: _event.ctrlKey }));
                    else
                        this.dispatchEvent(new KeyboardEvent("focusNext" /* FOCUS_NEXT */, { bubbles: true, shiftKey: _event.shiftKey, ctrlKey: _event.ctrlKey }));
                    break;
                case ƒ.KEYBOARD_CODE.ARROW_LEFT:
                    if (this.isExpanded) {
                        this.expand(false);
                        return;
                    }
                case ƒ.KEYBOARD_CODE.ARROW_UP:
                    let previous = this;
                    do {
                        previous = previous.previousElementSibling;
                    } while (previous && !(previous instanceof Details));
                    if (previous)
                        if (previous.isExpanded)
                            this.dispatchEvent(new KeyboardEvent("focusPrevious" /* FOCUS_PREVIOUS */, { bubbles: true, shiftKey: _event.shiftKey, ctrlKey: _event.ctrlKey }));
                        else
                            previous.focus();
                    else
                        this.parentElement.dispatchEvent(new KeyboardEvent("focusSet" /* FOCUS_SET */, { bubbles: true, shiftKey: _event.shiftKey, ctrlKey: _event.ctrlKey }));
                    break;
            }
        };
    }
    FudgeUserInterface.Details = Details;
    // TODO: use CustomElement.register?
    customElements.define("ui-details", Details, { extends: "details" });
})(FudgeUserInterface || (FudgeUserInterface = {}));
var FudgeUserInterface;
(function (FudgeUserInterface) {
    var ƒ = FudgeCore;
    class DetailsArray extends FudgeUserInterface.Details {
        constructor(_legend) {
            super(_legend, "Array");
        }
        setContent(_content) {
            super.setContent(_content);
            for (let child of this.content.children) {
                this.addEventListeners(child);
            }
        }
        getMutator() {
            let mutator = [];
            for (let child of this.content.children) {
                mutator.push(child.getMutatorValue());
            }
            return mutator;
        }
        addEventListeners(_child) {
            _child.draggable = true;
            _child.addEventListener("dragstart" /* DRAG_START */, this.hndDragStart);
            _child.addEventListener("drop" /* DROP */, this.hndDrop);
            _child.addEventListener("dragover" /* DRAG_OVER */, this.hndDragOver);
            _child.addEventListener("keydown" /* KEY_DOWN */, this.hndkey, true);
            _child.tabIndex = 0;
        }
        rearrange(_focus = undefined) {
            let sequence = [];
            for (let child of this.content.children) {
                sequence.push(parseInt(child.getAttribute("label")));
            }
            this.setFocus(_focus);
            this.dispatchEvent(new CustomEvent("rearrangeArray" /* REARRANGE_ARRAY */, { bubbles: true, detail: { key: this.getAttribute("key"), sequence: sequence } }));
            let count = 0;
            for (let child of this.content.children) {
                child.setAttribute("label", count.toString());
                child.setAttribute("key", "ƒ" + count);
                child.setLabel(count.toString());
                console.log(child.tabIndex);
                count++;
            }
            this.dispatchEvent(new Event("input" /* INPUT */, { bubbles: true }));
        }
        setFocus(_focus = undefined) {
            if (_focus == undefined)
                return;
            _focus = Math.max(0, Math.min(_focus, this.content.children.length - 1));
            this.content.children[_focus].focus();
        }
        hndDragStart = (_event) => {
            // _event.preventDefault; 
            let keyDrag = _event.currentTarget.getAttribute("key");
            _event.dataTransfer.setData("index", keyDrag);
            console.log(keyDrag);
        };
        hndDragOver = (_event) => {
            _event.preventDefault();
            if (_event.ctrlKey)
                _event.dataTransfer.dropEffect = "copy";
            if (_event.shiftKey)
                _event.dataTransfer.dropEffect = "link";
        };
        hndDrop = (_event) => {
            let drop = _event.currentTarget;
            let keyDrop = drop.getAttribute("key");
            let keyDrag = _event.dataTransfer.getData("index");
            let drag = this.querySelector(`[key=${keyDrag}]`);
            let position = keyDrag > keyDrop ? "beforebegin" : "afterend";
            if (_event.ctrlKey)
                drag = drag.cloneNode(true);
            if (_event.shiftKey)
                drag.parentNode.removeChild(drag);
            else
                drop.insertAdjacentElement(position, drag);
            this.rearrange();
            this.addEventListeners(drag);
            drag.focus();
        };
        hndkey = (_event) => {
            let item = _event.currentTarget;
            // only work on items of list, not their children
            if (_event.target != item)
                return;
            let focus = parseInt(item.getAttribute("label"));
            let sibling = item;
            let insert = item;
            let passEvent = false;
            switch (_event.code) {
                case ƒ.KEYBOARD_CODE.DELETE:
                    item.parentNode.removeChild(item);
                    this.rearrange(focus);
                    break;
                case ƒ.KEYBOARD_CODE.ARROW_UP:
                    if (!_event.altKey) {
                        this.setFocus(--focus);
                        break;
                    }
                    if (_event.shiftKey) {
                        insert = item.cloneNode(true);
                        this.addEventListeners(insert);
                    }
                    else
                        sibling = item.previousSibling;
                    if (sibling)
                        sibling.insertAdjacentElement("beforebegin", insert);
                    this.rearrange(--focus);
                    break;
                case ƒ.KEYBOARD_CODE.ARROW_DOWN:
                    if (!_event.altKey) {
                        this.setFocus(++focus);
                        break;
                    }
                    if (_event.shiftKey) {
                        insert = item.cloneNode(true);
                        this.addEventListeners(insert);
                    }
                    else
                        sibling = item.nextSibling;
                    if (sibling)
                        sibling.insertAdjacentElement("afterend", insert);
                    this.rearrange(++focus);
                    break;
                default:
                    passEvent = true;
            }
            if (!passEvent) {
                _event.stopPropagation();
            }
        };
    }
    FudgeUserInterface.DetailsArray = DetailsArray;
    customElements.define("ui-list", DetailsArray, { extends: "details" });
})(FudgeUserInterface || (FudgeUserInterface = {}));
var FudgeUserInterface;
(function (FudgeUserInterface) {
    var ƒ = FudgeCore;
    /**
     * Static class to display a modal or non-modal dialog with an interface for the given mutator.
     */
    class Dialog {
        static dom;
        /**
         * Prompt the dialog to the user with the given headline, call to action and labels for the cancel- and ok-button
         * Use `await` on call, to continue after the user has pressed one of the buttons.
         */
        static async prompt(_data, _modal = true, _head = "Headline", _callToAction = "Instruction", _ok = "OK", _cancel = "Cancel") {
            Dialog.dom = document.createElement("dialog");
            document.body.appendChild(Dialog.dom);
            Dialog.dom.innerHTML = "<h1>" + _head + "</h1>";
            let content;
            if (_data instanceof ƒ.Mutable)
                content = FudgeUserInterface.Generator.createInterfaceFromMutable(_data);
            else
                content = FudgeUserInterface.Generator.createInterfaceFromMutator(_data);
            content.id = "content";
            Dialog.dom.appendChild(content);
            let div = document.createElement("div");
            div.innerHTML = "<p>" + _callToAction + "</p>";
            let btnCancel = document.createElement("button");
            btnCancel.innerHTML = _cancel;
            div.appendChild(btnCancel);
            let btnOk = document.createElement("button");
            btnOk.innerHTML = _ok;
            div.appendChild(btnOk);
            Dialog.dom.appendChild(div);
            if (_modal)
                //@ts-ignore
                Dialog.dom.showModal();
            else
                //@ts-ignore
                Dialog.dom.show();
            return new Promise((_resolve) => {
                let hndButton = (_event) => {
                    btnCancel.removeEventListener("click", hndButton);
                    btnOk.removeEventListener("click", hndButton);
                    if (_event.target == btnOk)
                        FudgeUserInterface.Controller.updateMutator(content, _data);
                    //@ts-ignore
                    Dialog.dom.close();
                    document.body.removeChild(Dialog.dom);
                    _resolve(_event.target == btnOk);
                };
                btnCancel.addEventListener("click" /* CLICK */, hndButton);
                btnOk.addEventListener("click" /* CLICK */, hndButton);
            });
        }
    }
    FudgeUserInterface.Dialog = Dialog;
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
var FudgeUserInterface;
(function (FudgeUserInterface) {
    // TODO: duplicated code in Table and Tree, may be optimized...
    /**
     * Manages a sortable table of data given as simple array of flat objects
     * ```plaintext
     * Key0  Key1 Key2
     * ```
     */
    class Table extends HTMLTableElement {
        controller;
        data;
        constructor(_controller, _data) {
            super();
            this.controller = _controller;
            this.data = _data;
            this.create();
            this.className = "sortable";
            this.addEventListener("sort" /* SORT */, this.hndSort);
            this.addEventListener("itemselect" /* SELECT */, this.hndSelect);
            this.addEventListener("focusNext" /* FOCUS_NEXT */, this.hndFocus);
            this.addEventListener("focusPrevious" /* FOCUS_PREVIOUS */, this.hndFocus);
            this.addEventListener("escape" /* ESCAPE */, this.hndEscape);
            this.addEventListener("delete" /* DELETE */, this.hndDelete);
            // this.addEventListener(EVENT_TABLE.CHANGE, this.hndSort);
            // this.addEventListener(EVENT_TREE.RENAME, this.hndRename);
            // this.addEventListener(EVENT_TREE.DROP, this.hndDrop);
            // this.addEventListener(EVENT_TREE.COPY, this.hndCopyPaste);
            // this.addEventListener(EVENT_TREE.PASTE, this.hndCopyPaste);
            // this.addEventListener(EVENT_TREE.CUT, this.hndCopyPaste);
        }
        /**
         * Create the table
         */
        create() {
            this.innerHTML = "";
            let head = this.controller.getHead();
            this.appendChild(this.createHead(head));
            for (let row of this.data) {
                // tr = this.createRow(row, head);
                let item = new FudgeUserInterface.TableItem(this.controller, row);
                this.appendChild(item);
            }
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
            let items = Array.from(this.querySelectorAll("tr"));
            let found = items.indexOf(document.activeElement);
            if (found > -1)
                return items[found].data;
            return null;
        }
        selectInterval(_dataStart, _dataEnd) {
            let items = this.querySelectorAll("tr");
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
            // console.log(_dataStart, _dataEnd);
        }
        displaySelection(_data) {
            // console.log(_data);
            let items = this.querySelectorAll("tr");
            for (let item of items)
                item.selected = (_data != null && _data.indexOf(item.data) > -1);
        }
        createHead(_headInfo) {
            let tr = document.createElement("tr");
            for (let entry of _headInfo) {
                let th = document.createElement("th");
                th.textContent = entry.label;
                th.setAttribute("key", entry.key);
                if (entry.sortable) {
                    th.appendChild(this.getSortButtons());
                    th.addEventListener("change" /* CHANGE */, (_event) => th.dispatchEvent(new CustomEvent("sort" /* SORT */, { detail: _event.target, bubbles: true })));
                }
                tr.appendChild(th);
            }
            return tr;
        }
        getSortButtons() {
            let result = document.createElement("span");
            for (let direction of ["up", "down"]) {
                let button = document.createElement("input");
                button.type = "radio";
                button.name = "sort";
                button.value = direction;
                result.appendChild(button);
            }
            return result;
        }
        hndSort(_event) {
            let value = _event.detail.value;
            let key = _event.target.getAttribute("key");
            let direction = (value == "up") ? 1 : -1;
            this.controller.sort(this.data, key, direction);
            this.create();
        }
        // private hndEvent(_event: Event): void {
        //   console.log(_event.currentTarget);
        //   switch (_event.type) {
        //     case EVENT.CLICK:
        //       let event: CustomEvent = new CustomEvent(EVENT.SELECT, { bubbles: true });
        //       this.dispatchEvent(event);
        //   }
        // }
        // private hndRename(_event: Event): void {
        //   // let item: TreeItem<T> = <TreeItem<T>>(<HTMLInputElement>_event.target).parentNode;
        //   // let renamed: boolean = this.controller.rename(item.data, item.getLabel());
        //   // if (renamed)
        //   //   item.setLabel(this.controller.getLabel(item.data));
        // }
        hndSelect(_event) {
            // _event.stopPropagation();
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
        // private hndDrop(_event: DragEvent): void {
        //   // _event.stopPropagation();
        //   // this.addChildren(this.controller.dragDrop.sources, this.controller.dragDrop.target);
        // }
        hndDelete = (_event) => {
            let target = _event.target;
            _event.stopPropagation();
            let remove = this.controller.delete([target.data]);
            console.log(remove);
            // this.delete(remove);
        };
        hndEscape = (_event) => {
            this.clearSelection();
        };
        // private hndCopyPaste = async (_event: Event): Promise<void> => {
        //   // // console.log(_event);
        //   // _event.stopPropagation();
        //   // let target: TreeItem<T> = <TreeItem<T>>_event.target;
        //   // switch (_event.type) {
        //   //   case EVENT_TREE.COPY:
        //   //     this.controller.copyPaste.sources = await this.controller.copy([...this.controller.selection]);
        //   //     break;
        //   //   case EVENT_TREE.PASTE:
        //   //     this.addChildren(this.controller.copyPaste.sources, target.data);
        //   //     break;
        //   //   case EVENT_TREE.CUT:
        //   //     this.controller.copyPaste.sources = await this.controller.copy([...this.controller.selection]);
        //   //     let cut: T[] = this.controller.delete(this.controller.selection);
        //   //     this.delete(cut);
        //   //     break;
        //   // }
        // }
        hndFocus = (_event) => {
            _event.stopPropagation();
            let items = Array.from(this.querySelectorAll("tr"));
            let target = _event.target;
            let index = items.indexOf(target);
            if (index < 0)
                return;
            if (_event.shiftKey && this.controller.selection.length == 0)
                target.select(true);
            switch (_event.type) {
                case "focusNext" /* FOCUS_NEXT */:
                    if (++index < items.length)
                        items[index].focus();
                    break;
                case "focusPrevious" /* FOCUS_PREVIOUS */:
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
    }
    FudgeUserInterface.Table = Table;
    customElements.define("table-sortable", Table, { extends: "table" });
})(FudgeUserInterface || (FudgeUserInterface = {}));
var FudgeUserInterface;
(function (FudgeUserInterface) {
    /**
     * Subclass this to create a broker between your data and a [[Table]] to display and manipulate it.
     * The [[Table]] doesn't know how your data is structured and how to handle it, the controller implements the methods needed
     */
    class TableController {
        /** Stores references to selected objects. Override with a reference in outer scope, if selection should also operate outside of table */
        selection = [];
        /** Stores references to objects being dragged, and objects to drop on. Override with a reference in outer scope, if drag&drop should operate outside of table */
        dragDrop = { sources: [], target: null };
        /** Stores references to objects being dragged, and objects to drop on. Override with a reference in outer scope, if drag&drop should operate outside of table */
        copyPaste = { sources: [], target: null };
    }
    FudgeUserInterface.TableController = TableController;
})(FudgeUserInterface || (FudgeUserInterface = {}));
var FudgeUserInterface;
(function (FudgeUserInterface) {
    var ƒ = FudgeCore;
    /**
     * Extension of tr-element that represents an object in a [[Table]]
     */
    class TableItem extends HTMLTableRowElement {
        data = null;
        controller;
        constructor(_controller, _data) {
            super();
            this.controller = _controller;
            this.data = _data;
            // this.display = this.controller.getLabel(_data);
            // TODO: handle cssClasses
            this.create(this.controller.getHead());
            this.className = "table";
            this.addEventListener("pointerup" /* POINTER_UP */, this.hndPointerUp);
            this.addEventListener("keydown" /* KEY_DOWN */, this.hndKey);
            this.addEventListener("change" /* CHANGE */, this.hndChange);
            // this.addEventListener(EVENT.DOUBLE_CLICK, this.hndDblClick);
            // this.addEventListener(EVENT_TREE.FOCUS_NEXT, this.hndFocus);
            // this.addEventListener(EVENT_TREE.FOCUS_PREVIOUS, this.hndFocus);
            this.draggable = true;
            this.addEventListener("dragstart" /* DRAG_START */, this.hndDragStart);
            this.addEventListener("dragover" /* DRAG_OVER */, this.hndDragOver);
            // this.addEventListener(EVENT.UPDATE, this.hndUpdate);
        }
        /**
         * Returns attaches or detaches the [[CSS_CLASS.SELECTED]] to this item
         */
        set selected(_on) {
            if (_on)
                this.classList.add(FudgeUserInterface.CSS_CLASS.SELECTED);
            else
                this.classList.remove(FudgeUserInterface.CSS_CLASS.SELECTED);
        }
        /**
         * Returns true if the [[TREE_CLASSES.SELECTED]] is attached to this item
         */
        get selected() {
            return this.classList.contains(FudgeUserInterface.CSS_CLASS.SELECTED);
        }
        /**
         * Dispatches the [[EVENT.SELECT]] event
         * @param _additive For multiple selection (+Ctrl)
         * @param _interval For selection over interval (+Shift)
         */
        select(_additive, _interval = false) {
            let event = new CustomEvent("itemselect" /* SELECT */, { bubbles: true, detail: { data: this.data, additive: _additive, interval: _interval } });
            this.dispatchEvent(event);
        }
        create(_filter) {
            for (let entry of _filter) {
                let value = Reflect.get(this.data, entry.key);
                let td = document.createElement("td");
                let input = document.createElement("input");
                input.type = "text";
                input.disabled = !entry.editable;
                input.readOnly = true;
                input.value = value;
                input.setAttribute("key", entry.key);
                input.addEventListener("keydown" /* KEY_DOWN */, this.hndInputEvent);
                input.addEventListener("dblclick" /* DOUBLE_CLICK */, this.hndInputEvent);
                input.addEventListener("focusout" /* FOCUS_OUT */, this.hndChange);
                td.appendChild(input);
                this.appendChild(td);
            }
            this.tabIndex = 0;
        }
        hndInputEvent = (_event) => {
            if (_event instanceof KeyboardEvent && _event.code != ƒ.KEYBOARD_CODE.F2)
                return;
            let input = _event.target;
            input.readOnly = false;
            input.focus();
        };
        hndChange = (_event) => {
            let target = _event.target;
            target.readOnly = true;
            let key = target.getAttribute("key");
            Reflect.set(this.data, key, target.value);
            this.focus();
        };
        hndKey = (_event) => {
            _event.stopPropagation();
            // if (!this.label.disabled)
            //   return;
            // let content: TreeList<T> = <TreeList<T>>this.querySelector("ul");
            switch (_event.code) {
                // case ƒ.KEYBOARD_CODE.ARROW_RIGHT:
                //   this.dispatchEvent(new KeyboardEvent(EVENT.FOCUS_NEXT, { bubbles: true, shiftKey: _event.shiftKey, ctrlKey: _event.ctrlKey }));
                //   break;
                // case ƒ.KEYBOARD_CODE.ARROW_LEFT:
                //   this.dispatchEvent(new KeyboardEvent(EVENT.FOCUS_PREVIOUS, { bubbles: true, shiftKey: _event.shiftKey, ctrlKey: _event.ctrlKey }));
                //   break;
                case ƒ.KEYBOARD_CODE.ARROW_DOWN:
                    this.dispatchEvent(new KeyboardEvent("focusNext" /* FOCUS_NEXT */, { bubbles: true, shiftKey: _event.shiftKey, ctrlKey: _event.ctrlKey }));
                    break;
                case ƒ.KEYBOARD_CODE.ARROW_UP:
                    this.dispatchEvent(new KeyboardEvent("focusPrevious" /* FOCUS_PREVIOUS */, { bubbles: true, shiftKey: _event.shiftKey, ctrlKey: _event.ctrlKey }));
                    break;
                case ƒ.KEYBOARD_CODE.SPACE:
                    this.select(_event.ctrlKey, _event.shiftKey);
                    break;
                case ƒ.KEYBOARD_CODE.ESC:
                    this.dispatchEvent(new Event("escape" /* ESCAPE */, { bubbles: true }));
                    break;
                case ƒ.KEYBOARD_CODE.DELETE:
                    this.dispatchEvent(new Event("delete" /* DELETE */, { bubbles: true }));
                    break;
                case ƒ.KEYBOARD_CODE.C:
                    if (!_event.ctrlKey)
                        break;
                    _event.preventDefault();
                    this.dispatchEvent(new Event("copy" /* COPY */, { bubbles: true }));
                    break;
                case ƒ.KEYBOARD_CODE.V:
                    if (!_event.ctrlKey)
                        break;
                    _event.preventDefault();
                    this.dispatchEvent(new Event("paste" /* PASTE */, { bubbles: true }));
                    break;
                case ƒ.KEYBOARD_CODE.X:
                    if (!_event.ctrlKey)
                        break;
                    _event.preventDefault();
                    this.dispatchEvent(new Event("cut" /* CUT */, { bubbles: true }));
                    break;
            }
        };
        hndDragStart = (_event) => {
            // _event.stopPropagation();
            this.controller.dragDrop.sources = [];
            if (this.selected)
                this.controller.dragDrop.sources = this.controller.selection;
            else
                this.controller.dragDrop.sources = [this.data];
            _event.dataTransfer.effectAllowed = "all";
        };
        hndDragOver = (_event) => {
            // _event.stopPropagation();
            _event.preventDefault();
            this.controller.dragDrop.target = this.data;
            // _event.dataTransfer.dropEffect = "link";
        };
        hndPointerUp = (_event) => {
            _event.stopPropagation();
            this.focus();
            this.select(_event.ctrlKey, _event.shiftKey);
        };
    }
    FudgeUserInterface.TableItem = TableItem;
    customElements.define("table-item", TableItem, { extends: "tr" });
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
         * Expands the tree along the given path to show the objects the path includes
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
                    item.expand(true);
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
                        found.expand(false);
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
                    // item.dispatchEvent(new Event(EVENT.UPDATE, { bubbles: true }));
                    item.dispatchEvent(new Event("removeChild" /* REMOVE_CHILD */, { bubbles: true }));
                    deleted.push(item.parentNode.removeChild(item));
                }
            return deleted;
        }
        findVisible(_data) {
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
    let CSS_CLASS;
    (function (CSS_CLASS) {
        CSS_CLASS["SELECTED"] = "selected";
        CSS_CLASS["INACTIVE"] = "inactive";
    })(CSS_CLASS = FudgeUserInterface.CSS_CLASS || (FudgeUserInterface.CSS_CLASS = {}));
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
        controller;
        constructor(_controller, _root) {
            super([]);
            this.controller = _controller;
            let root = new FudgeUserInterface.TreeItem(this.controller, _root);
            this.appendChild(root);
            this.addEventListener("expand" /* EXPAND */, this.hndExpand);
            this.addEventListener("rename" /* RENAME */, this.hndRename);
            this.addEventListener("itemselect" /* SELECT */, this.hndSelect);
            this.addEventListener("drop" /* DROP */, this.hndDrop, true);
            this.addEventListener("delete" /* DELETE */, this.hndDelete);
            this.addEventListener("escape" /* ESCAPE */, this.hndEscape);
            this.addEventListener("copy" /* COPY */, this.hndCopyPaste);
            this.addEventListener("paste" /* PASTE */, this.hndCopyPaste);
            this.addEventListener("cut" /* CUT */, this.hndCopyPaste);
            // @ts-ignore
            this.addEventListener("focusNext" /* FOCUS_NEXT */, this.hndFocus);
            // @ts-ignore
            this.addEventListener("focusPrevious" /* FOCUS_PREVIOUS */, this.hndFocus);
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
        hndExpand(_event) {
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
            // _event.stopPropagation();
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
            // _event.stopPropagation();
            // console.log(_event.dataTransfer);
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
            let targetItem = this.findVisible(targetData);
            let branch = this.createBranch(this.controller.getChildren(targetData));
            let old = targetItem.getBranch();
            targetItem.hasChildren = true;
            if (old)
                old.restructure(branch);
            else
                targetItem.expand(true);
            _children = [];
            _target = null;
        }
        hndDelete = (_event) => {
            let target = _event.target;
            _event.stopPropagation();
            let remove = this.controller.delete([target.data]);
            this.delete(remove);
        };
        hndEscape = (_event) => {
            this.clearSelection();
        };
        hndCopyPaste = async (_event) => {
            // console.log(_event);
            _event.stopPropagation();
            let target = _event.target;
            switch (_event.type) {
                case "copy" /* COPY */:
                    this.controller.copyPaste.sources = await this.controller.copy([...this.controller.selection]);
                    break;
                case "paste" /* PASTE */:
                    this.addChildren(this.controller.copyPaste.sources, target.data);
                    break;
                case "cut" /* CUT */:
                    this.controller.copyPaste.sources = await this.controller.copy([...this.controller.selection]);
                    let cut = this.controller.delete(this.controller.selection);
                    this.delete(cut);
                    break;
            }
        };
        hndFocus = (_event) => {
            _event.stopPropagation();
            let items = Array.from(this.querySelectorAll("li"));
            let target = _event.target;
            let index = items.indexOf(target);
            if (index < 0)
                return;
            if (_event.shiftKey && this.controller.selection.length == 0)
                target.select(true);
            switch (_event.type) {
                case "focusNext" /* FOCUS_NEXT */:
                    if (++index < items.length)
                        items[index].focus();
                    break;
                case "focusPrevious" /* FOCUS_PREVIOUS */:
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
        /** Stores references to selected objects. Override with a reference in outer scope, if selection should also operate outside of tree */
        selection = [];
        /** Stores references to objects being dragged, and objects to drop on. Override with a reference in outer scope, if drag&drop should operate outside of tree */
        dragDrop = { sources: [], target: null };
        /** Stores references to objects being dragged, and objects to drop on. Override with a reference in outer scope, if drag&drop should operate outside of tree */
        copyPaste = { sources: [], target: null };
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
        display = "TreeItem";
        classes = [];
        data = null;
        controller;
        checkbox;
        label;
        constructor(_controller, _data) {
            super();
            this.controller = _controller;
            this.data = _data;
            this.display = this.controller.getLabel(_data);
            // TODO: handle cssClasses
            this.create();
            this.hasChildren = this.controller.hasChildren(_data);
            this.addEventListener("change" /* CHANGE */, this.hndChange);
            this.addEventListener("dblclick" /* DOUBLE_CLICK */, this.hndDblClick);
            this.addEventListener("focusout" /* FOCUS_OUT */, this.hndFocus);
            this.addEventListener("keydown" /* KEY_DOWN */, this.hndKey);
            // this.addEventListener(EVENT_TREE.FOCUS_NEXT, this.hndFocus);
            // this.addEventListener(EVENT_TREE.FOCUS_PREVIOUS, this.hndFocus);
            this.draggable = true;
            this.addEventListener("dragstart" /* DRAG_START */, this.hndDragStart);
            this.addEventListener("dragover" /* DRAG_OVER */, this.hndDragOver);
            this.addEventListener("pointerup" /* POINTER_UP */, this.hndPointerUp);
            this.addEventListener("removeChild" /* REMOVE_CHILD */, this.hndRemove);
        }
        /**
         * Returns true, when this item has a visible checkbox in front to expand the subsequent branch
         */
        get hasChildren() {
            return this.checkbox.style.visibility != "hidden";
        }
        /**
         * Shows or hides the checkbox for expanding the subsequent branch
         */
        set hasChildren(_has) {
            this.checkbox.style.visibility = _has ? "visible" : "hidden";
        }
        /**
         * Returns attaches or detaches the [[TREE_CLASS.SELECTED]] to this item
         */
        set selected(_on) {
            if (_on)
                this.classList.add(FudgeUserInterface.CSS_CLASS.SELECTED);
            else
                this.classList.remove(FudgeUserInterface.CSS_CLASS.SELECTED);
        }
        /**
         * Returns true if the [[TREE_CLASSES.SELECTED]] is attached to this item
         */
        get selected() {
            return this.classList.contains(FudgeUserInterface.CSS_CLASS.SELECTED);
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
         * Tries to expanding the [[TreeList]] of children, by dispatching [[EVENT.EXPAND]].
         * The user of the tree needs to add an event listener to the tree
         * in order to create that [[TreeList]] and add it as branch to this item
         */
        expand(_expand) {
            this.removeBranch();
            if (_expand)
                this.dispatchEvent(new Event("expand" /* EXPAND */, { bubbles: true }));
            this.querySelector("input[type='checkbox']").checked = _expand;
        }
        /**
         * Returns a list of all data referenced by the items succeeding this
         */
        getVisibleData() {
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
         * Dispatches the [[EVENT.SELECT]] event
         * @param _additive For multiple selection (+Ctrl)
         * @param _interval For selection over interval (+Shift)
         */
        select(_additive, _interval = false) {
            let event = new CustomEvent("itemselect" /* SELECT */, { bubbles: true, detail: { data: this.data, additive: _additive, interval: _interval } });
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
        hndFocus = (_event) => {
            if (_event.target == this.label)
                this.label.disabled = true;
        };
        hndKey = (_event) => {
            _event.stopPropagation();
            if (!this.label.disabled)
                return;
            let content = this.querySelector("ul");
            switch (_event.code) {
                case ƒ.KEYBOARD_CODE.ARROW_RIGHT:
                    if (this.hasChildren && !content)
                        this.expand(true);
                    else
                        this.dispatchEvent(new KeyboardEvent("focusNext" /* FOCUS_NEXT */, { bubbles: true, shiftKey: _event.shiftKey, ctrlKey: _event.ctrlKey }));
                    break;
                case ƒ.KEYBOARD_CODE.ARROW_LEFT:
                    if (content)
                        this.expand(false);
                    else
                        this.dispatchEvent(new KeyboardEvent("focusPrevious" /* FOCUS_PREVIOUS */, { bubbles: true, shiftKey: _event.shiftKey, ctrlKey: _event.ctrlKey }));
                    break;
                case ƒ.KEYBOARD_CODE.ARROW_DOWN:
                    this.dispatchEvent(new KeyboardEvent("focusNext" /* FOCUS_NEXT */, { bubbles: true, shiftKey: _event.shiftKey, ctrlKey: _event.ctrlKey }));
                    break;
                case ƒ.KEYBOARD_CODE.ARROW_UP:
                    this.dispatchEvent(new KeyboardEvent("focusPrevious" /* FOCUS_PREVIOUS */, { bubbles: true, shiftKey: _event.shiftKey, ctrlKey: _event.ctrlKey }));
                    break;
                case ƒ.KEYBOARD_CODE.F2:
                    this.startTypingLabel();
                    break;
                case ƒ.KEYBOARD_CODE.SPACE:
                    this.select(_event.ctrlKey, _event.shiftKey);
                    break;
                case ƒ.KEYBOARD_CODE.ESC:
                    this.dispatchEvent(new Event("escape" /* ESCAPE */, { bubbles: true }));
                    break;
                case ƒ.KEYBOARD_CODE.DELETE:
                    this.dispatchEvent(new Event("delete" /* DELETE */, { bubbles: true }));
                    break;
                case ƒ.KEYBOARD_CODE.C:
                    if (!_event.ctrlKey)
                        break;
                    _event.preventDefault();
                    this.dispatchEvent(new Event("copy" /* COPY */, { bubbles: true }));
                    break;
                case ƒ.KEYBOARD_CODE.V:
                    if (!_event.ctrlKey)
                        break;
                    _event.preventDefault();
                    this.dispatchEvent(new Event("paste" /* PASTE */, { bubbles: true }));
                    break;
                case ƒ.KEYBOARD_CODE.X:
                    if (!_event.ctrlKey)
                        break;
                    _event.preventDefault();
                    this.dispatchEvent(new Event("cut" /* CUT */, { bubbles: true }));
                    break;
            }
        };
        startTypingLabel() {
            this.label.disabled = false;
            this.label.focus();
        }
        hndDblClick = (_event) => {
            _event.stopPropagation();
            if (_event.target != this.checkbox)
                this.startTypingLabel();
        };
        hndChange = (_event) => {
            let target = _event.target;
            let item = target.parentElement;
            _event.stopPropagation();
            switch (target.type) {
                case "checkbox":
                    this.expand(target.checked);
                    break;
                case "text":
                    target.disabled = true;
                    item.focus();
                    target.dispatchEvent(new Event("rename" /* RENAME */, { bubbles: true }));
                    break;
                case "default":
                    // console.log(target);
                    break;
            }
        };
        hndDragStart = (_event) => {
            // _event.stopPropagation();
            if (_event.dataTransfer.getData("dragstart"))
                return;
            this.controller.dragDrop.sources = [];
            if (this.selected)
                this.controller.dragDrop.sources = this.controller.selection;
            else
                this.controller.dragDrop.sources = [this.data];
            _event.dataTransfer.effectAllowed = "all";
            this.controller.dragDrop.target = null;
            // mark as already processed by this tree item to ignore it in further propagation through the tree
            _event.dataTransfer.setData("dragstart", this.label.value);
        };
        hndDragOver = (_event) => {
            // this.controller.hndDragOver(_event);
            if (Reflect.get(_event, "dragoverDone"))
                return;
            Reflect.set(_event, "dragoverDone", true);
            // _event.stopPropagation();
            _event.preventDefault();
            this.controller.dragDrop.target = this.data;
            _event.dataTransfer.dropEffect = "move";
        };
        hndPointerUp = (_event) => {
            _event.stopPropagation();
            if (_event.target == this.checkbox)
                return;
            this.select(_event.ctrlKey, _event.shiftKey);
        };
        hndRemove = (_event) => {
            if (_event.currentTarget == _event.target)
                return;
            _event.stopPropagation();
            this.hasChildren = this.controller.hasChildren(this.data);
        };
    }
    FudgeUserInterface.TreeItem = TreeItem;
    customElements.define("li-tree-item", TreeItem, { extends: "li" });
})(FudgeUserInterface || (FudgeUserInterface = {}));
//# sourceMappingURL=FudgeUserInterface.js.map