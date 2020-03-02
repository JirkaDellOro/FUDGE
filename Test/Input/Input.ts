namespace Iterator {
  import ƒ = FudgeCore;
  type Parameter = { min: string, max: string, step: string, value: string };
  window.addEventListener("DOMContentLoaded", init);
  let axisProportional: ƒ.Axis = new ƒ.Axis(1, ƒ.AXIS_TYPE.PROPORTIONAL);
  let axisIntegral: ƒ.Axis = new ƒ.Axis(1, ƒ.AXIS_TYPE.INTEGRAL);
  let axisDifferential: ƒ.Axis = new ƒ.Axis(1, ƒ.AXIS_TYPE.DIFFERENTIAL);
  let input: HTMLFieldSetElement;
  let output: HTMLFieldSetElement;



  function init(_event: Event): void {
    input = document.querySelectorAll("fieldset")[0];
    output = document.querySelectorAll("fieldset")[1];

    setup();

    document.addEventListener("keydown", hndKey);
    document.addEventListener("keyup", hndKey);
    input.addEventListener("input", hndAxisInput);
    // output.addEventListener("input", hndAxisOutput);

    update();
  }

  function setup(): void {
    let number: Parameter = { min: "-2", max: "2", step: "0.1", value: "1" };
    let slider: Parameter = { min: "-1", max: "1", step: "0.01", value: "0" };

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

    axisProportional.addEventListener(ƒ.EVENT_CONTROL.OUTPUT, function (_event: Event): void { hndAxisOutput(_event, proportional); });
    axisIntegral.addEventListener(ƒ.EVENT_CONTROL.OUTPUT, function (_event: Event): void { hndAxisOutput(_event, integral); });
    axisDifferential.addEventListener(ƒ.EVENT_CONTROL.OUTPUT, function (_event: Event): void { hndAxisOutput(_event, differential); });
    // axisProportional.addEventListener(ƒ.EVENT_CONTROL.INPUT, function (_event: Event): void { hndAxisOutput(_event, proportional); });
  }

  function createFieldset(_name: string, _readonly: boolean, _stepper: Parameter, _slider: Parameter): HTMLFieldSetElement {
    let fieldset: HTMLFieldSetElement = document.createElement("fieldset");
    fieldset.id = _name;
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

    if (_event.code != ƒ.KEYBOARD_CODE.A && _event.code != ƒ.KEYBOARD_CODE.D)
      return;
    // TODO: integrate sophisticated key handling

    let value: number = (_event.code == ƒ.KEYBOARD_CODE.A) ? -1 : 1;
    if (_event.type == "keyup")
      value = 0;

    let slider: HTMLInputElement = document.querySelector("input[type=range");
    slider.value = value.toString();
    slider.dispatchEvent(new InputEvent("input", { bubbles: true }));
  }

  function updateFieldsetOutput(_slider: HTMLInputElement): number {
    let factor: number = parseFloat(_slider.parentElement.querySelector("input").value);
    let value: number = factor * parseFloat(_slider.value);
    _slider.parentElement.querySelector("output").textContent = value.toFixed(2).padStart(5, "+");
    return value;
  }

  function hndAxisInput(_event: Event): void {
    let target: HTMLInputElement = <HTMLInputElement>_event.target;
    if (target.type == "range") {
      let value: number = updateFieldsetOutput(target);
      axisProportional.setInput(value);
      axisDifferential.setInput(value);
      axisIntegral.setInput(value);
    }
  }

  function hndOutputFactors(_event: InputEvent): void {
    console.log(_event);
  }

  function hndAxisOutput(_event: Event, _fieldset: HTMLFieldSetElement): void {
    // console.log(_fieldset);
    let axis: ƒ.Axis = <ƒ.Axis>_event.target;
    let slider: HTMLInputElement = _fieldset.querySelector("input[type=range]");
    slider.value = axis.getValue().toString();
    updateFieldsetOutput(slider);
  }

  function update(): void {
    axisProportional.dispatchEvent(new Event(ƒ.EVENT_CONTROL.OUTPUT));
    axisDifferential.dispatchEvent(new Event(ƒ.EVENT_CONTROL.OUTPUT));
    axisIntegral.dispatchEvent(new Event(ƒ.EVENT_CONTROL.OUTPUT));
    window.setTimeout(update, 20);
  }
} 