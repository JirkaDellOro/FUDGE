/// <reference path="../../../Core/build/Fudge.d.ts"/>
/// <reference path="../UIElements/UIElements.ts"/>
namespace Fudge {
    export namespace UserInterface {
        import ƒ = Fudge;

        export class UIGenerator {
            public static createFromMutable(_mutable: ƒ.Mutable, _element: HTMLElement, _name?: string): void {
                let name: string = _name || _mutable.constructor.name;
                let _types: ƒ.MutatorAttributeTypes;
                let mutator: ƒ.Mutator = _mutable.getMutator();
                let _parent: HTMLElement = UIGenerator.createFoldableFieldset(name, _element);
                _types = _mutable.getMutatorAttributeTypes(mutator);
                for (let key in _types) {
                    let type: Object = _types[key];
                    let value: string = mutator[key].toString();
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
                                let numValue: number = parseInt(value);
                                UIGenerator.createStepperElement(key, _parent, { _value: numValue, _mutable: _mutable });
                                break;
                            case "Boolean":
                                UIGenerator.createLabelElement(key, _parent, { _value: key });
                                let enabled: boolean = value == "true" ? true : false;
                                UIGenerator.createCheckboxElement(key, enabled, _parent);
                                break;
                            case "String":
                                UIGenerator.createLabelElement(key, _parent, { _value: key });
                                UIGenerator.createTextElement(key, _parent, { _value: value });
                                break;
                            case "Object":
                                let subMutable: ƒ.Mutable = (<any>_mutable)[key];
                                this.createFromMutable(subMutable, _parent, key);
                            default:
                                break;
                        }
                    }
                }
            }

            public static createDropdown(_id: string, _content: Object, _value: string, _parent: HTMLElement, _cssClass?: string): HTMLSelectElement {
                let dropdown: HTMLSelectElement = document.createElement("select");
                dropdown.id = _id;
                dropdown.name = _id;
                for (let value in _content) {
                    let entry: HTMLOptionElement = document.createElement("option");
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

            public static createFieldset(_legend: string, _parent: HTMLElement, _cssClass?: string): HTMLFieldSetElement {
                let cntfieldset: HTMLFieldSetElement = document.createElement("fieldset");
                cntfieldset.id = _legend;
                let legend: HTMLLegendElement = document.createElement("legend");
                legend.innerHTML = _legend;
                cntfieldset.appendChild(legend);
                _parent.appendChild(cntfieldset);
                return cntfieldset;
            }

            public static createFoldableFieldset(_legend: string, _parent: HTMLElement): HTMLFieldSetElement {
                let cntFoldFieldset: HTMLFieldSetElement = new UserInterface.FoldableFieldSet(_legend);
                cntFoldFieldset.id = _legend;
                _parent.appendChild(cntFoldFieldset);
                return cntFoldFieldset;
            }

            public static createLabelElement(_id: string, _parent: HTMLElement, params: { _value?: string, _cssClass?: string } = {}): HTMLElement {
                let label: HTMLElement = document.createElement("label");
                if (params._value == undefined)
                    params._value = _id;
                label.innerText = params._value;
                if (!params._cssClass == undefined)
                    label.classList.add(params._cssClass);
                label.id = "_" + _id;
                _parent.appendChild(label);

                return label;
            }

            public static createTextElement(_id: string, _parent: HTMLElement, params: { _value?: string, _cssClass?: string } = {}): HTMLInputElement {
                let valueInput: HTMLInputElement = document.createElement("input");
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

            public static createCheckboxElement(_id: string, _value: boolean, _parent: HTMLElement, _cssClass?: string): HTMLInputElement {
                let valueInput: HTMLInputElement = document.createElement("input");
                valueInput.type = "checkbox";
                valueInput.checked = _value;
                valueInput.classList.add(_cssClass);
                valueInput.name = _id;
                valueInput.id = _id;
                _parent.appendChild(valueInput);
                return valueInput;
            }

            public static createStepperElement(_id: string, _parent: HTMLElement, params: { _value?: number, _min?: number, _max?: number, _cssClass?: string, _mutable?: ƒ.Mutable } = {}): HTMLSpanElement {

                if (params._value == undefined)
                    params._value = 0;
                let stepper: HTMLInputElement = new UserInterface.Stepper(_id, { value: params._value });
                _parent.appendChild(stepper);
                return stepper;
            }


        }
    }
}

