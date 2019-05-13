/// <reference path="../../../../Core/build/Fudge.d.ts"/>
var GoldenLayoutTest;
(function (GoldenLayoutTest) {
    class UIGenerator {
        static createFromMutator(mutator, element) {
            UIGenerator.generateUI(mutator, element);
        }
        static generateUI(_obj, _parent) {
            for (let key in _obj) {
                let value = _obj[key];
                if (value instanceof Object) {
                    let fieldset = document.createElement("fieldset");
                    let legend = document.createElement("legend");
                    legend.innerHTML = key;
                    legend.classList.add("unfoldable");
                    fieldset.classList.add("parent");
                    fieldset.addEventListener("click", UIGenerator.toggleListObj);
                    fieldset.appendChild(legend);
                    fieldset.style.display = "list-item";
                    this.generateUI(value, fieldset);
                    _parent.appendChild(fieldset);
                }
                else {
                    let valueInput;
                    let nametag = document.createElement("label");
                    nametag.style.display = "inline";
                    nametag.innerHTML = key + ":";
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
                    valueInput.style.display = "inline";
                    _parent.appendChild(valueInput);
                }
            }
        }
        static toggleListObj(_event) {
            _event.preventDefault();
            if (_event.target != _event.currentTarget)
                return;
            let target = _event.target;
            let children = target.children;
            for (let i = 0; i < children.length; i++) {
                let child = children[i];
                if (!child.classList.contains("unfoldable")) {
                    let childNowVisible = child.style.display == "none" ? true : false;
                    let displayStyle = child.tagName == "FIELDSET" ? "list-item" : "inline";
                    child.style.display = childNowVisible ? displayStyle : "none";
                    childNowVisible ? target.classList.remove("folded") : target.classList.add("folded");
                }
            }
        }
    }
    GoldenLayoutTest.UIGenerator = UIGenerator;
})(GoldenLayoutTest || (GoldenLayoutTest = {}));
//# sourceMappingURL=UIGenerator.js.map