var Iterator;
(function (Iterator) {
    var ƒ = FudgeCore;
    window.addEventListener("DOMContentLoaded", init);
    let axis = new ƒ.Axis(0.01, 0 /* PROPORTIONAL */);
    // let axis: ƒ.Axis = new ƒ.Axis(0.01, ƒ.AXIS_TYPE.INTEGRAL);
    function init(_event) {
        setup();
        console.log(axis);
        document.addEventListener("keydown", hndKey);
        document.addEventListener("keyup", hndKey);
        document.addEventListener("mousemove", hndMouseMove);
        update();
    }
    function setup() {
        let number = { min: "-2", max: "2", step: "0.1", value: "1" };
        let slider = { min: "-1", max: "1", step: "0.01", value: "0" };
        let input = document.querySelectorAll("fieldset")[0];
        input.addEventListener("input", hndInput);
        let output = document.querySelectorAll("fieldset")[1];
        output.addEventListener("input", hndOutput);
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
    }
    function createFieldset(_name, _readonly, _stepper, _slider) {
        let fieldset = document.createElement("fieldset");
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
        axis.setInput(_event.type == "keydown" ? 0.1 : 0);
    }
    function hndMouseMove(_event) {
        axis.setInput((_event.clientY - 100) * 0.1);
    }
    function hndInput(_event) {
        let target = _event.target;
        if (target.type == "range") {
            let value = parseFloat(target.value).toFixed(2).padStart(5, "+");
            target.parentElement.querySelector("output").textContent = value;
        }
    }
    function hndOutput(_event) {
        console.log(_event);
    }
    function update() {
        console.log(axis.getValue());
        // window.setTimeout(update, 20);
    }
})(Iterator || (Iterator = {}));
//# sourceMappingURL=Input.js.map