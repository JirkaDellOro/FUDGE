var Iterator;
(function (Iterator) {
    var ƒ = FudgeCore;
    window.addEventListener("DOMContentLoaded", init);
    let axisProportional = new ƒ.Axis(0.1, 0 /* PROPORTIONAL */);
    let axisIntegral = new ƒ.Axis(0.1, 1 /* INTEGRAL */);
    let axisDifferential = new ƒ.Axis(0.1, 2 /* DIFFERENTIAL */);
    let input;
    let output;
    function init(_event) {
        input = document.querySelectorAll("fieldset")[0];
        output = document.querySelectorAll("fieldset")[1];
        setup();
        document.addEventListener("keydown", hndKey);
        document.addEventListener("keyup", hndKey);
        input.addEventListener("input", hndAxisInput);
        update();
    }
    function setup() {
        let number = { min: "-2", max: "2", step: "0.1", value: "0.1" };
        let slider = { min: "-1", max: "1", step: "0.01", value: "0" };
        let keyboard = createFieldset("Keys A-|D+", true, number, slider);
        input.appendChild(keyboard);
        let absolute = createFieldset("Absolute", false, number, slider);
        input.appendChild(absolute);
        let relative = createFieldset("Relative", false, number, slider);
        input.appendChild(relative);
        relative.setAttribute("oldValue", "0");
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
        proportional.addEventListener("input", function (_event) { hndFactorChange(_event, axisProportional); });
        integral.addEventListener("input", function (_event) { hndFactorChange(_event, axisIntegral); });
        differential.addEventListener("input", function (_event) { hndFactorChange(_event, axisDifferential); });
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
        let fieldset = _slider.parentElement;
        let factor = parseFloat(fieldset.querySelector("input").value);
        let value = parseFloat(_slider.value);
        if (fieldset.id == "Relative") {
            let old = parseFloat(fieldset.getAttribute("oldValue"));
            let relative = value - old;
            fieldset.setAttribute("oldValue", value.toString());
            value = relative;
        }
        value *= factor;
        fieldset.querySelector("output").textContent = format(value);
        return value;
    }
    function hndAxisInput(_event) {
        let target = _event.target;
        if (target.type != "range")
            return;
        let value = updateFieldsetOutput(target);
        axisProportional.setInput(value);
        axisDifferential.setInput(value);
        axisIntegral.setInput(value);
        let signals = document.querySelector("textarea");
        signals.textContent += target.parentElement.id + ": " + format(value) + "\n";
        signals.scrollTop = signals.scrollHeight;
    }
    function hndFactorChange(_event, _axis) {
        let target = _event.target;
        let fieldset = _event.currentTarget;
        if (target.type == "number") {
            let factor = parseFloat(fieldset.querySelector("input").value);
            _axis.setFactor(factor);
        }
    }
    function hndAxisOutput(_event, _fieldset) {
        // console.log(_fieldset);
        let axis = _event.target;
        let slider = _fieldset.querySelector("input[type=range]");
        let value = axis.getValue();
        slider.value = value.toString();
        slider.parentElement.querySelector("output").textContent = format(value);
    }
    function update() {
        axisProportional.dispatchEvent(new Event("output" /* OUTPUT */));
        axisDifferential.dispatchEvent(new Event("output" /* OUTPUT */));
        axisIntegral.dispatchEvent(new Event("output" /* OUTPUT */));
        window.setTimeout(update, 20);
    }
    function format(_value) {
        return _value.toFixed(4).padStart(7, "+");
    }
})(Iterator || (Iterator = {}));
//# sourceMappingURL=Input.js.map