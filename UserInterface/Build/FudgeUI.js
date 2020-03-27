"use strict";
var FudgeUserInterface;
(function (FudgeUserInterface) {
    class ToggleButton extends HTMLButtonElement {
        constructor(style) {
            super();
            this.switchToggleState = (_event) => {
                this.setToggleState(!this.toggleState);
            };
            this.type = "button";
            this.toggleState = true;
            this.classList.add(style);
            this.classList.add("ToggleOn");
            this.addEventListener("click", this.switchToggleState);
        }
        setToggleState(toggleState) {
            this.toggleState = toggleState;
            if (this.toggleState == true) {
                this.classList.add("ToggleOn");
                this.classList.remove("ToggleOff");
            }
            else {
                this.classList.remove("ToggleOn");
                this.classList.add("ToggleOff");
            }
        }
        getToggleState() {
            return this.toggleState;
        }
        toggle() {
            this.setToggleState(!this.toggleState);
        }
    }
    FudgeUserInterface.ToggleButton = ToggleButton;
    class Stepper extends HTMLInputElement {
        constructor(_label, params = {}) {
            super();
            this.name = _label;
            this.type = "number";
            this.value = params.value.toString();
            this.id = _label;
            this.step = String(params.step) || "1";
        }
    }
    FudgeUserInterface.Stepper = Stepper;
    class FoldableFieldSet extends HTMLFieldSetElement {
        constructor(_legend) {
            super();
            this.toggleFoldElement = (_event) => {
                _event.preventDefault();
                if (_event.target != _event.currentTarget)
                    return;
                //Get the fieldset the button belongs to
                let children = this.children;
                //fold or unfold all children that aren't unfoldable
                for (let child of children) {
                    if (!child.classList.contains("unfoldable")) {
                        child.classList.toggle("folded");
                    }
                }
            };
            let cntLegend = document.createElement("legend");
            cntLegend.classList.add("unfoldable");
            let btnFoldButton = new ToggleButton("FoldButton");
            btnFoldButton.addEventListener("click", this.toggleFoldElement);
            // btnfoldButton.classList.add("unfoldable");
            let lblTitle = document.createElement("span");
            lblTitle.textContent = _legend;
            // lblTitle.classList.add("unfoldable");
            cntLegend.appendChild(btnFoldButton);
            cntLegend.appendChild(lblTitle);
            this.appendChild(cntLegend);
        }
    }
    FudgeUserInterface.FoldableFieldSet = FoldableFieldSet;
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
    customElements.define("ui-stepper", Stepper, { extends: "input" });
    customElements.define("ui-toggle-button", ToggleButton, { extends: "button" });
    customElements.define("ui-fold-fieldset", FoldableFieldSet, { extends: "fieldset" });
    customElements.define("ui-dropdown", DropMenu, { extends: "div" });
    customElements.define("ui-dropdown-button", MenuButton, { extends: "div" });
    customElements.define("ui-dropdown-content", MenuContent, { extends: "div" });
})(FudgeUserInterface || (FudgeUserInterface = {}));
/// <reference path="../../../Core/Build/FudgeCore.d.ts"/>
var FudgeUserInterface;
/// <reference path="../../../Core/Build/FudgeCore.d.ts"/>
(function (FudgeUserInterface) {
    var ƒ = FudgeCore;
    class Generator {
        static createFromMutable(_mutable, _element, _name, _mutator) {
            let name = _name || _mutable.constructor.name;
            let mutator = _mutator || _mutable.getMutator();
            let mutatorTypes = _mutable.getMutatorAttributeTypes(mutator);
            let parent = Generator.createFoldableFieldset(name, _element);
            Generator.createFromMutator(mutator, mutatorTypes, parent, _mutable);
        }
        static createFromMutator(_mutator, _mutatorTypes, _parent, _mutable) {
            try {
                for (let key in _mutatorTypes) {
                    let type = _mutatorTypes[key];
                    let value = _mutator[key].toString();
                    if (type instanceof Object) {
                        //Type is Enum
                        Generator.createLabelElement(key, _parent);
                        Generator.createDropdown(key, type, value, _parent);
                    }
                    else {
                        switch (type) {
                            case "Number":
                                Generator.createLabelElement(key, _parent, { _value: key });
                                // Generator.createTextElement(key, _parent, { _value: value })
                                let numValue = parseInt(value);
                                Generator.createStepperElement(key, _parent, { _value: numValue });
                                break;
                            case "Boolean":
                                Generator.createLabelElement(key, _parent, { _value: key });
                                let enabled = value == "true" ? true : false;
                                Generator.createCheckboxElement(key, enabled, _parent);
                                break;
                            case "String":
                                Generator.createLabelElement(key, _parent, { _value: key });
                                Generator.createTextElement(key, _parent, { _value: value });
                                break;
                            // Some other complex subclass of Mutable
                            default:
                                let subMutable;
                                subMutable = _mutable[key];
                                Generator.createFromMutable(subMutable, _parent, key, _mutator[key]);
                                break;
                        }
                    }
                }
            }
            catch (_error) {
                ƒ.Debug.fudge(_error);
            }
        }
        static createDropdown(_id, _content, _value, _parent, _cssClass) {
            let dropdown = document.createElement("select");
            dropdown.id = _id;
            dropdown.name = _id;
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
        static createFieldset(_legend, _parent, _cssClass) {
            let cntfieldset = document.createElement("fieldset");
            cntfieldset.id = _legend;
            let legend = document.createElement("legend");
            legend.innerHTML = _legend;
            cntfieldset.appendChild(legend);
            _parent.appendChild(cntfieldset);
            return cntfieldset;
        }
        static createFoldableFieldset(_legend, _parent) {
            let cntFoldFieldset = new FudgeUserInterface.FoldableFieldSet(_legend);
            cntFoldFieldset.id = _legend;
            _parent.appendChild(cntFoldFieldset);
            return cntFoldFieldset;
        }
        static createLabelElement(_id, _parent, params = {}) {
            let label = document.createElement("label");
            if (params._value == undefined)
                params._value = _id;
            label.innerText = params._value;
            if (!params._cssClass == undefined)
                label.classList.add(params._cssClass);
            label.id = "_" + _id;
            _parent.appendChild(label);
            return label;
        }
        static createTextElement(_id, _parent, params = {}) {
            let valueInput = document.createElement("input");
            if (params._value == undefined)
                params._value = "";
            if (!params._cssClass == undefined)
                valueInput.classList.add(params._cssClass);
            valueInput.id = _id;
            valueInput.name = _id;
            valueInput.value = params._value;
            _parent.appendChild(valueInput);
            return valueInput;
        }
        static createCheckboxElement(_id, _value, _parent, _cssClass) {
            let valueInput = document.createElement("input");
            valueInput.type = "checkbox";
            valueInput.checked = _value;
            valueInput.classList.add(_cssClass);
            valueInput.name = _id;
            valueInput.id = _id;
            _parent.appendChild(valueInput);
            return valueInput;
        }
        static createStepperElement(_id, _parent, params = {}) {
            if (params._value == undefined)
                params._value = 0;
            let stepper = new FudgeUserInterface.Stepper(_id, { value: params._value });
            _parent.appendChild(stepper);
            return stepper;
        }
    }
    FudgeUserInterface.Generator = Generator;
})(FudgeUserInterface || (FudgeUserInterface = {}));
var FudgeUserInterface;
(function (FudgeUserInterface) {
    // export abstract class ListController {
    //     abstract listRoot: HTMLElement;
    //     protected abstract toggleCollapse(_event: MouseEvent): void;
    // }
    class CollapsableListElement extends HTMLUListElement {
        constructor() {
            super();
            this.header = document.createElement("li");
            this.content = document.createElement("ul");
            this.appendChild(this.header);
            this.appendChild(this.content);
        }
        collapse(element) {
            element.content.classList.toggle("folded");
        }
    }
    class CollapsableNodeListElement extends CollapsableListElement {
        constructor(_node, _name, _unfolded = false) {
            super();
            this.selectNode = (_event) => {
                let event = new CustomEvent("select" /* SELECT */, { bubbles: true, detail: this.node });
                this.dispatchEvent(event);
            };
            this.collapseEvent = (_event) => {
                let event = new CustomEvent("collapse" /* COLLAPSE */, { bubbles: true, detail: this });
                this.dispatchEvent(event);
            };
            this.node = _node;
            let buttonState;
            if (this.node.getChildren().length != 0)
                buttonState = "FoldButton";
            else
                buttonState = "invisible";
            let btnToggle = new FudgeUserInterface.ToggleButton(buttonState);
            btnToggle.setToggleState(_unfolded);
            btnToggle.addEventListener("click", this.collapseEvent);
            this.header.appendChild(btnToggle);
            let lblName = document.createElement("span");
            lblName.textContent = _name;
            lblName.addEventListener("click", this.selectNode);
            this.header.appendChild(lblName);
        }
    }
    FudgeUserInterface.CollapsableNodeListElement = CollapsableNodeListElement;
    class CollapsableAnimationListElement extends CollapsableListElement {
        constructor(_mutator, _name, _unfolded = false) {
            super();
            this.collapseEvent = (_event) => {
                let event = new CustomEvent("collapse" /* COLLAPSE */, { bubbles: true, detail: this });
                this.dispatchEvent(event);
            };
            this.updateMutator = (_event) => {
                let target = _event.target;
                this.mutator[target.id] = parseFloat(target.value);
                _event.cancelBubble = true;
                let event = new CustomEvent("update" /* UPDATE */, { bubbles: true, detail: this.mutator });
                this.dispatchEvent(event);
            };
            this.mutator = _mutator;
            this.name = _name;
            this.index = {};
            let btnToggle = new FudgeUserInterface.ToggleButton("FoldButton");
            btnToggle.setToggleState(_unfolded);
            btnToggle.addEventListener("click", this.collapseEvent);
            this.header.appendChild(btnToggle);
            let lblName = document.createElement("span");
            lblName.textContent = _name;
            this.header.appendChild(lblName);
            this.buildContent(_mutator);
            this.content.addEventListener("input", this.updateMutator);
        }
        buildContent(_mutator) {
            for (let key in _mutator) {
                if (typeof _mutator[key] == "object") {
                    let newList = new CollapsableAnimationListElement(_mutator[key], key);
                    this.content.append(newList);
                    this.index[key] = newList.getElementIndex();
                }
                else {
                    let listEntry = document.createElement("li");
                    FudgeUserInterface.Generator.createLabelElement(key, listEntry);
                    let inputEntry = FudgeUserInterface.Generator.createStepperElement(key, listEntry, { _value: _mutator[key] });
                    this.content.append(listEntry);
                    this.index[key] = inputEntry;
                }
            }
        }
        getMutator() {
            return this.mutator;
        }
        setMutator(_mutator) {
            this.collapse(this.content);
            this.mutator = _mutator;
            this.buildContent(_mutator);
        }
        getElementIndex() {
            return this.index;
        }
    }
    FudgeUserInterface.CollapsableAnimationListElement = CollapsableAnimationListElement;
    customElements.define("ui-node-list", CollapsableNodeListElement, { extends: "ul" });
    customElements.define("ui-animation-list", CollapsableAnimationListElement, { extends: "ul" });
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
// / <reference types="../../../Core/Build/FudgeCore"/>
var FudgeUserInterface;
// / <reference types="../../../Core/Build/FudgeCore"/>
(function (FudgeUserInterface) {
    class Mutable {
        constructor(mutable) {
            this.timeUpdate = 190;
            this.mutateOnInput = (_e) => {
                this.mutator = this.updateMutator(this.mutable, this.root);
                this.mutable.mutate(this.mutator);
            };
            this.refresh = (_e) => {
                this.mutable.updateMutator(this.mutator);
                this.update(this.mutable, this.root);
            };
            this.root = document.createElement("div");
            this.mutable = mutable;
            this.mutator = mutable.getMutator();
            window.setInterval(this.refresh, this.timeUpdate);
            this.root.addEventListener("input", this.mutateOnInput);
        }
        updateMutator(_mutable, _root, _mutator, _types) {
            let mutator = _mutator || _mutable.getMutator();
            let mutatorTypes = _types || _mutable.getMutatorAttributeTypes(mutator);
            for (let key in mutator) {
                if (this.root.querySelector("#" + key) != null) {
                    let type = mutatorTypes[key];
                    if (type instanceof Object) {
                        let selectElement = _root.querySelector("#" + key);
                        selectElement.value = mutator[key];
                    }
                    else {
                        let element = _root.querySelector("#" + key);
                        let input = element;
                        switch (type) {
                            case "Boolean":
                                mutator[key] = input.checked;
                                break;
                            case "String":
                            case "Number":
                                mutator[key] = input.value;
                                break;
                            default:
                                let subMutator = mutator[key];
                                let subMutable;
                                subMutable = _mutable[key];
                                let subTypes = subMutable.getMutatorAttributeTypes(subMutator);
                                mutator[key] = this.updateMutator(subMutable, element, subMutator, subTypes);
                                break;
                        }
                    }
                }
            }
            return mutator;
        }
        update(_mutable, _root) {
            let mutator = _mutable.getMutator();
            let mutatorTypes = _mutable.getMutatorAttributeTypes(mutator);
            for (let key in mutator) {
                if (this.root.querySelector("#" + key) != null) {
                    let type = mutatorTypes[key];
                    if (type instanceof Object) {
                        let selectElement = _root.querySelector("#" + key);
                        selectElement.value = mutator[key];
                    }
                    else {
                        switch (type) {
                            case "Boolean":
                                let checkbox = _root.querySelector("#" + key);
                                checkbox.checked = mutator[key];
                                break;
                            case "String":
                                let textfield = _root.querySelector("#" + key);
                                textfield.value = mutator[key];
                                break;
                            case "Number":
                                let stepper = _root.querySelector("#" + key);
                                if (document.activeElement != stepper) {
                                    stepper.value = mutator[key];
                                }
                                break;
                            default:
                                let fieldset = _root.querySelector("#" + key);
                                let subMutable = Reflect.getOwnPropertyDescriptor(_mutable, key).value;
                                this.update(subMutable, fieldset);
                                break;
                        }
                    }
                }
            }
        }
    }
    FudgeUserInterface.Mutable = Mutable;
})(FudgeUserInterface || (FudgeUserInterface = {}));
//# sourceMappingURL=FudgeUI.js.map