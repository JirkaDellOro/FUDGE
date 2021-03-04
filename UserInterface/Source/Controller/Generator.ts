/// <reference path="../../../Core/Build/FudgeCore.d.ts"/>

namespace FudgeUserInterface {
  import ƒ = FudgeCore;

  /**
   * Static class generating UI-domElements from the information found in [[ƒ.Mutable]]s and [[ƒ.Mutator]]s
   */
  export class Generator {
    /**
     * Creates a [[Controller]] from a [[FudgeCore.Mutable]] using a CustomFieldSet
     */
    public static createController(_mutable: ƒ.Mutable, _name?: string): Controller {
      let controller: Controller = new Controller(_mutable, Generator.createFieldSetFromMutable(_mutable, _name));
      controller.updateUserInterface();
      return controller;
    }

    /**
     * Create a extendable fieldset for the [[FudgeCore.Mutator]] or the [[FudgeCore.Mutable]]
     */
    public static createFieldSetFromMutable(_mutable: ƒ.Mutable, _name?: string, _mutator?: ƒ.Mutator): ExpandableFieldSet {
      let name: string = _name || _mutable.constructor.name;
      let fieldset: ExpandableFieldSet = Generator.createExpendableFieldset(name, _mutable.type);
      fieldset.content.appendChild(Generator.createInterfaceFromMutable(_mutable, _mutator));
      return fieldset;
    }

    /**
     * Create a div-Elements containing the interface for the [[FudgeCore.Mutator]] or the [[FudgeCore.Mutable]]
     */
    public static createInterfaceFromMutable(_mutable: ƒ.Mutable, _mutator?: ƒ.Mutator): HTMLDivElement {
      let mutator: ƒ.Mutator = _mutator || _mutable.getMutatorForUserInterface();
      let mutatorTypes: ƒ.MutatorAttributeTypes = _mutable.getMutatorAttributeTypes(mutator);
      let div: HTMLDivElement = document.createElement("div");

      for (let key in mutatorTypes) {
        let type: Object = mutatorTypes[key];
        let value: Object = mutator[key];
        let element: HTMLElement = Generator.createMutatorElement(key, type, value);
        if (!element) {
          let subMutable: ƒ.Mutable;
          subMutable = Reflect.get(_mutable, key);
          if ((subMutable instanceof ƒ.MutableArray) || (subMutable instanceof ƒ.Mutable))
            element = Generator.createFieldSetFromMutable(subMutable, key, <ƒ.Mutator>mutator[key]);
          else //Idea: Display an enumerated select here
            element = new CustomElementTextInput({ key: key, label: key, value: type ? type.toString() : "?" });
          // let fieldset: FoldableFieldSet = Generator.createFieldsetFromMutable(subMutable, key, <ƒ.Mutator>_mutator[key]);
          // _parent.appendChild(fieldset);
        }
        div.appendChild(element);
        div.appendChild(document.createElement("br"));
      }
      return div;
    }

    /**
     * Create a div-Element containing the interface for the [[FudgeCore.Mutator]] 
     * Does not support nested mutators!
     */
    public static createInterfaceFromMutator(_mutator: ƒ.Mutator | Object): HTMLDivElement {
      let div: HTMLDivElement = document.createElement("div");
      for (let key in _mutator) {
        let value: Object = Reflect.get(_mutator, key);
        if (value instanceof Object) {
          let fieldset: ExpandableFieldSet = Generator.createExpendableFieldset(key, "Hallo");
          fieldset.content.appendChild(Generator.createInterfaceFromMutator(value));
          div.appendChild(fieldset);
        }
        else
          div.appendChild(this.createMutatorElement(key, (<Object>value).constructor.name, value));
        div.appendChild(document.createElement("br"));
      }
      return div;
    }

    /**
     * Create a specific CustomElement for the given data, using _key as identification
     */
    public static createMutatorElement(_key: string, _type: Object | string, _value: Object): HTMLElement {
      let element: HTMLElement;
      try {
        if (_type instanceof Object) {
          //TODO: refactor for enums and get rid of the two old generator functions
          // element = document.createElement("span");
          // Generator.createLabelElement(_key, element);
          // Generator.createDropdown(_key, _type, _value.toString(), element);

          let elementType: typeof CustomElement = CustomElement.get("Object");
          // @ts-ignore: instantiate abstract class
          element = new elementType({ key: _key, label: _key, value: _value.toString() }, _type);
          // (<CustomElement>element).setMutatorValue(_value);
        }
        else if (_value instanceof ƒ.MutableArray) {
          console.log("MutableArray");
          // insert Array-Controller!
        }
        else {
          // TODO: remove switch and use registered custom elements instead
          // let elementType: typeof CustomElement = CustomElement.get(<ObjectConstructor>_value.constructor);
          let elementType: typeof CustomElement = CustomElement.get(_type);
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

    /**
     * TODO: refactor for enums 
     */
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

    // TODO: implement CustomFieldSet and replace this
    public static createExpendableFieldset(_key: string, _type: string): ExpandableFieldSet {
      let cntFoldFieldset: ExpandableFieldSet = new ExpandableFieldSet(_key);
      //TODO: unique ids
      // cntFoldFieldset.id = _legend;
      cntFoldFieldset.setAttribute("key", _key);
      cntFoldFieldset.setAttribute("type", _type);
      return cntFoldFieldset;
    }

    //TODO: delete
    // public static createLabelElement(_name: string, _parent: HTMLElement, params: { value?: string, cssClass?: string } = {}): HTMLLabelElement {
    //   let label: HTMLLabelElement = document.createElement("label");
    //   if (params.value == undefined)
    //     params.value = _name;
    //   label.innerText = params.value;
    //   if (params.cssClass != undefined)
    //     label.classList.add(params.cssClass);
    //   label.setAttribute("name", _name);
    //   _parent.appendChild(label);

    //   return label;
    // }


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


