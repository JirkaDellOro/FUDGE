var Iterator;
(function (Iterator) {
    var ƒ = FudgeCore;
    window.addEventListener("DOMContentLoaded", init);
    let axisProportional = new ƒ.Axis(1, 0 /* PROPORTIONAL */);
    let axisIntegral = new ƒ.Axis(1, 1 /* INTEGRAL */);
    let axisDifferential = new ƒ.Axis(1, 2 /* DIFFERENTIAL */);
    let input;
    let output;
    function init(_event) {
        input = document.querySelectorAll("fieldset")[0];
        output = document.querySelectorAll("fieldset")[1];
        setup();
        document.addEventListener("keydown", hndKey);
        document.addEventListener("keyup", hndKey);
        input.addEventListener("input", hndAxisInput);
        // output.addEventListener("input", hndAxisOutput);
        update();
    }
    function setup() {
        let number = { min: "-2", max: "2", step: "0.1", value: "1" };
        let slider = { min: "-1", max: "1", step: "0.01", value: "0" };
        let keyboard = createFieldset("Keys A-|D+", true, number, slider);
        input.appendChild(keyboard);
        let absolute = createFieldset("Absolute", false, number, slider);
        input.appendChild(absolute);
        let relative = createFieldset("Relative", false, number, slider);
        input.appendChild(relative);
        let proportional = createFieldset("Proportional", true, number, slider);
        output.appendChild(proportional);
        let integral = createFieldset("Integral", true, number, slider);
        output.appendChild(integral);
        let differential = createFieldset("Differential", true, number, slider);
        output.appendChild(differential);
        axisProportional.addEventListener("output" /* OUTPUT */, function (_event) { hndAxisOutput(_event, proportional); });
        axisIntegral.addEventListener("output" /* OUTPUT */, function (_event) { hndAxisOutput(_event, integral); });
        axisDifferential.addEventListener("output" /* OUTPUT */, function (_event) { hndAxisOutput(_event, differential); });
        // axisProportional.addEventListener(ƒ.EVENT_CONTROL.INPUT, function (_event: Event): void { hndAxisOutput(_event, proportional); });
    }
    function createFieldset(_name, _readonly, _stepper, _slider) {
        let fieldset = document.createElement("fieldset");
        fieldset.id = _name;
        let legend = document.createElement("legend");
        legend.innerHTML = `<strong>${_name}</strong>Factor: `;
        legend.append(createInputElement("number", _stepper));
        legend.innerHTML += " | Value: [<output>0</output>]";
        fieldset.appendChild(legend);
        let slider = createInputElement("range", _slider);
        slider.disabled = _readonly;
        fieldset.append(slider);
        return fieldset;
    }
    function createInputElement(_type, _parameter) {
        let input = document.createElement("input");
        input.type = _type;
        input.min = _parameter.min;
        input.max = _parameter.max;
        input.step = _parameter.step;
        input.value = _parameter.value;
        input.setAttribute("value", _parameter.value);
        return input;
    }
    function hndKey(_event) {
        if (_event.repeat)
            return;
        if (_event.code != ƒ.KEYBOARD_CODE.A && _event.code != ƒ.KEYBOARD_CODE.D)
            return;
        // TODO: integrate sophisticated key handling
        let value = (_event.code == ƒ.KEYBOARD_CODE.A) ? -1 : 1;
        if (_event.type == "keyup")
            value = 0;
        let slider = document.querySelector("input[type=range");
        slider.value = value.toString();
        slider.dispatchEvent(new InputEvent("input", { bubbles: true }));
    }
    function updateFieldsetOutput(_slider) {
        let factor = parseFloat(_slider.parentElement.querySelector("input").value);
        let value = factor * parseFloat(_slider.value);
        _slider.parentElement.querySelector("output").textContent = value.toFixed(2).padStart(5, "+");
        return value;
    }
    function hndAxisInput(_event) {
        let target = _event.target;
        if (target.type == "range") {
            let value = updateFieldsetOutput(target);
            axisProportional.setInput(value);
            axisDifferential.setInput(value);
            axisIntegral.setInput(value);
        }
    }
    function hndOutputFactors(_event) {
        console.log(_event);
    }
    function hndAxisOutput(_event, _fieldset) {
        // console.log(_fieldset);
        let axis = _event.target;
        let slider = _fieldset.querySelector("input[type=range]");
        slider.value = axis.getValue().toString();
        updateFieldsetOutput(slider);
    }
    function update() {
        axisProportional.dispatchEvent(new Event("output" /* OUTPUT */));
        axisDifferential.dispatchEvent(new Event("output" /* OUTPUT */));
        axisIntegral.dispatchEvent(new Event("output" /* OUTPUT */));
        window.setTimeout(update, 20);
    }
})(Iterator || (Iterator = {}));
//# sourceMappingURL=Input.js.map