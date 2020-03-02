namespace Iterator {
  import ƒ = FudgeCore;
  type Parameter = { min: string, max: string, step: string, value: string };
  window.addEventListener("DOMContentLoaded", init);
  let axis: ƒ.Axis = new ƒ.Axis(0.01, ƒ.AXIS_TYPE.PROPORTIONAL);
  // let axis: ƒ.Axis = new ƒ.Axis(0.01, ƒ.AXIS_TYPE.INTEGRAL);

  function init(_event: Event): void {
    setup();
    console.log(axis);

    document.addEventListener("keydown", hndKey);
    document.addEventListener("keyup", hndKey);
    document.addEventListener("mousemove", hndMouseMove);

    update();
  }

  function setup(): void {
    let number: Parameter = { min: "-2", max: "2", step: "0.1", value: "1" };
    let slider: Parameter = { min: "-1", max: "1", step: "0.01", value: "0" };

    let input: HTMLFieldSetElement = document.querySelectorAll("fieldset")[0];
    input.addEventListener("input", hndInput);
    let output: HTMLFieldSetElement = document.querySelectorAll("fieldset")[1];
    output.addEventListener("input", hndOutput);

    let keyboard: HTMLFieldSetElement = createFieldset("Keys A-|D+", true, number, slider);
    input.appendChild(keyboard);
    let absolute: HTMLFieldSetElement = createFieldset("Absolute", false, number, slider);
    input.appendChild(absolute);
    let relative: HTMLFieldSetElement = createFieldset("Relative", false, number, slider);
    input.appendChild(relative);

    let proportional: HTMLFieldSetElement = createFieldset("Proportional", true, number, slider);
    output.appendChild(proportional);
    let integral: HTMLFieldSetElement = createFieldset("Integral", true, number, slider);
    output.appendChild(integral);
    let differential: HTMLFieldSetElement = createFieldset("Differential", true, number, slider);
    output.appendChild(differential);
  }

  function createFieldset(_name: string, _readonly: boolean, _stepper: Parameter, _slider: Parameter): HTMLFieldSetElement {
    let fieldset: HTMLFieldSetElement = document.createElement("fieldset");
    let legend: HTMLLegendElement = document.createElement("legend");
    legend.innerHTML = `<strong>${_name}</strong>Factor: `;
    legend.append(createInputElement("number", _stepper));
    legend.innerHTML += " | Value: [<output>0</output>]";
    fieldset.appendChild(legend);
    let slider: HTMLInputElement = createInputElement("range", _slider);
    slider.disabled = _readonly;
    fieldset.append(slider);
    return fieldset;
  }

  function createInputElement(_type: string, _parameter: Parameter): HTMLInputElement {
    let input: HTMLInputElement = document.createElement("input");
    input.type = _type;
    input.min = _parameter.min;
    input.max = _parameter.max;
    input.step = _parameter.step;
    input.value = _parameter.value;
    input.setAttribute("value", _parameter.value);
    return input;
  }

  function hndKey(_event: KeyboardEvent): void {
    if (_event.repeat)
      return;
    axis.setInput(_event.type == "keydown" ? 0.1 : 0);
  }
  function hndMouseMove(_event: MouseEvent): void {
    axis.setInput((_event.clientY - 100) * 0.1);
  }

  function hndInput(_event: InputEvent): void {
    let target: HTMLInputElement = <HTMLInputElement>_event.target;
    if (target.type == "range") {
      let value: string = parseFloat(target.value).toFixed(2).padStart(5, "+");
      target.parentElement.querySelector("output").textContent = value;
    }
  }
  function hndOutput(_event: InputEvent): void {
    console.log(_event);
  }

  function update(): void {
    console.log(axis.getValue());
    // window.setTimeout(update, 20);
  }
} 