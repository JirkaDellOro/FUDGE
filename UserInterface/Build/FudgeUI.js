"use strict";
var Fudge_UserInterface;
(function (Fudge_UserInterface) {
    /**
     * <select><option>Hallo</option></select>
     */
    class FoldableFieldSet extends HTMLFieldSetElement {
        constructor(_legend) {
            super();
            this.toggleFoldElement = (_event) => {
                _event.preventDefault();
                if (_event.target != _event.currentTarget)
                    return;
                let target = _event.target;
                //Get the fieldset the button belongs to
                let foldTarget = target.parentElement.parentElement;
                //Toggle the folding behaviour of the Folding Target
                foldTarget.classList.toggle("foldButton_folded");
                foldTarget.classList.toggle("foldButton_unfolded");
                let children = foldTarget.children;
                //fold or unfold all children that aren't unfoldable
                for (let child of children) {
                    if (!child.classList.contains("unfoldable")) {
                        child.classList.toggle("folded");
                    }
                }
            };
            let cntLegend = document.createElement("legend");
            let btnfoldButton = document.createElement("button");
            btnfoldButton.classList.add("foldButton_unfolded");
            btnfoldButton.addEventListener("click", this.toggleFoldElement);
            let lblTitle = document.createElement("span");
            lblTitle.textContent = _legend;
            cntLegend.appendChild(btnfoldButton);
            cntLegend.appendChild(lblTitle);
            this.appendChild(cntLegend);
        }
    }
    Fudge_UserInterface.FoldableFieldSet = FoldableFieldSet;
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
    Fudge_UserInterface.Stepper = Stepper;
    customElements.define("ui-stepper", Stepper, { extends: "input" });
    customElements.define("ui-fold-fieldset", FoldableFieldSet, { extends: "fieldset" });
})(Fudge_UserInterface || (Fudge_UserInterface = {}));
/// <reference path="../../../Core/build/Fudge.d.ts"/>
/// <reference path="../UIElements/UIElements.ts"/>
var Fudge_UserInterface;
/// <reference path="../../../Core/build/Fudge.d.ts"/>
/// <reference path="../UIElements/UIElements.ts"/>
(function (Fudge_UserInterface) {
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
            let cntFoldFieldset = new Fudge_UserInterface.FoldableFieldSet(_legend);
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
            let stepper = new Fudge_UserInterface.Stepper(_id, { value: params._value });
            _parent.appendChild(stepper);
            return stepper;
        }
    }
    Fudge_UserInterface.UIGenerator = UIGenerator;
})(Fudge_UserInterface || (Fudge_UserInterface = {}));
/// <reference path="../../../Core/build/Fudge.d.ts"/>
var Fudge_UserInterface;
/// <reference path="../../../Core/build/Fudge.d.ts"/>
(function (Fudge_UserInterface) {
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
    Fudge_UserInterface.UIMutable = UIMutable;
})(Fudge_UserInterface || (Fudge_UserInterface = {}));
//# sourceMappingURL=FudgeUI.js.map