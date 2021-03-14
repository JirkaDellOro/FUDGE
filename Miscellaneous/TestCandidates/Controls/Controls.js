var Controls;
(function (Controls) {
    var ƒ = FudgeCore;
    window.addEventListener("DOMContentLoaded", init);
    let controlProportional = new ƒ.Control("Proportional", 1, ƒ.CONTROL_TYPE.PROPORTIONAL);
    let controlIntegral = new ƒ.Control("Integral", 0.1, ƒ.CONTROL_TYPE.INTEGRAL);
    let controlDifferential = new ƒ.Control("Differential", 2, ƒ.CONTROL_TYPE.DIFFERENTIAL);
    let input;
    let output;
    let mode;
    let rateDispatchOutput = 20;
    function init(_event) {
        input = document.querySelector("fieldset#Input");
        output = document.querySelector("fieldset#Output");
        mode = document.querySelector("fieldset#Mode");
        setup();
        document.addEventListener("keydown", hndKey);
        document.addEventListener("keyup", hndKey);
        input.addEventListener("input", hndControlInput);
        mode.addEventListener("input", hndModeInput);
        update();
    }
    function setup() {
        let number = { min: "-2", max: "2", step: "0.1", value: "0.1" };
        let slider = { min: "-1", max: "1", step: "0.01", value: "0" };
        let keyboard = createFieldset("Keys A-|D+", true, number, slider, true);
        input.appendChild(keyboard);
        let absolute = createFieldset("Absolute", false, number, slider);
        input.appendChild(absolute);
        number.value = "1";
        let relative = createFieldset("Relative", false, number, slider);
        input.appendChild(relative);
        relative.setAttribute("oldValue", "0");
        let proportional = createFieldset("Proportional", true, number, slider);
        addDelayStepper(proportional);
        output.appendChild(proportional);
        number.value = "0.1";
        let integral = createFieldset("Integral", true, number, slider);
        addDelayStepper(integral);
        output.appendChild(integral);
        number.value = "2";
        let differential = createFieldset("Differential", true, number, slider);
        addDelayStepper(differential);
        output.appendChild(differential);
        controlProportional.addEventListener(ƒ.EVENT_CONTROL.OUTPUT, function (_event) { hndControlOutput(_event, proportional); });
        controlIntegral.addEventListener(ƒ.EVENT_CONTROL.OUTPUT, function (_event) { hndControlOutput(_event, integral); });
        controlDifferential.addEventListener(ƒ.EVENT_CONTROL.OUTPUT, function (_event) { hndControlOutput(_event, differential); });
        proportional.addEventListener("input", function (_event) { hndControlParameters(_event, controlProportional); });
        integral.addEventListener("input", function (_event) { hndControlParameters(_event, controlIntegral); });
        differential.addEventListener("input", function (_event) { hndControlParameters(_event, controlDifferential); });
    }
    function createFieldset(_name, _readonly, _stepper, _slider, _nometer = false) {
        let fieldset = document.createElement("fieldset");
        fieldset.id = _name;
        let legend = document.createElement("legend");
        legend.innerHTML = `<strong>${_name}</strong>Factor: `;
        legend.append(createInputElement("number", _stepper));
        legend.innerHTML += " | Value: [<output>0</output>]";
        if (_readonly && !_nometer)
            legend.innerHTML += " | <meter></meter";
        fieldset.appendChild(legend);
        let slider = createInputElement("range", _slider);
        slider.disabled = _readonly;
        fieldset.append(slider);
        return fieldset;
    }
    function addDelayStepper(_fieldset) {
        _fieldset.querySelector("legend").innerHTML += ` | Delay <input type="number" min="0", max="1000" step="50" value="0" name="Delay"/>`;
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
    function hndModeInput(_event) {
        let target = document.querySelector("input#Passive");
        rateDispatchOutput = 100;
        if (target.checked) {
            rateDispatchOutput = 0;
            update();
        }
        controlProportional.setRateDispatchOutput(rateDispatchOutput);
        controlDifferential.setRateDispatchOutput(rateDispatchOutput);
        controlIntegral.setRateDispatchOutput(rateDispatchOutput);
    }
    function hndControlInput(_event) {
        let target = _event.target;
        if (target.type != "range")
            return;
        let value = updateFieldsetOutput(target);
        controlProportional.setInput(value);
        controlDifferential.setInput(value);
        controlIntegral.setInput(value);
        let signals = document.querySelector("textarea");
        signals.textContent += target.parentElement.id + ": " + format(value) + "\n";
        signals.scrollTop = signals.scrollHeight;
    }
    function hndControlParameters(_event, _control) {
        let target = _event.target;
        let fieldset = _event.currentTarget;
        let value = parseFloat(target.value);
        if (target.name == "Delay")
            _control.setDelay(value);
        else
            _control.setFactor(value);
    }
    function hndControlOutput(_event, _fieldset) {
        let control = _event.target;
        let slider = _fieldset.querySelector("input[type=range]");
        let value;
        if (_event.detail)
            value = _event.detail.output;
        else
            value = control.getOutput();
        slider.value = value.toString();
        slider.parentElement.querySelector("output").textContent = format(value);
        updateMeter(_fieldset);
    }
    function update() {
        updateMeter(document);
        controlProportional.dispatchEvent(new Event(ƒ.EVENT_CONTROL.OUTPUT));
        controlDifferential.dispatchEvent(new Event(ƒ.EVENT_CONTROL.OUTPUT));
        controlIntegral.dispatchEvent(new Event(ƒ.EVENT_CONTROL.OUTPUT));
        let target = document.querySelector("input#Passive");
        if (target.checked)
            window.setTimeout(update, 10);
    }
    function updateMeter(_ancestor) {
        let meter = _ancestor.querySelector("meter");
        meter.value = (meter.value + 0.01) % 1;
    }
    function format(_value) {
        return _value.toFixed(4).padStart(7, "+");
    }
})(Controls || (Controls = {}));
//# sourceMappingURL=Controls.js.map