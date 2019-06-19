/// <reference path="../../../../../Core/build/Fudge.d.ts"/>
var UI;
(function (UI) {
    class UIGenerator {
        static createFromMutator(mutable, element) {
            let name = mutable.constructor.name;
            let types;
            let mutator = mutable.getMutator();
            let fieldset = UIGenerator.createFieldset(name, element);
            types = mutable.getMutatorAttributeTypes(mutator);
            UIGenerator.generateUI(mutator, types, fieldset);
        }
        static generateUI(_obj, _types, _parent) {
            for (let key in _types) {
                let type = _types[key];
                let value = _obj[key].toString();
                if (type instanceof Object) {
                    //Type is Enum
                    UIGenerator.createLabelElement(key, _parent);
                    UIGenerator.createDropdown(type, value, _parent);
                }
                else {
                    switch (type) {
                        case "Number":
                            UIGenerator.createLabelElement(key, _parent, { _value: key });
                            // UIGenerator.createTextElement(key, _parent, { _value: value })
                            let num_value = parseInt(value);
                            UIGenerator.createStepperElement(key, _parent, { _value: num_value });
                            break;
                        case "Boolean":
                            UIGenerator.createLabelElement(key, _parent, { _value: key });
                            let enabled = value == "true" ? true : false;
                            UIGenerator.createCheckboxElement(key, enabled, _parent);
                            break;
                        case "String":
                            UIGenerator.createLabelElement(key, _parent, { _value: key });
                            UIGenerator.createTextElement(key, _parent, { _value: value });
                            break;
                        default:
                            break;
                    }
                }
            }
        }
        static createDropdown(_content, _value, _parent, _cssClass) {
            let dropdown = document.createElement("select");
            for (let value in _content) {
                let entry = document.createElement("option");
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
        static createFieldset(_legend, _parent, _cssClass) {
            let fieldset = document.createElement("fieldset");
            let legend = document.createElement("legend");
            legend.innerHTML = _legend;
            let toggleButton = document.createElement("button");
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
        static createLabelElement(_id, _parent, params = {}) {
            let label = document.createElement("label");
            if (params._value == undefined)
                params._value = _id;
            label.innerText = params._value;
            if (!params._cssClass == undefined)
                label.classList.add(params._cssClass);
            label.id = _id;
            _parent.appendChild(label);
            return label;
        }
        static createTextElement(_id, _parent, params = {}) {
            let valueInput = document.createElement("input");
            if (params._value == undefined)
                params._value = "";
            if (!params._cssClass == undefined)
                valueInput.classList.add(params._cssClass);
            valueInput.id = _id;
            valueInput.value = params._value;
            _parent.appendChild(valueInput);
            return valueInput;
        }
        static createCheckboxElement(_id, _value, _parent, _cssClass) {
            let valueInput = document.createElement("input");
            valueInput.type = "checkbox";
            valueInput.checked = _value;
            valueInput.classList.add(_cssClass);
            valueInput.id = _id;
            _parent.appendChild(valueInput);
            return valueInput;
        }
        static createStepperElement(_id, _parent, params = {}) {
            if (params._value == undefined)
                params._value = 0;
            let stepper = new UI.Stepper(_id, { value: params._value });
            _parent.append(stepper);
            return stepper;
        }
        static toggleFoldElement(_event) {
            _event.preventDefault();
            if (_event.target != _event.currentTarget)
                return;
            let target = _event.target;
            let foldTarget = target.parentElement.parentElement;
            let foldToggle;
            //Toggle the folding behaviour of the Folding Target
            foldTarget.classList.contains("fieldset_folded") ? foldToggle = false : foldToggle = true;
            foldToggle == true ? foldTarget.classList.add("fieldset_folded") : foldTarget.classList.remove("fieldset_folded");
            foldToggle == true ? target.innerHTML = ">" : target.innerHTML = "v";
            let children = foldTarget.children;
            // for (let i = 0; i < children.length; i++) {
            for (let child of children) {
                // let child: HTMLElement = <HTMLElement>children[i];
                if (!child.classList.contains("unfoldable")) {
                    foldToggle == true ? child.classList.add("folded") : child.classList.remove("folded");
                }
            }
        }
    }
    UI.UIGenerator = UIGenerator;
})(UI || (UI = {}));
//# sourceMappingURL=UIGenerator.js.map