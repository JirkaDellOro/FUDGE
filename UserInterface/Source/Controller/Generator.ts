/// <reference path="../../../Core/Build/FudgeCore.d.ts"/>

namespace FudgeUserInterface {
  import ƒ = FudgeCore;

  /**
   * Static class generating UI-domElements from the information found in [[ƒ.Mutable]]s and [[ƒ.Mutator]]s
   */
  export class Generator {
    /**
     * Creates a [[Controller]] from a [[FudgeCore.Mutable]] with expandable details or a list
     */
    public static createController(_mutable: ƒ.Mutable, _name?: string): Controller {
      let controller: Controller = new Controller(_mutable, Generator.createDetailsFromMutable(_mutable, _name));
      controller.updateUserInterface();
      return controller;
    }

    /**
     * Create extendable details for the [[FudgeCore.Mutator]] or the [[FudgeCore.Mutable]]
     */
    public static createDetailsFromMutable(_mutable: ƒ.Mutable | ƒ.MutableArray<ƒ.Mutable>, _name?: string, _mutator?: ƒ.Mutator): Details | DetailsArray {
      let name: string = _name || _mutable.constructor.name;

      let details: Details | DetailsArray;
      if (_mutable instanceof ƒ.MutableArray)
        details = new DetailsArray(name);
      else if (_mutable instanceof ƒ.Mutable)
        details = new Details(name, _mutable.type);
      else return null;

      details.setContent(Generator.createInterfaceFromMutable(_mutable, _mutator));
      return details;
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
          element = Generator.createDetailsFromMutable(subMutable, key, <ƒ.Mutator>mutator[key]);
          if (!element)
            //Idea: Display an enumerated select here
            element = new CustomElementTextInput({ key: key, label: key, value: type ? type.toString() : "?" });
        }
        div.appendChild(element);
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
        // if (value === undefined) // at this time (1/23) adding a property to an animation in the editor creates an empty keys list...
        // {
        //   div.appendChild(this.createMutatorElement(key, Object, {})); 
        //   continue;
        // }
        if (value instanceof Object) {
          // let details: Details = Generator.createDetails(key, "Details");
          let details: Details = new Details(key, "Details");
          details.setContent(Generator.createInterfaceFromMutator(value));
          div.appendChild(details);
        }
        else
          div.appendChild(this.createMutatorElement(key, (<Object>value).constructor.name, value));
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
          let elementType: typeof CustomElement = CustomElement.get("Object");
          // @ts-ignore: instantiate abstract class
          element = new elementType({ key: _key, label: _key, value: _value.toString() }, _type);
        }
        // TODO: delete?
        else if (_value instanceof ƒ.MutableArray) {
          console.log("MutableArray");
          // insert Array-Controller!
        }
        else {
          let elementType: typeof CustomElement = CustomElement.get(_type);
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

    // public static createDetails(_key: string, _type: string): Details {
    //   let details: Details = new Details(_key);
    //   // details.setAttribute("type", _type);
    //   return details;
    // }
    // public static createDetailsArray(_key: string, _type: string): Details {
    //   let details: Details = new DetailsArray(_key);
    //   details.setAttribute("key", _key);
    //   details.setAttribute("type", _type);
    //   return details;
    // }
  }
}


