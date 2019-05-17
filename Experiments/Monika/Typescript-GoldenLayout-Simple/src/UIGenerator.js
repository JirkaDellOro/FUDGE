/// <reference path="../../../../Core/build/Fudge.d.ts"/>
var GoldenLayoutTest;
(function (GoldenLayoutTest) {
    class UIGenerator {
        static createFromMutator(mutator, element) {
            // let mutator: ƒ.Mutator = { people: [{ name: "Lukas", age: 24 }, { name: "Jirka", age: 54 }], cars: [{ brand: "Audi", km: 20000, new: false }, { brand: "VW", km: 100000, new: true }] };
            UIGenerator.generateUI(mutator, element);
        }
        static generateUI(_obj, _parent) {
            _obj.constructor.name;
            for (let key in _obj) {
                let value = _obj[key];
                if (value instanceof Object) {
                    let fieldset = UIGenerator.createFieldset(key, _parent);
                    fieldset.addEventListener("click", UIGenerator.toggleListObj);
                    this.generateUI(value, fieldset);
                    _parent.appendChild(fieldset);
                }
                else {
                    switch (typeof value) {
                        case "number":
                            UIGenerator.createLabelElement(key, key, _parent);
                            UIGenerator.createTextElement(key, value, _parent);
                            break;
                        case "boolean":
                            UIGenerator.createLabelElement(key, key, _parent);
                            UIGenerator.createCheckboxElement(key, value, _parent);
                            break;
                        case "string":
                            UIGenerator.createLabelElement(key, key, _parent);
                            UIGenerator.createTextElement(key, value, _parent);
                            break;
                        default:
                            break;
                    }
                }
            }
        }
        static createFieldset(_legend, _parent, _class) {
            let fieldset = document.createElement("fieldset");
            let legend = document.createElement("legend");
            legend.innerHTML = _legend;
            fieldset.appendChild(legend);
            legend.classList.add("unfoldable");
            fieldset.classList.add(_class);
            return fieldset;
        }
        static createLabelElement(_id, _value, _parent, _class) {
            let label = document.createElement("label");
            label.innerHTML = _value;
            label.classList.add(_class);
            label.id = _id;
            _parent.appendChild(label);
            return label;
        }
        static createTextElement(_id, _value, _parent, _class) {
            let valueInput = document.createElement("input");
            valueInput.value = _value;
            valueInput.classList.add(_class);
            valueInput.id = _id;
            _parent.appendChild(valueInput);
            return valueInput;
        }
        static createCheckboxElement(_id, _value, _parent, _class) {
            let valueInput = document.createElement("input");
            valueInput.type = "checkbox";
            valueInput.checked = _value;
            valueInput.classList.add(_class);
            valueInput.id = _id;
            _parent.appendChild(valueInput);
            return valueInput;
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