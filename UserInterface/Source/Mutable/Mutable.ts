// / <reference types="../../../Core/Build/FudgeCore"/>
namespace FudgeUserInterface {
  import ƒ = FudgeCore;

  export class Mutable {
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

    protected mutateOnInput = (_event: Event) => {
      this.mutator = this.updateMutator(this.mutable, this.ui);
      this.mutable.mutate(this.mutator);
      _event.stopPropagation();
    }

    protected refresh = (_event: Event) => {
      this.mutable.updateMutator(this.mutator);
      this.update(this.mutable, this.ui);
    }

    // TODO: optimize updates with cascade of delegates instead of switches

    protected updateMutator(_mutable: ƒ.Mutable, _ui: HTMLElement, _mutator?: ƒ.Mutator, _types?: ƒ.Mutator): ƒ.Mutator {
      let mutator: ƒ.Mutator = _mutator || _mutable.getMutator();
      let mutatorTypes: ƒ.MutatorAttributeTypes = _types || _mutable.getMutatorAttributeTypes(mutator);
      for (let key in mutator) {
        if (this.ui.querySelector(`[name=${key}]`) != null) {
          let type: Object = mutatorTypes[key];
          if (type instanceof Object) {
            let selectElement: HTMLSelectElement = <HTMLSelectElement>_ui.querySelector(`[name=${key}]`);
            selectElement.value = <string>mutator[key];
          }
          else {
            let element: HTMLElement = _ui.querySelector(`[name=${key}]`);
            let input: HTMLInputElement = <HTMLInputElement>element;
            switch (type) {
              case "Boolean":
                mutator[key] = input.checked;
                break;
              case "String":
              case "Number":
                mutator[key] = input.value;
                break;
              default:
                // let subMutator: ƒ.Mutator = (<ƒ.General>mutator)[key];
                let subMutator: ƒ.Mutator =  Reflect.get(mutator, key);
                let subMutable: ƒ.Mutable;
                // subMutable = (<ƒ.General>_mutable)[key];
                subMutable =  Reflect.get(_mutable, key);
                let subTypes: ƒ.Mutator = subMutable.getMutatorAttributeTypes(subMutator);
                mutator[key] = this.updateMutator(subMutable, element, subMutator, subTypes);
                break;
            }
          }
        }
      }
      return mutator;
    }

    protected update(_mutable: ƒ.Mutable, _ui: HTMLElement): void {
      let mutator: ƒ.Mutator = _mutable.getMutator();
      let mutatorTypes: ƒ.MutatorAttributeTypes = _mutable.getMutatorAttributeTypes(mutator);
      for (let key in mutator) {
        if (this.ui.querySelector(`[name=${key}]`) != null) {
          let type: Object = mutatorTypes[key];
          if (type instanceof Object) {
            let selectElement: HTMLSelectElement = <HTMLSelectElement>_ui.querySelector(`[name=${key}]`);
            selectElement.value = <string>mutator[key];
          }
          else {
            switch (type) {
              case "Boolean":
                let checkbox: HTMLInputElement = <HTMLInputElement>_ui.querySelector(`[name=${key}]`);
                checkbox.checked = <boolean>mutator[key];
                break;
              case "String":
                let textfield: HTMLInputElement = <HTMLInputElement>_ui.querySelector(`[name=${key}]`);
                textfield.value = <string>mutator[key];
                break;
              case "Number":
                let stepper: HTMLInputElement = <HTMLInputElement>_ui.querySelector(`[name=${key}]`);
                if (document.activeElement != stepper) {
                  stepper.value = <string>mutator[key];
                }
                break;
              default:
                let fieldset: HTMLFieldSetElement = <HTMLFieldSetElement>_ui.querySelector(`[name=${key}]`);
                // tslint:disable no-any
                let subMutable: ƒ.Mutable = (<any>_mutable)[key];
                this.update(subMutable, fieldset);
                break;
            }
          }
        }
      }
    }
  }
}
