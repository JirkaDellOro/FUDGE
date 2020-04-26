// / <reference types="../../../Core/Build/FudgeCore"/>
namespace FudgeUserInterface {
  import ƒ = FudgeCore;

  /**
   * Connects a [[Mutable]] to a DOM-Element and synchronizes that mutable with the mutator stored within.
   * Updates the mutable on interaction with the element and the element in time intervals.
   */
  export class Controller {
    // TODO: examine the use of the attribute key vs name. Key signals the use by FUDGE while name is standard and supported by forms
    public domElement: HTMLElement;
    protected timeUpdate: number = 190;
    /** Refererence to the [[FudgeCore.Mutable]] this ui refers to */
    protected mutable: ƒ.Mutable;
    /** [[FudgeCore.Mutator]] used to convey data to and from the mutable*/
    protected mutator: ƒ.Mutator;

    constructor(_mutable: ƒ.Mutable, _ui: HTMLElement) {
      this.domElement = _ui;
      this.mutable = _mutable;
      this.mutator = _mutable.getMutator();
      // TODO: examine, if this should register to one common interval, instead of each installing its own.
      window.setInterval(this.refresh, this.timeUpdate);
      this.domElement.addEventListener("input", this.mutateOnInput);
    }

    // TODO: optimize updates with cascade of delegates instead of switches
    public getMutator(_mutable: ƒ.Mutable = this.mutable, _domElement: HTMLElement = this.domElement, _mutator?: ƒ.Mutator, _types?: ƒ.Mutator): ƒ.Mutator {
      let mutator: ƒ.Mutator = _mutator || _mutable.getMutator();
      let mutatorTypes: ƒ.MutatorAttributeTypes = _types || _mutable.getMutatorAttributeTypes(mutator);

      for (let key in mutator) {
        let element: HTMLElement = _domElement.querySelector(`[key=${key}]`);
        if (element == null)
          return mutator;

        if (element instanceof CustomElement)
          mutator[key] = (<CustomElement>element).getMutatorValue();
        else if (mutatorTypes[key] instanceof Object)
          (<HTMLSelectElement>element).value = <string>mutator[key];
        else {
          let subMutator: ƒ.Mutator = Reflect.get(mutator, key);
          let subMutable: ƒ.Mutable;
          subMutable = Reflect.get(_mutable, key);
          let subTypes: ƒ.Mutator = subMutable.getMutatorAttributeTypes(subMutator);
          if (subMutable instanceof ƒ.Mutable)
            mutator[key] = this.getMutator(subMutable, element, subMutator, subTypes);
        }
      }
      return mutator;
    }

    public updateUserInterface(_mutable: ƒ.Mutable = this.mutable, _domElement: HTMLElement = this.domElement): void {
      let mutator: ƒ.Mutator = _mutable.getMutator();
      let mutatorTypes: ƒ.MutatorAttributeTypes = _mutable.getMutatorAttributeTypes(mutator);
      for (let key in mutator) {
        let element: CustomElement = <CustomElement>_domElement.querySelector(`[key=${key}]`);
        if (!element)
          continue;

        if (element instanceof CustomElement && element != document.activeElement)
          element.setMutatorValue(mutator[key]);
        else if (mutatorTypes[key] instanceof Object)
          element.setMutatorValue(mutator[key]);
        else {
          let fieldset: HTMLFieldSetElement = <HTMLFieldSetElement><HTMLElement>element;
          let subMutable: ƒ.Mutable = Reflect.get(_mutable, key);
          if (subMutable instanceof ƒ.Mutable)
            this.updateUserInterface(subMutable, fieldset);
        }
      }
    }

    protected mutateOnInput = (_event: Event) => {
      this.mutator = this.getMutator();
      this.mutable.mutate(this.mutator);
      _event.stopPropagation();
    }

    protected refresh = (_event: Event) => {
      //TODO: this.mutator is updated but then not used in updateUserInterface. Instead, the mutator is created again there...
      this.mutable.updateMutator(this.mutator);
      this.updateUserInterface();
    }
  }
}
