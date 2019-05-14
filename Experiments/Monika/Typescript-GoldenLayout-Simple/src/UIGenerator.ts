/// <reference path="../../../../Core/build/Fudge.d.ts"/>
namespace GoldenLayoutTest {
    import ƒ = Fudge;
    export class UIGenerator {
        public static createFromMutator(mutator: ƒ.Mutator, element: HTMLElement) {
            UIGenerator.generateUI(mutator, element);
        }

        private static generateUI(_obj: ƒ.Mutator, _parent: HTMLElement): void {
            for (let key in _obj) {
                let value: Object = _obj[key];
                if (value instanceof Object) {
                    let fieldset: HTMLFieldSetElement = document.createElement("fieldset");
                    let legend: HTMLLegendElement = document.createElement("legend");
                    legend.innerHTML = key;
                    legend.classList.add("unfoldable");
                    fieldset.classList.add("parent");
                    fieldset.addEventListener("click", UIGenerator.toggleListObj);
                    fieldset.appendChild(legend);
                    fieldset.style.display = "list-item"
                    this.generateUI(<ƒ.Mutator>value, fieldset);
                    _parent.appendChild(fieldset);
                }
                else {
                    let valueInput: HTMLElement;
                    let nametag: HTMLElement = document.createElement("label");
                    nametag.style.display = "inline";
                    nametag.innerHTML = key + ":";
                    
                    _parent.appendChild(nametag);
                    switch (typeof value) {
                        case "number":
                            valueInput = document.createElement("input");
                            (<HTMLInputElement>valueInput).value = value;
                            break;
                        case "boolean":
                            valueInput = document.createElement("input");
                            (<HTMLInputElement>valueInput).type = "checkbox";
                            (<HTMLInputElement>valueInput).checked = value;
                            break;
                        case "string":
                            valueInput = document.createElement("input");
                            (<HTMLInputElement>valueInput).value = value;
                            break;
                        default:
                            valueInput = document.createElement("a");
                            break;
                    }
                    valueInput.style.display = "inline";
                    _parent.appendChild(valueInput);

                }
            }

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
                    let displayStyle:string = child.tagName == "FIELDSET" ? "list-item" : "inline";
                    child.style.display = childNowVisible ? displayStyle : "none";
                    childNowVisible ? target.classList.remove("folded") : target.classList.add("folded");
                }

            }
        }
    }
}
