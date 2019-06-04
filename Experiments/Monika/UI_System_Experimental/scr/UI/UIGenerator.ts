/// <reference path="../../../../../Core/build/Fudge.d.ts"/>
namespace UI {
    import ƒ = Fudge;

    export class UIGenerator {
        public static createFromMutator(mutable: ƒ.Mutable, element: HTMLElement) {
            let name:string = mutable.constructor.name;
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
                    UIGenerator.createLabelElement(key, key, _parent);
                    UIGenerator.createDropdown(type, value, _parent)
                }
                else {
                    switch (type) {
                        case "Number":
                            UIGenerator.createLabelElement(key, key, _parent);
                            UIGenerator.createTextElement(key, value, _parent)
                            break;
                        case "Boolean":
                            UIGenerator.createLabelElement(key, key, _parent);
                            let enabled:boolean = value == "true" ? true : false;
                            UIGenerator.createCheckboxElement(key, enabled, _parent);
                            break;
                        case "String":
                            UIGenerator.createLabelElement(key, key, _parent);
                            UIGenerator.createTextElement(key, value, _parent)
                            break;
                        default:
                            break;
                    }
                }
            }
        }
        public static createDropdown(_content: Object, _value: string, _parent: HTMLElement, _class?: string) {
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

        public static createFieldset(_legend: string, _parent: HTMLElement, _class?: string): HTMLElement {
            let fieldset: HTMLFieldSetElement = document.createElement("fieldset");
            let legend: HTMLLegendElement = document.createElement("legend");
            legend.innerHTML = _legend;
            let toggleButton:HTMLButtonElement = document.createElement("button");
            toggleButton.addEventListener("click", UIGenerator.toggleFoldElement);
            toggleButton.innerHTML = "v";
            legend.appendChild(toggleButton);
            fieldset.appendChild(legend);
            legend.classList.add("unfoldable");
            fieldset.classList.add(_class);
            _parent.appendChild(fieldset);
            return fieldset;
        }
        
        public static createLabelElement(_id: string, _value: string, _parent: HTMLElement, _class?: string): HTMLElement {
            let label: HTMLElement = document.createElement("label");
            label.innerHTML = _value;
            label.classList.add(_class);
            label.id = _id;
            _parent.appendChild(label);
            return label;
        }

        public static createTextElement(_id: string, _value: string, _parent: HTMLElement, _class?: string): HTMLElement {
            let valueInput: HTMLInputElement = document.createElement("input");
            valueInput.value = _value;
            valueInput.classList.add(_class);
            valueInput.id = _id;
            _parent.appendChild(valueInput);
            return valueInput;
        }

        public static createCheckboxElement(_id: string, _value: boolean, _parent: HTMLElement, _class?: string): HTMLElement {
            let valueInput: HTMLInputElement = document.createElement("input");
            valueInput.type = "checkbox";
            valueInput.checked = _value;
            valueInput.classList.add(_class);
            valueInput.id = _id;
            _parent.appendChild(valueInput);
            return valueInput;
        }

        private static toggleFoldElement(_event: MouseEvent): void {
            _event.preventDefault();
            if (_event.target != _event.currentTarget) return;
            let target: HTMLElement = <HTMLElement>_event.target;
            let foldTarget = target.parentElement.parentElement;
            let foldToggle:Boolean;
            //Toggle the folding behaviour of the Folding Target
            foldTarget.classList.contains("fieldset_folded") ? foldToggle = false : foldToggle = true;
            foldToggle == true ? foldTarget.classList.add("fieldset_folded"):foldTarget.classList.remove("fieldset_folded");
            foldToggle == true ? target.innerHTML=">":target.innerHTML="v";
            let children: HTMLCollection = foldTarget.children;
            
            for (let i = 0; i < children.length; i++) {
                let child: HTMLElement = <HTMLElement>children[i];
                if (!child.classList.contains("unfoldable")) {
                    foldToggle == true ? child.classList.add("folded") : child.classList.remove("folded");
                }
            }
        }
    }
}
