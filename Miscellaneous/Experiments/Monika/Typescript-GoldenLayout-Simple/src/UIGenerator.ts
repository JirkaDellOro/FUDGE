/// <reference path="../../../../Core/build/Fudge.d.ts"/>
namespace GoldenLayoutTest {
    import ƒ = FudgeCore;

    export class UIGenerator {
        public static createFromMutator(mutator: ƒ.Mutator, element: HTMLElement) {
            // let mutator: ƒ.Mutator = { people: [{ name: "Lukas", age: 24 }, { name: "Jirka", age: 54 }], cars: [{ brand: "Audi", km: 20000, new: false }, { brand: "VW", km: 100000, new: true }] };
            UIGenerator.generateUI(mutator, element);
        }

        private static generateUI(_obj: ƒ.Mutator, _parent: HTMLElement): void {
<<<<<<< Updated upstream
            
=======
            _obj.constructor.name;
>>>>>>> Stashed changes
            for (let key in _obj) {
                let value: Object = _obj[key];
                if (value instanceof Object) {
                    let fieldset:HTMLElement = UIGenerator.createFieldset(key, _parent);
                    fieldset.addEventListener("click", UIGenerator.toggleListObj);
                    this.generateUI(<ƒ.Mutator>value, fieldset);
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
                            break;
                        default:
                            break;
                    }
                }
            }
        }
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
            valueInput.id = _id;
            _parent.appendChild(valueInput);
            return valueInput;
        }

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
                }
            }
        }
    }
}
