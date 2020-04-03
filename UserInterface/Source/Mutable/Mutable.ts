// / <reference types="../../../Core/Build/FudgeCore"/>
namespace FudgeUserInterface {
  import ƒ = FudgeCore;

  export abstract class Mutable {
    protected timeUpdate: number = 190;
    protected root: HTMLElement;
    protected mutable: ƒ.Mutable;
    protected mutator: ƒ.Mutator;

    constructor(mutable: ƒ.Mutable) {
      this.root = document.createElement("div");
      this.mutable = mutable;
      this.mutator = mutable.getMutator();
      window.setInterval(this.refresh, this.timeUpdate);
      this.root.addEventListener("input", this.mutateOnInput);
    }

    protected mutateOnInput = (_e: Event) => {
      this.mutator = this.updateMutator(this.mutable, this.root);
      this.mutable.mutate(this.mutator);

    }

    protected refresh = (_e: Event) => {
      this.mutable.updateMutator(this.mutator);
      this.update(this.mutable, this.root);
    }

    protected updateMutator(_mutable: ƒ.Mutable, _root: HTMLElement, _mutator?: ƒ.Mutator, _types?: ƒ.Mutator): ƒ.Mutator {
      let mutator: ƒ.Mutator = _mutator || _mutable.getMutator();
      let mutatorTypes: ƒ.MutatorAttributeTypes = _types || _mutable.getMutatorAttributeTypes(mutator);
      for (let key in mutator) {
        if (this.root.querySelector("#" + key) != null) {
          let type: Object = mutatorTypes[key];
          if (type instanceof Object) {
            let selectElement: HTMLSelectElement = <HTMLSelectElement>_root.querySelector("#" + key);
            selectElement.value = <string>mutator[key];
          }
          else {
            let element: HTMLElement = _root.querySelector("#" + key);
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
                let subMutator: ƒ.Mutator = (<ƒ.General>mutator)[key];
                let subMutable: ƒ.Mutable;
                subMutable = (<ƒ.General>_mutable)[key];
                let subTypes: ƒ.Mutator = subMutable.getMutatorAttributeTypes(subMutator);
                mutator[key] = this.updateMutator(subMutable, element, subMutator, subTypes);
                break;
            }
          }
        }
      }
      return mutator;
    }

    protected update(_mutable: ƒ.Mutable, _root: HTMLElement): void {
      let mutator: ƒ.Mutator = _mutable.getMutator();
      let mutatorTypes: ƒ.MutatorAttributeTypes = _mutable.getMutatorAttributeTypes(mutator);
      for (let key in mutator) {
        if (this.root.querySelector("#" + key) != null) {
          let type: Object = mutatorTypes[key];
          if (type instanceof Object) {
            let selectElement: HTMLSelectElement = <HTMLSelectElement>_root.querySelector("#" + key);
            selectElement.value = <string>mutator[key];
          }
          else {
            switch (type) {
              case "Boolean":
                let checkbox: HTMLInputElement = <HTMLInputElement>_root.querySelector("#" + key);
                checkbox.checked = <boolean>mutator[key];
                break;
              case "String":
                let textfield: HTMLInputElement = <HTMLInputElement>_root.querySelector("#" + key);
                textfield.value = <string>mutator[key];
                break;
              case "Number":
                let stepper: HTMLInputElement = <HTMLInputElement>_root.querySelector("#" + key);
                if (document.activeElement != stepper) {
                  stepper.value = <string>mutator[key];
                }
                break;
              default:
                let fieldset: HTMLFieldSetElement = <HTMLFieldSetElement>_root.querySelector("#" + key);
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
