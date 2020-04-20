/// <reference path="../../../Core/Build/FudgeCore.d.ts"/>

namespace FudgeUserInterface {
  import ƒ = FudgeCore;

  export class Generator {
    /**
     * Creates a userinterface for a [[FudgeCore.Mutable]]
     */
    public static createMutable(_mutable: ƒ.Mutable, _name?: string): Mutable {
      let mutable: Mutable = new Mutable(_mutable, this.createFieldsetFromMutable(_mutable, _name));
      return mutable;
    }

    public static createFieldsetFromMutable(_mutable: ƒ.Mutable, _name?: string, _mutator?: ƒ.Mutator): FoldableFieldSet {
      let name: string = _name || _mutable.constructor.name;
      let mutator: ƒ.Mutator = _mutator || _mutable.getMutator();
      let mutatorTypes: ƒ.MutatorAttributeTypes = _mutable.getMutatorAttributeTypes(mutator);
      let fieldset: FoldableFieldSet = Generator.createFoldableFieldset(name);

      Generator.addMutator(mutator, mutatorTypes, fieldset.content, _mutable);

      return fieldset;
    }

    public static addMutator(_mutator: ƒ.Mutator, _mutatorTypes: ƒ.MutatorAttributeTypes, _parent: HTMLElement, _mutable: ƒ.Mutable): void {
      try {

        for (let key in _mutatorTypes) {
          let type: Object = _mutatorTypes[key];
          let value: string = _mutator[key].toString();
          if (type instanceof Object) {
            //Type is Enum
            //
            Generator.createLabelElement(key, _parent);
            Generator.createDropdown(key, type, value, _parent);
          }
          else {
            console.log(type);
            switch (type) {
              case "Number":
                Generator.createLabelElement(key, _parent, { value: key });
                // Generator.createTextElement(key, _parent, { _value: value })
                let numValue: number = parseInt(value);
                Generator.createStepperElement(key, _parent, { value: numValue });
                break;
              case "Boolean":
                Generator.createLabelElement(key, _parent, { value: key });
                Generator.createCheckboxElement(key, (value == "true"), _parent);
                break;
              case "String":
                Generator.createLabelElement(key, _parent, { value: key });
                Generator.createTextElement(key, _parent, { value: value });
                break;
              // Some other complex subclass of Mutable
              default:
                let subMutable: ƒ.Mutable;
                // subMutable = (<ƒ.General>_mutable)[key];
                // subMutable = Object.getOwnPropertyDescriptor(_mutable, key).value;
                subMutable = Reflect.get(_mutable, key);
                let fieldset: FoldableFieldSet = Generator.createFieldsetFromMutable(subMutable, key, <ƒ.Mutator>_mutator[key]);
                _parent.appendChild(fieldset);
                break;
            }
          }
        }
      } catch (_error) {
        ƒ.Debug.fudge(_error);
      }
    }

    public static createDropdown(_name: string, _content: Object, _value: string, _parent: HTMLElement, _cssClass?: string): HTMLSelectElement {
      let dropdown: HTMLSelectElement = document.createElement("select");
      // TODO: unique ids
      // dropdown.id = _name;
      dropdown.name = _name;
      for (let value in _content) {
        let entry: HTMLOptionElement = document.createElement("option");
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

    // public static createFieldset(_legend: string, _parent: HTMLElement, _cssClass?: string): HTMLFieldSetElement {
    //   let cntfieldset: HTMLFieldSetElement = document.createElement("fieldset");
    //   cntfieldset.id = _legend;
    //   let legend: HTMLLegendElement = document.createElement("legend");
    //   legend.innerHTML = _legend;
    //   cntfieldset.appendChild(legend);
    //   _parent.appendChild(cntfieldset);
    //   return cntfieldset;
    // }

    public static createFoldableFieldset(_legend: string): FoldableFieldSet {
      let cntFoldFieldset: FoldableFieldSet = new FoldableFieldSet(_legend);
      //TODO: unique ids
      // cntFoldFieldset.id = _legend;
      cntFoldFieldset.name = _legend;
      return cntFoldFieldset;
    }

    public static createLabelElement(_name: string, _parent: HTMLElement, params: { value?: string, cssClass?: string } = {}): HTMLLabelElement {
      let label: HTMLLabelElement = document.createElement("label");
      if (params.value == undefined)
        params.value = _name;
      label.innerText = params.value;
      if (params.cssClass != undefined)
        label.classList.add(params.cssClass);
      label.setAttribute("name", _name);
      _parent.appendChild(label);

      return label;
    }

    public static createTextElement(_name: string, _parent: HTMLElement, params: { value?: string, cssClass?: string } = {}): HTMLInputElement {
      let text: HTMLInputElement = document.createElement("input");
      if (params.value == undefined)
        params.value = "";
      if (!params.cssClass == undefined)
        text.classList.add(params.cssClass);
      //TODO: ids must be unique
      // text.id = _name;
      text.name = _name;
      text.value = params.value;
      _parent.appendChild(text);

      return text;
    }

    public static createCheckboxElement(_name: string, _checked: boolean, _parent: HTMLElement, _cssClass?: string): HTMLInputElement {
      let checkbox: HTMLInputElement = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = _checked;
      checkbox.classList.add(_cssClass);
      checkbox.name = _name;
      // TODO: try to stick to conventions and make ids unique...
      // checkbox.id = _name;
      _parent.appendChild(checkbox);
      return checkbox;
    }

    public static createStepperElement(_name: string, _parent: HTMLElement, params: { value?: number, min?: number, max?: number, cssClass?: string } = {}): Stepper {
      if (params.value == undefined)
        params.value = 0;
      let stepper: Stepper = new Stepper(_name, { value: params.value });
      _parent.appendChild(stepper);
      return stepper;
    }
  }
}


