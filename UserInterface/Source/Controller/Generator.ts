/// <reference path="../../../Core/Build/FudgeCore.d.ts"/>

namespace FudgeUserInterface {
  import ƒ = FudgeCore;

  /**
   * Static class generating UI-domElements from the information found in [[ƒ.Mutable]]s and [[ƒ.Mutator]]s
   */
  export class Generator {
    /**
     * Creates a [[Controller]] from a [[FudgeCore.Mutable]] with an expandable or mutable set
     */
    public static createController(_mutable: ƒ.Mutable, _name?: string): Controller {
      let controller: Controller = new Controller(_mutable, Generator.createSetFromMutable(_mutable, _name));
      controller.updateUserInterface();
      return controller;
    }

    /**
     * Create a extendable or mutable set for the [[FudgeCore.Mutator]] or the [[FudgeCore.Mutable]]
     */
    public static createSetFromMutable(_mutable: ƒ.Mutable, _name?: string, _mutator?: ƒ.Mutator): Details {
      let name: string = _name || _mutable.constructor.name;
      let set: Details = Generator.createSet(name, _mutable.type);
      set.content.appendChild(Generator.createInterfaceFromMutable(_mutable, _mutator));
      return set;
    }

    /**
     * Create a div-Elements containing the interface for the [[FudgeCore.Mutator]] or the [[FudgeCore.Mutable]]
     */
    public static createInterfaceFromMutable(_mutable: ƒ.Mutable | ƒ.MutableArray<ƒ.Mutable>, _mutator?: ƒ.Mutator): HTMLDivElement {
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
            element = Generator.createSetFromMutable(subMutable, key, <ƒ.Mutator>mutator[key]);
          else //Idea: Display an enumerated select here
            element = new CustomElementTextInput({ key: key, label: key, value: type ? type.toString() : "?" });
        }
        div.appendChild(element);
        // div.appendChild(document.createElement("br"));
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
          let set: Details = Generator.createSet(key, "Set");
          set.content.appendChild(Generator.createInterfaceFromMutator(value));
          div.appendChild(set);
        }
        else
          div.appendChild(this.createMutatorElement(key, (<Object>value).constructor.name, value));
        // div.appendChild(document.createElement("br"));
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

    public static createSet(_key: string, _type: string): Details {
      let set: Details = new Details(_key);
      set.setAttribute("key", _key);
      set.setAttribute("type", _type);
      return set;
    }
  }
}


