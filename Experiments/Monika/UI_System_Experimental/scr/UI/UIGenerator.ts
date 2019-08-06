/// <reference path="../../../../../Core/build/Fudge.d.ts"/>
namespace UI {
    import ƒ = Fudge;

    export class UIGenerator {
<<<<<<< Updated upstream
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
=======
        public static createFromMutator(mutator: ƒ.Mutable, element: HTMLElement) {
            // let mutator: ƒ.Mutator = { people: [{ name: "Lukas", age: 24 }, { name: "Jirka", age: 54 }], cars: [{ brand: "Audi", km: 20000, new: false }, { brand: "VW", km: 100000, new: true }] };
            UIGenerator.generateUI(mutator, element);
        }

        private static generateUI(_obj: ƒ.Mutable, _parent: HTMLElement): void {
            let types: ƒ.MutatorAttributeTypes;
            let mutator:ƒ.Mutator = _obj.getMutator();
            types = _obj.getMutatorAttributeTypes(mutator);
            for (let key in _obj) {
                let value: Object = _obj[key];
                if (value instanceof Object) {
                    let fieldset:HTMLElement = UIGenerator.createFieldset(key, _parent);
                    fieldset.addEventListener("click", UIGenerator.toggleListObj);
                    this.generateUI(<ƒ.Mutable>value, fieldset);
                    _parent.appendChild(fieldset);
                }
                else {
                    switch (typeof value) {
                        case "number":
                            UIGenerator.createLabelElement(key, key, _parent);
                            UIGenerator.createTextElement(key, value, _parent)
                            break;
                        case "boolean":
                            UIGenerator.createLabelElement(key, key, _parent);
                            UIGenerator.createCheckboxElement(key, value, _parent);
                            break;
                        case "string":
                            UIGenerator.createLabelElement(key, key, _parent);
                            UIGenerator.createTextElement(key, value, _parent)
>>>>>>> Stashed changes
                            break;
                        default:
                            break;
                    }
                }
            }
        }
<<<<<<< Updated upstream
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
=======
        public static createFieldset(_legend: string, _parent: HTMLElement, _class?: string): HTMLElement {
            let fieldset: HTMLFieldSetElement = document.createElement("fieldset");
            let legend: HTMLLegendElement = document.createElement("legend");
            legend.innerHTML = _legend;
            fieldset.appendChild(legend);
            legend.classList.add("unfoldable");
            fieldset.classList.add(_class);
            return fieldset;
        }
        public static createLabelElement(_id:string, _value: string, _parent: HTMLElement, _class?: string): HTMLElement {
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
>>>>>>> Stashed changes
            valueInput.id = _id;
            _parent.appendChild(valueInput);
            return valueInput;
        }

<<<<<<< Updated upstream
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
=======
        private static toggleListObj(_event: MouseEvent): void {
            _event.preventDefault();
            if (_event.target != _event.currentTarget) return;
            let target: HTMLElement = <HTMLElement>_event.target;

            let children: HTMLCollection = target.children;

            for (let i = 0; i < children.length; i++) {
                let child: HTMLElement = <HTMLElement>children[i];
                if (!child.classList.contains("unfoldable")) {
                    let childNowVisible: boolean = child.style.display == "none" ? true : false;
                    let displayStyle: string = child.tagName == "FIELDSET" ? "list-item" : "inline";
                    child.style.display = childNowVisible ? displayStyle : "none";
                    childNowVisible ? target.classList.remove("folded") : target.classList.add("folded");
>>>>>>> Stashed changes
                }
            }
        }
    }
}
