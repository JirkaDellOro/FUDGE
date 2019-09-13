"use strict";
/// <reference types="../../../Core/Build/FudgeCore"/>
var FudgeUserInterface;
/// <reference types="../../../Core/Build/FudgeCore"/>
(function (FudgeUserInterface) {
    class CollapsableListElement extends HTMLUListElement {
        constructor(_node, _name, _unfolded = false) {
            super();
            this.selectNode = (_event) => {
                let event = new CustomEvent("nodeSelect" /* SELECTION */, { bubbles: true, detail: this.node });
                this.dispatchEvent(event);
            };
            this.node = _node;
            let cntHeader = document.createElement("li");
            let buttonState;
            if (this.node.getChildren().length != 0)
                buttonState = "FoldButton";
            else
                buttonState = "invisible";
            let btnToggle = new FudgeUserInterface.ToggleButton(buttonState);
            btnToggle.setToggleState(_unfolded);
            cntHeader.appendChild(btnToggle);
            let lblName = document.createElement("span");
            lblName.textContent = _name;
            lblName.addEventListener("click", this.selectNode);
            cntHeader.appendChild(lblName);
            this.appendChild(cntHeader);
            this.header = cntHeader;
        }
        collapse(_event) {
            while (this.lastChild != this.firstChild) {
                if (this.lastChild != this.header) {
                    this.removeChild(this.lastChild);
                }
            }
        }
    }
    class UINodeList {
        constructor(_node, _listContainer) {
            this.toggleCollapse = (_event) => {
                _event.preventDefault();
                let target = _event.target;
                if (target.nodeName == "BUTTON") {
                    let targetParent = target.parentElement.parentElement;
                    if (targetParent.children.length > 1)
                        targetParent.collapse(_event);
                    else {
                        let nodeToExpand = targetParent.node;
                        let newList = this.BuildListFromNode(nodeToExpand);
                        targetParent.replaceWith(newList);
                    }
                }
            };
            this.listRoot = document.createElement("ul");
            let rootElement = this.BuildListFromNode(_node);
            this.listRoot.appendChild(rootElement);
            _listContainer.appendChild(this.listRoot);
            this.listRoot.addEventListener("click", this.toggleCollapse);
        }
        BuildListFromNode(_node) {
            let listRoot = new CollapsableListElement(_node, _node.name, true);
            let nodeChildren = _node.getChildren();
            for (let child of nodeChildren) {
                let hasChildren = (child.getChildren().length != 0 ? true : false);
                let listItem = new CollapsableListElement(child, child.name, hasChildren);
                listRoot.appendChild(listItem);
            }
            return listRoot;
        }
    }
    FudgeUserInterface.UINodeList = UINodeList;
    customElements.define("ui-collapse-list", CollapsableListElement, { extends: "ul" });
})(FudgeUserInterface || (FudgeUserInterface = {}));
var FudgeUserInterface;
(function (FudgeUserInterface) {
    /**
     * <select><option>Hallo</option></select>
     */
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
    customElements.define("ui-stepper", Stepper, { extends: "input" });
    customElements.define("ui-toggle-button", ToggleButton, { extends: "button" });
    customElements.define("ui-fold-fieldset", FoldableFieldSet, { extends: "fieldset" });
})(FudgeUserInterface || (FudgeUserInterface = {}));
/// <reference types="../../../Core/Build/FudgeCore"/>
var FudgeUserInterface;
/// <reference types="../../../Core/Build/FudgeCore"/>
(function (FudgeUserInterface) {
    class NodeSelectionEvent extends Event {
        constructor(_type, _event) {
            super(_type, _event);
            this.targetNode = _event.target;
        }
    }
    FudgeUserInterface.NodeSelectionEvent = NodeSelectionEvent;
})(FudgeUserInterface || (FudgeUserInterface = {}));
/// <reference types="../../../Core/Build/FudgeCore"/>
var FudgeUserInterface;
/// <reference types="../../../Core/Build/FudgeCore"/>
(function (FudgeUserInterface) {
    class UIGenerator {
        static createFromMutable(_mutable, _element, _name) {
            let name = _name || _mutable.constructor.name;
            let mutatorTypes;
            let mutator = _mutable.getMutator();
            let parent = UIGenerator.createFoldableFieldset(name, _element);
            mutatorTypes = _mutable.getMutatorAttributeTypes(mutator);
            UIGenerator.createFromMutator(mutator, mutatorTypes, parent, _mutable);
        }
        static createFromMutator(_mutator, _mutatorTypes, _parent, _mutable) {
            for (let key in _mutatorTypes) {
                let type = _mutatorTypes[key];
                let value = _mutator[key].toString();
                if (type instanceof Object) {
                    //Type is Enum
                    UIGenerator.createLabelElement(key, _parent);
                    UIGenerator.createDropdown(key, type, value, _parent);
                }
                else {
                    switch (type) {
                        case "Number":
                            UIGenerator.createLabelElement(key, _parent, { _value: key });
                            // UIGenerator.createTextElement(key, _parent, { _value: value })
                            let numValue = parseInt(value);
                            UIGenerator.createStepperElement(key, _parent, { _value: numValue, _mutable: _mutable });
                            break;
                        case "Boolean":
                            UIGenerator.createLabelElement(key, _parent, { _value: key });
                            let enabled = value == "true" ? true : false;
                            UIGenerator.createCheckboxElement(key, enabled, _parent);
                            break;
                        case "String":
                            UIGenerator.createLabelElement(key, _parent, { _value: key });
                            UIGenerator.createTextElement(key, _parent, { _value: value });
                            break;
                        case "Object":
                            let subMutable = _mutable[key];
                            UIGenerator.createFromMutable(subMutable, _parent, key);
                        default:
                            break;
                    }
                }
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
    FudgeUserInterface.UIGenerator = UIGenerator;
})(FudgeUserInterface || (FudgeUserInterface = {}));
/// <reference types="../../../Core/Build/FudgeCore"/>
var FudgeUserInterface;
/// <reference types="../../../Core/Build/FudgeCore"/>
(function (FudgeUserInterface) {
    class UIMutable {
        constructor(mutable) {
            this.timeUpdate = 190;
            this.mutateOnInput = (_e) => {
                this.mutator = this.updateMutator(this.mutable, this.root);
                this.mutable.mutate(this.mutator);
            };
            this.refreshUI = (_e) => {
                this.mutable.updateMutator(this.mutator);
                this.updateUI(this.mutable, this.root);
            };
            this.root = document.createElement("div");
            this.mutable = mutable;
            this.mutator = mutable.getMutator();
            window.setInterval(this.refreshUI, this.timeUpdate);
            this.root.addEventListener("input", this.mutateOnInput);
        }
        updateMutator(_mutable, _root) {
            let mutator = _mutable.getMutator();
            let mutatorTypes = _mutable.getMutatorAttributeTypes(mutator);
            for (let key in mutator) {
                console.log(this.root.querySelector("#" + key));
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
                            case "Object":
                                let subMutable = _mutable[key];
                                mutator[key] = this.updateMutator(subMutable, element);
                                break;
                        }
                    }
                }
            }
            return mutator;
        }
        updateUI(_mutable, _root) {
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
                                stepper.value = mutator[key];
                                break;
                            case "Object":
                                let fieldset = _root.querySelector("#" + key);
                                let subMutable = _mutable[key];
                                this.updateUI(subMutable, fieldset);
                                break;
                        }
                    }
                }
            }
        }
    }
    FudgeUserInterface.UIMutable = UIMutable;
})(FudgeUserInterface || (FudgeUserInterface = {}));
//# sourceMappingURL=FudgeUI.js.map