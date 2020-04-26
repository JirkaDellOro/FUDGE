/// <reference path="../../../Core/Build/FudgeCore.d.ts"/>

namespace FudgeUserInterface {
  import ƒ = FudgeCore;

  export class Generator {
    /**
     * Creates a userinterface for a [[FudgeCore.Mutable]]
     */
    public static createMutable(_mutable: ƒ.Mutable, _name?: string): Controller {
      let mutable: Controller = new Controller(_mutable, Generator.createFieldSetFromMutable(_mutable, _name));
      mutable.updateUserInterface();
      return mutable;
    }

    public static createFieldSetFromMutable(_mutable: ƒ.Mutable, _name?: string, _mutator?: ƒ.Mutator): FoldableFieldSet {
      let name: string = _name || _mutable.constructor.name;
      let mutator: ƒ.Mutator = _mutator || _mutable.getMutator();
      let mutatorTypes: ƒ.MutatorAttributeTypes = _mutable.getMutatorAttributeTypes(mutator);
      let fieldset: FoldableFieldSet = Generator.createFoldableFieldset(name);

      for (let key in mutatorTypes) {
        let type: Object = mutatorTypes[key];
        let value: Object = mutator[key];
        let element: HTMLElement = Generator.createMutatorElement(key, type, value);
        if (!element) {
          let subMutable: ƒ.Mutable;
          subMutable = Reflect.get(_mutable, key);
          if (subMutable instanceof ƒ.Mutable)
            element = Generator.createFieldSetFromMutable(subMutable, key, <ƒ.Mutator>mutator[key]);
          else //HACK! Display an enumerated select here
            element = new CustomElementTextInput({ key: key, label: key, value: type.toString() });
          // let fieldset: FoldableFieldSet = Generator.createFieldsetFromMutable(subMutable, key, <ƒ.Mutator>_mutator[key]);
          // _parent.appendChild(fieldset);
        }
        fieldset.content.appendChild(element);
      }
      return fieldset;
    }

    public static createMutatorElement(_key: string, _type: Object, _value: Object): HTMLElement {
      let element: HTMLElement;
      try {
        if (_type instanceof Object) {
          //Type is Enum
          element = document.createElement("span");
          Generator.createLabelElement(_key, element);
          Generator.createDropdown(_key, _type, _value.toString(), element);
        }
        else {
          // TODO: remove switch and use registered custom elements instead
          let elementType: typeof CustomElement = CustomElement.get(<ObjectConstructor>_value.constructor);
          // console.log("CustomElement", _type, elementType);
          if (!elementType)
            return element;
          // @ts-ignore: instantiate abstract class
          element = new elementType({ key: _key, label: _key, value: _value.toString() });
        }
      } catch (_error) {
        ƒ.Debug.fudge(_error);
      }
      return element;
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

    public static createFoldableFieldset(_key: string): FoldableFieldSet {
      let cntFoldFieldset: FoldableFieldSet = new FoldableFieldSet(_key);
      //TODO: unique ids
      // cntFoldFieldset.id = _legend;
      cntFoldFieldset.setAttribute("key", _key);
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


    // public static createFieldset(_legend: string, _parent: HTMLElement, _cssClass?: string): HTMLFieldSetElement {
    //   let cntfieldset: HTMLFieldSetElement = document.createElement("fieldset");
    //   cntfieldset.id = _legend;
    //   let legend: HTMLLegendElement = document.createElement("legend");
    //   legend.innerHTML = _legend;
    //   cntfieldset.appendChild(legend);
    //   _parent.appendChild(cntfieldset);
    //   return cntfieldset;
    // }
    
    //   public static createTextElement(_name: string, _parent: HTMLElement, params: { value?: string, cssClass?: string } = {}): HTMLInputElement {
    //     let text: HTMLInputElement = document.createElement("input");
    //     if (params.value == undefined)
    //       params.value = "";
    //     if (!params.cssClass == undefined)
    //       text.classList.add(params.cssClass);
    //     //TODO: ids must be unique
    //     // text.id = _name;
    //     text.name = _name;
    //     text.value = params.value;
    //     _parent.appendChild(text);

    //     return text;
    //   }

    //   public static createCheckboxElement(_name: string, _checked: boolean, _parent: HTMLElement, _cssClass?: string): HTMLInputElement {
    //     let checkbox: HTMLInputElement = document.createElement("input");
    //     checkbox.type = "checkbox";
    //     checkbox.checked = _checked;
    //     checkbox.classList.add(_cssClass);
    //     checkbox.name = _name;
    //     // TODO: try to stick to conventions and make ids unique...
    //     // checkbox.id = _name;
    //     _parent.appendChild(checkbox);
    //     return checkbox;
    //   }

    //   public static createStepperElement(_name: string, _parent: HTMLElement, params: { value?: number, min?: number, max?: number, cssClass?: string } = {}): Stepper {
    //     if (params.value == undefined)
    //       params.value = 0;
    //     let stepper: Stepper = new Stepper(_name, { value: params.value });
    //     _parent.appendChild(stepper);
    //     return stepper;
    //   }
  }
}


