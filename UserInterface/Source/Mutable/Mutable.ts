// / <reference types="../../../Core/Build/FudgeCore"/>
namespace FudgeUserInterface {
  import ƒ = FudgeCore;

  /**
   * Connects a [[FudgeCode.Mutable]] to a Userinterfaced and synchronizes that mutable with the mutator stored within.
   * Updates the mutable on interaction with the user interface and the user interface in time intervals.
   */
  export class Mutable {
    // TODO: examine the use of the attribute key vs name. Key signals the use by FUDGE while name is standard and supported by forms
    public ui: HTMLElement;
    protected timeUpdate: number = 190;
    /** Refererence to the [[FudgeCore.Mutable]] this ui refers to */
    protected mutable: ƒ.Mutable;
    /** [[FudgeCore.Mutator]] used to convey data to and from the mutable*/
    protected mutator: ƒ.Mutator;

    constructor(_mutable: ƒ.Mutable, _ui: HTMLElement) {
      this.ui = _ui;
      this.mutable = _mutable;
      this.mutator = _mutable.getMutator();
      // TODO: examine, if ui-Mutables should register to one common interval, instead of each installing its own.
      window.setInterval(this.refresh, this.timeUpdate);
      this.ui.addEventListener("input", this.mutateOnInput);
    }

    // TODO: optimize updates with cascade of delegates instead of switches

    public updateMutator(_mutable: ƒ.Mutable = this.mutable, _ui: HTMLElement = this.ui, _mutator?: ƒ.Mutator, _types?: ƒ.Mutator): ƒ.Mutator {
      let mutator: ƒ.Mutator = _mutator || _mutable.getMutator();
      let mutatorTypes: ƒ.MutatorAttributeTypes = _types || _mutable.getMutatorAttributeTypes(mutator);
      for (let key in mutator) {
        if (this.ui.querySelector(`[key=${key}]`) != null) {
          let type: Object = mutatorTypes[key];
          if (type instanceof Object) {
            let selectElement: HTMLSelectElement = <HTMLSelectElement>_ui.querySelector(`[key=${key}]`);
            selectElement.value = <string>mutator[key];
          }
          else {
            let element: CustomElement = <CustomElement>_ui.querySelector(`[key=${key}]`);
            // let input: HTMLInputElement = <HTMLInputElement>element;
            switch (type) {
              case "Boolean":
                mutator[key] = element.getMutatorValue(); // .checked;
                break;
              case "String":
                mutator[key] = element.getMutatorValue(); // .checked;
              case "Number":
                mutator[key] = element.getMutatorValue(); // .checked;
                // mutator[key] = input.value;
                break;
              default:
                // let subMutator: ƒ.Mutator = (<ƒ.General>mutator)[key];
                let subMutator: ƒ.Mutator = Reflect.get(mutator, key);
                let subMutable: ƒ.Mutable;
                // subMutable = (<ƒ.General>_mutable)[key];
                subMutable = Reflect.get(_mutable, key);
                let subTypes: ƒ.Mutator = subMutable.getMutatorAttributeTypes(subMutator);
                if (subMutable instanceof ƒ.Mutable)
                  mutator[key] = this.updateMutator(subMutable, element, subMutator, subTypes);
                break;
            }
          }
        }
      }
      return mutator;
    }

    public updateUserInterface(_mutable: ƒ.Mutable = this.mutable, _ui: HTMLElement = this.ui): void {
      let mutator: ƒ.Mutator = _mutable.getMutator();
      let mutatorTypes: ƒ.MutatorAttributeTypes = _mutable.getMutatorAttributeTypes(mutator);
      for (let key in mutator) {
        let element: CustomElement = <CustomElement>_ui.querySelector(`[key=${key}]`);
        // TODO: examine if there is a reason for testing this.ui here instead of element...!
        if (this.ui.querySelector(`[key=${key}]`) != null) {
          let type: Object = mutatorTypes[key];
          if (type instanceof Object) {
            element.setMutatorValue(mutator[key]);
          }
          else {
            switch (type) {
              case "Boolean":
                // let checkbox: HTMLInputElement = <HTMLInputElement>_ui.querySelector(`[name=${key}]`);
                // (<HTMLInputElement>element).checked = <boolean>mutator[key];
                element.setMutatorValue(mutator[key]);
                break;
              case "String":
                // let textfield: HTMLInputElement = <HTMLInputElement>_ui.querySelector(`[name=${key}]`);
                // (<HTMLInputElement>element).value = <string>mutator[key];
                element.setMutatorValue(mutator[key]);
                break;
              case "Number":
                if (document.activeElement != element) {
                  // (<HTMLInputElement>element).value = <string>mutator[key];
                  element.setMutatorValue(mutator[key]);
                }
                break;
              default:
                let fieldset: HTMLFieldSetElement = <HTMLFieldSetElement><HTMLElement>element;
                // t/slint:disable no-any
                // let subMutable: ƒ.Mutable = (<any>_mutable)[key];
                let subMutable: ƒ.Mutable = Reflect.get(_mutable, key);
                if (subMutable instanceof ƒ.Mutable)
                  this.updateUserInterface(subMutable, fieldset);
                break;
            }
          }
        }
      }
    }

    protected mutateOnInput = (_event: Event) => {
      this.mutator = this.updateMutator();
      this.mutable.mutate(this.mutator);
      _event.stopPropagation();
    }

    protected refresh = (_event: Event) => {
      this.mutable.updateMutator(this.mutator);
      this.updateUserInterface();
    }
  }
}
