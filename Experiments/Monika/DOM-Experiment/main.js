/// <reference path="../../../Core/build/Fudge.d.ts"/>
var UIGenerator;
(function (UIGenerator) {
    window.addEventListener("DOMContentLoaded", init);
    function init() {
        let div = document.createElement("div");
        let mutator = { people: [{ name: "Lukas", age: 24 }, { name: "Jirka", age: 54 }], cars: [{ brand: "Audi", km: 20000, new: false }, { brand: "VW", km: 100000, new: true }] };
        generateUI(mutator, div);
        document.body.appendChild(div);
    }
    function generateUI(_obj, _parent) {
        for (let key in _obj) {
            let value = _obj[key];
            let div = document.createElement("div");
            if (value instanceof Object) {
                let fieldset = document.createElement("fieldset");
                let legend = document.createElement("legend");
                legend.innerHTML = key;
                fieldset.appendChild(legend);
                generateUI(value, fieldset);
                _parent.appendChild(fieldset);
            }
            else {
                let valueInput;
                let nametag = document.createElement("label");
                nametag.innerHTML = key + ": ";
                _parent.appendChild(nametag);
                switch (typeof value) {
                    case "number":
                        valueInput = document.createElement("input");
                        valueInput.value = value;
                        break;
                    case "boolean":
                        valueInput = document.createElement("input");
                        valueInput.type = "checkbox";
                        valueInput.checked = value;
                        break;
                    case "string":
                        valueInput = document.createElement("input");
                        valueInput.value = value;
                        break;
                    default:
                        valueInput = document.createElement("a");
                        break;
                }
                _parent.appendChild(valueInput);
            }
        }
    }
})(UIGenerator || (UIGenerator = {}));
//# sourceMappingURL=main.js.map