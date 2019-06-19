/// <reference path="../../../../../Core/build/Fudge.d.ts"/>
namespace UI {
    import ƒ = Fudge;

    export class UIGenerator {
        public static createFromMutator(mutable: ƒ.Mutable, element: HTMLElement) {
            let name: string = mutable.constructor.name;
            let types: ƒ.MutatorAttributeTypes;
            let mutator: ƒ.Mutator = mutable.getMutator();
            let fieldset = UIGenerator.createFieldset(name, element);

            types = mutable.getMutatorAttributeTypes(mutator);
            UIGenerator.generateUI(mutator, types, fieldset);
        }

        private static generateUI(_obj: ƒ.Mutator, _types: ƒ.MutatorAttributeTypes, _parent: HTMLElement): void {
            for (let key in _types) {
                let type: Object = _types[key];
                let value: string = _obj[key].toString();
                if (type instanceof Object) {
                    //Type is Enum
                    UIGenerator.createLabelElement(key, _parent);
                    UIGenerator.createDropdown(type, value, _parent)
                }
                else {
                    switch (type) {
                        case "Number":
                            UIGenerator.createLabelElement(key, _parent, { _value: key });
                            // UIGenerator.createTextElement(key, _parent, { _value: value })
                            let num_value: number = parseInt(value);
                            UIGenerator.createStepperElement(key, _parent, { _value: num_value });
                            break;
                        case "Boolean":
                            UIGenerator.createLabelElement(key, _parent, { _value: key });
                            let enabled: boolean = value == "true" ? true : false;
                            UIGenerator.createCheckboxElement(key, enabled, _parent);
                            break;
                        case "String":
                            UIGenerator.createLabelElement(key, _parent, { _value: key });
                            UIGenerator.createTextElement(key, _parent, { _value: value })
                            break;
                        default:
                            break;
                    }
                }
            }
        }
        public static createDropdown(_content: Object, _value: string, _parent: HTMLElement, _cssClass?: string) {
            let dropdown: HTMLSelectElement = document.createElement("select");
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

        public static createFieldset(_legend: string, _parent: HTMLElement, _cssClass?: string): HTMLElement {
            let fieldset: HTMLFieldSetElement = document.createElement("fieldset");
            let legend: HTMLLegendElement = document.createElement("legend");
            legend.innerHTML = _legend;
            let toggleButton: HTMLButtonElement = document.createElement("button");
            toggleButton.addEventListener("click", UIGenerator.toggleFoldElement);
            toggleButton.innerHTML = "v";
            legend.appendChild(toggleButton);
            fieldset.appendChild(legend);
            legend.classList.add("unfoldable");
            if (!_cssClass == undefined) {

                fieldset.classList.add(_cssClass);
            }
            _parent.appendChild(fieldset);
            return fieldset;
        }

        public static createLabelElement(_id: string, _parent: HTMLElement, params: { _value?: string, _cssClass?: string } = {}): HTMLElement {
            let label: HTMLElement = document.createElement("label");
            if (params._value == undefined)
                params._value = _id;
            label.innerText = params._value;
            if (!params._cssClass == undefined)
                label.classList.add(params._cssClass);
            label.id = _id;
            _parent.appendChild(label);

            return label;
        }

        public static createTextElement(_id: string, _parent: HTMLElement, params: { _value?: string, _cssClass?: string } = {}): HTMLElement {
            let valueInput: HTMLInputElement = document.createElement("input");
            if (params._value == undefined)
                params._value = "";
            if (!params._cssClass == undefined)
                valueInput.classList.add(params._cssClass);
            valueInput.id = _id;
            valueInput.value = params._value;
            _parent.appendChild(valueInput);

            return valueInput;
        }

        public static createCheckboxElement(_id: string, _value: boolean, _parent: HTMLElement, _cssClass?: string): HTMLElement {
            let valueInput: HTMLInputElement = document.createElement("input");
            valueInput.type = "checkbox";
            valueInput.checked = _value;
            valueInput.classList.add(_cssClass);
            valueInput.id = _id;
            _parent.appendChild(valueInput);
            return valueInput;
        }

        public static createStepperElement(_id: string, _parent: HTMLElement, params: { _value?: number, _min?: number, _max?: number, _cssClass?: string } = {}) {

            if (params._value == undefined)
                params._value = 0;
            let stepper: UI.Stepper = new Stepper(_id, { value: params._value });
            _parent.append(stepper);
            return stepper;
        }

        private static toggleFoldElement(_event: MouseEvent): void {
            _event.preventDefault();
            if (_event.target != _event.currentTarget) return;
            let target: HTMLElement = <HTMLElement>_event.target;
            let foldTarget = target.parentElement.parentElement;
            let foldToggle: Boolean;
            //Toggle the folding behaviour of the Folding Target
            foldTarget.classList.contains("fieldset_folded") ? foldToggle = false : foldToggle = true;
            foldToggle == true ? foldTarget.classList.add("fieldset_folded") : foldTarget.classList.remove("fieldset_folded");
            foldToggle == true ? target.innerHTML = ">" : target.innerHTML = "v";
            let children: HTMLCollection = foldTarget.children;

            // for (let i = 0; i < children.length; i++) {
            for (let child of children) {
                // let child: HTMLElement = <HTMLElement>children[i];
                if (!child.classList.contains("unfoldable")) {
                    foldToggle == true ? child.classList.add("folded") : child.classList.remove("folded");
                }
            }
        }
    }
}
