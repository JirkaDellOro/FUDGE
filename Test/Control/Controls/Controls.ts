namespace Controls {
  import ƒ = FudgeCore;
  type Parameter = { min: string, max: string, step: string, value: string };
  window.addEventListener("DOMContentLoaded", init);
  let controlProportional: ƒ.Control = new ƒ.Control("Proportional", 1, ƒ.CONTROL_TYPE.PROPORTIONAL);
  let controlIntegral: ƒ.Control = new ƒ.Control("Integral", 0.1, ƒ.CONTROL_TYPE.INTEGRAL);
  let controlDifferential: ƒ.Control = new ƒ.Control("Differential", 2, ƒ.CONTROL_TYPE.DIFFERENTIAL);

  let input: HTMLFieldSetElement;
  let output: HTMLFieldSetElement;
  let mode: HTMLFieldSetElement;
  let rateDispatchOutput: number = 20;



  function init(_event: Event): void {
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

  function setup(): void {
    let number: Parameter = { min: "-2", max: "2", step: "0.1", value: "0.1" };
    let slider: Parameter = { min: "-1", max: "1", step: "0.01", value: "0" };

    let keyboard: HTMLFieldSetElement = createFieldset("Keys A-|D+", true, number, slider, true);
    input.appendChild(keyboard);
    let absolute: HTMLFieldSetElement = createFieldset("Absolute", false, number, slider);
    input.appendChild(absolute);
    number.value = "1";
    let relative: HTMLFieldSetElement = createFieldset("Relative", false, number, slider);
    input.appendChild(relative);
    relative.setAttribute("oldValue", "0");

    let proportional: HTMLFieldSetElement = createFieldset("Proportional", true, number, slider);
    addDelayStepper(proportional);
    output.appendChild(proportional);

    number.value = "0.1";
    let integral: HTMLFieldSetElement = createFieldset("Integral", true, number, slider);
    addDelayStepper(integral);
    output.appendChild(integral);

    number.value = "2";
    let differential: HTMLFieldSetElement = createFieldset("Differential", true, number, slider);
    addDelayStepper(differential);
    output.appendChild(differential);

    controlProportional.addEventListener(ƒ.EVENT_CONTROL.OUTPUT, function (_event: CustomEvent): void { hndControlOutput(_event, proportional); });
    controlIntegral.addEventListener(ƒ.EVENT_CONTROL.OUTPUT, function (_event: CustomEvent): void { hndControlOutput(_event, integral); });
    controlDifferential.addEventListener(ƒ.EVENT_CONTROL.OUTPUT, function (_event: CustomEvent): void { hndControlOutput(_event, differential); });

    proportional.addEventListener("input", function (_event: InputEvent): void { hndControlParameters(_event, controlProportional); });
    integral.addEventListener("input", function (_event: InputEvent): void { hndControlParameters(_event, controlIntegral); });
    differential.addEventListener("input", function (_event: InputEvent): void { hndControlParameters(_event, controlDifferential); });
  }

  function createFieldset(_name: string, _readonly: boolean, _stepper: Parameter, _slider: Parameter, _nometer: boolean = false): HTMLFieldSetElement {
    let fieldset: HTMLFieldSetElement = document.createElement("fieldset");
    fieldset.id = _name;

    let legend: HTMLLegendElement = document.createElement("legend");
    legend.innerHTML = `<strong>${_name}</strong>Factor: `;
    legend.append(createInputElement("number", _stepper));
    legend.innerHTML += " | Value: [<output>0</output>]";
    if (_readonly && !_nometer)
      legend.innerHTML += " | <meter></meter";
    fieldset.appendChild(legend);

    let slider: HTMLInputElement = createInputElement("range", _slider);
    slider.disabled = _readonly;
    fieldset.append(slider);

    return fieldset;
  }

  function addDelayStepper(_fieldset: HTMLFieldSetElement): void {
    _fieldset.querySelector("legend").innerHTML += ` | Delay <input type="number" min="0", max="1000" step="50" value="0" name="Delay"/>`;
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
    let fieldset: HTMLFieldSetElement = <HTMLFieldSetElement>_slider.parentElement;
    let factor: number = parseFloat(fieldset.querySelector("input").value);
    let value: number = parseFloat(_slider.value);
    if (fieldset.id == "Relative") {
      let old: number = parseFloat(fieldset.getAttribute("oldValue"));
      let relative: number = value - old;
      fieldset.setAttribute("oldValue", value.toString());
      value = relative;
    }
    value *= factor;
    fieldset.querySelector("output").textContent = format(value);
    return value;
  }

  function hndModeInput(_event: Event): void {
    let target: HTMLInputElement = document.querySelector("input#Passive");
    rateDispatchOutput = 100;
    if (target.checked) {
      rateDispatchOutput = 0;
      update();
    }
    controlProportional.setRateDispatchOutput(rateDispatchOutput);
    controlDifferential.setRateDispatchOutput(rateDispatchOutput);
    controlIntegral.setRateDispatchOutput(rateDispatchOutput);
  }

  function hndControlInput(_event: Event): void {
    let target: HTMLInputElement = <HTMLInputElement>_event.target;
    if (target.type != "range")
      return;

    let value: number = updateFieldsetOutput(target);
    controlProportional.setInput(value);
    controlDifferential.setInput(value);
    controlIntegral.setInput(value);

    let signals: HTMLTextAreaElement = document.querySelector("textarea");
    signals.textContent += target.parentElement.id + ": " + format(value) + "\n";
    signals.scrollTop = signals.scrollHeight;

  }

  function hndControlParameters(_event: InputEvent, _control: ƒ.Control): void {
    let target: HTMLInputElement = <HTMLInputElement>_event.target;
    let fieldset: HTMLFieldSetElement = <HTMLFieldSetElement>_event.currentTarget;
    let value: number = parseFloat(target.value);
    if (target.name == "Delay")
      _control.setDelay(value);
    else
      _control.setFactor(value);
  }

  function hndControlOutput(_event: CustomEvent, _fieldset: HTMLFieldSetElement): void {
    let control: ƒ.Control = <ƒ.Control>_event.target;
    let slider: HTMLInputElement = _fieldset.querySelector("input[type=range]");
    let value: number;
    if (_event.detail)
      value = _event.detail.output;
    else
      value = control.getOutput();
    slider.value = value.toString();
    slider.parentElement.querySelector("output").textContent = format(value);
    updateMeter(_fieldset);
  }

  function update(): void {
    updateMeter(document);

    controlProportional.dispatchEvent(new Event(ƒ.EVENT_CONTROL.OUTPUT));
    controlDifferential.dispatchEvent(new Event(ƒ.EVENT_CONTROL.OUTPUT));
    controlIntegral.dispatchEvent(new Event(ƒ.EVENT_CONTROL.OUTPUT));

    let target: HTMLInputElement = document.querySelector("input#Passive");
    if (target.checked)
      window.setTimeout(update, 10);
  }

  function updateMeter(_ancestor: HTMLElement | HTMLDocument): void {
    let meter: HTMLMeterElement = _ancestor.querySelector("meter");
    meter.value = (meter.value + 0.01) % 1;
  }

  function format(_value: number): string {
    return _value.toFixed(4).padStart(7, "+");
  }
} 