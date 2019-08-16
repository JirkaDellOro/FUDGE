/// <reference path="../../../Core/build/Fudge.d.ts"/>
namespace UIGenerator {
    import ƒ = FudgeCore;
    window.addEventListener("DOMContentLoaded", init);

    function init() {
        let div:HTMLElement = document.createElement("div");
        let mutator:ƒ.Mutator = { people: [{ name: "Lukas", age: 24 }, { name: "Jirka", age: 54 }], cars: [{ brand: "Audi", km: 20000, new: false }, { brand: "VW", km: 100000, new: true }] };
        generateUI(mutator, div);
        document.body.appendChild(div);
    }

    function generateUI(_obj: ƒ.Mutator, _parent: HTMLElement): void {
        for (let key in _obj) {
            let value: Object = _obj[key];
            let div = document.createElement("div");
            if (value instanceof Object) {
                let fieldset:HTMLFieldSetElement = document.createElement("fieldset");
                let legend:HTMLLegendElement = document.createElement("legend");
                legend.innerHTML = key;
                fieldset.appendChild(legend);
                generateUI(<ƒ.Mutator>value, fieldset);
                _parent.appendChild(fieldset);
            }
            else {
                let valueInput: HTMLElement;
                let nametag: HTMLElement = document.createElement("label");
                nametag.innerHTML = key + ": ";
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
                _parent.appendChild(valueInput);
            }
        }
    }
}
