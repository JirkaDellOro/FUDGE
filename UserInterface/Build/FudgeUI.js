"use strict";
var Fudge;
(function (Fudge) {
    let UserInterface;
    (function (UserInterface) {
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
        UserInterface.FoldableFieldSet = FoldableFieldSet;
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
        UserInterface.Stepper = Stepper;
        customElements.define("ui-stepper", Stepper, { extends: "span" });
    })(UserInterface = Fudge.UserInterface || (Fudge.UserInterface = {}));
})(Fudge || (Fudge = {}));
/// <reference path="../../../Core/build/Fudge.d.ts"/>
/// <reference path="../UIElements/UIElements.ts"/>
var Fudge;
/// <reference path="../../../Core/build/Fudge.d.ts"/>
/// <reference path="../UIElements/UIElements.ts"/>
(function (Fudge) {
    let UserInterface;
    (function (UserInterface) {
        class UIGenerator {
            static createFromMutable(_mutable, _element) {
                let name = _mutable.constructor.name;
                let _types;
                let mutator = _mutable.getMutator();
                let _parent = UIGenerator.createFieldset(name, _element);
                _types = _mutable.getMutatorAttributeTypes(mutator);
                for (let key in _types) {
                    let type = _types[key];
                    let value = mutator[key].toString();
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
                                let num_value = parseInt(value);
                                UIGenerator.createStepperElement(key, _parent, { _value: num_value, _mutable: _mutable });
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
                                this.createFromMutable(subMutable, _parent);
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
                let legend = document.createElement("legend");
                legend.innerHTML = _legend;
                cntfieldset.appendChild(legend);
                _parent.appendChild(cntfieldset);
                return cntfieldset;
            }
            static createFoldableFieldset(_legend, _parent) {
                let cntFoldFieldset = new UserInterface.FoldableFieldSet(_legend);
                _parent.appendChild(cntFoldFieldset);
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
                let stepper = new UserInterface.Stepper(_id, { value: params._value });
                _parent.appendChild(stepper);
                return stepper;
            }
        }
        UserInterface.UIGenerator = UIGenerator;
    })(UserInterface = Fudge.UserInterface || (Fudge.UserInterface = {}));
})(Fudge || (Fudge = {}));
/// <reference path="../../../Core/build/Fudge.d.ts"/>
var Fudge;
/// <reference path="../../../Core/build/Fudge.d.ts"/>
(function (Fudge) {
    let UserInterface;
    (function (UserInterface) {
        class MutableUI {
            constructor(_mutable) {
                this.timeUpdate = 190;
                this.updateUI = (_e) => {
                    let formData = new FormData(this.root);
                    let mutatorTypes = this.mutable.getMutatorAttributeTypes(this.mutator);
                    for (let key in this.mutator) {
                        let value = this.mutator[key].toString();
                        let type = mutatorTypes[key].toString();
                        switch (type) {
                            case "Boolean":
                                if (!formData.get(key))
                                    this.mutator[key] = false;
                                else
                                    this.mutator[key] = true;
                                break;
                            default:
                                if (formData.get(key) != value)
                                    this.mutator[key] = formData.get(key);
                                break;
                            // case "Number":
                            //     if(formData.get(key) != value)
                            //         this.mutator[key] = formData.get(key);
                            //     break;
                            // case "String":
                            //     break;
                            // case "Object":
                            //     break;
                        }
                    }
                    this.mutable.mutate(this.mutator);
                };
                this.updateMutator = (_e) => {
                    this.mutable.updateMutator(this.mutator);
                    this.fillById(this.mutator, this.root);
                };
                this.root = document.createElement("form");
                this.mutable = _mutable;
                this.mutator = _mutable.getMutator();
                window.setInterval(this.updateMutator, this.timeUpdate);
                this.root.addEventListener("input", this.updateUI);
            }
            fillById(_mutator, _root) {
            }
        }
        UserInterface.MutableUI = MutableUI;
    })(UserInterface = Fudge.UserInterface || (Fudge.UserInterface = {}));
})(Fudge || (Fudge = {}));
//# sourceMappingURL=FudgeUI.js.map