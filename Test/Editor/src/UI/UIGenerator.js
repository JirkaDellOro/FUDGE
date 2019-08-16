/// <reference types="../../../../Core/Build/FudgeCore"/>
var MoniUI;
/// <reference types="../../../../Core/Build/FudgeCore"/>
(function (MoniUI) {
    class UIGenerator {
        static createFromMutator(_mutable, element) {
            let name = _mutable.constructor.name;
            let _types;
            let mutator = _mutable.getMutator();
            let _parent = UIGenerator.createFieldset(name, element);
            let data;
            _types = _mutable.getMutatorAttributeTypes(mutator);
            for (let key in _types) {
                let type = _types[key];
                let value = mutator[key].toString();
                if (type instanceof Object) {
                    //Type is Enum
                    UIGenerator.createLabelElement(key, _parent);
                    UIGenerator.createDropdown(key, type, value, _parent);
                }
                else {
                    switch (type) {
                        case "Number":
                            UIGenerator.createLabelElement(key, _parent, { _value: key });
                            // UIGenerator.createTextElement(key, _parent, { _value: value })
                            let numValue = parseInt(value);
                            UIGenerator.createStepperElement(key, _parent, { _value: numValue, _mutable: _mutable });
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
            return data;
        }
        static createDropdown(_id, _content, _value, _parent, _cssClass) {
            let dropdown = document.createElement("select");
            dropdown.id = _id;
            dropdown.name = _id;
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
            valueInput.name = _id;
            valueInput.value = params._value;
            _parent.appendChild(valueInput);
            return valueInput;
        }
        static createCheckboxElement(_id, _value, _parent, _cssClass) {
            let valueInput = document.createElement("input");
            valueInput.type = "checkbox";
            valueInput.checked = _value;
            valueInput.classList.add(_cssClass);
            valueInput.name = _id;
            valueInput.id = _id;
            _parent.appendChild(valueInput);
            return valueInput;
        }
        static createStepperElement(_id, _parent, params = {}) {
            if (params._value == undefined)
                params._value = 0;
            let stepper = new MoniUI.Stepper(_id, { value: params._value });
            // if(params._mutable != null)
            //     stepper.addEventListener("input", function(_event:Event){
            //         let mutator:ƒ.Mutator =  params._mutable.getMutator();
            //         let stepperValueHolder:HTMLInputElement = <HTMLInputElement>stepper.firstChild;
            //         let inputValue:String = stepperValueHolder.value;
            //         mutator[_id] = inputValue;
            //         params._mutable.mutate(mutator); 
            //     })
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
    MoniUI.UIGenerator = UIGenerator;
})(MoniUI || (MoniUI = {}));
//# sourceMappingURL=UIGenerator.js.map