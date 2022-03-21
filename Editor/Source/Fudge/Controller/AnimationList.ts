namespace Fudge {
  import ƒui = FudgeUserInterface;

  export class AnimationList {
    listRoot: HTMLElement;
    private mutator: ƒ.Mutator;
    private index: ƒ.Mutator;

    constructor(_mutator: ƒ.Mutator, _listContainer: HTMLElement) {
      this.mutator = _mutator;
      this.listRoot = document.createElement("ul");
      this.index = {};
      this.listRoot = this.buildFromMutator(this.mutator);
      _listContainer.append(this.listRoot);
      _listContainer.addEventListener(ƒui.EVENT.COLLAPSE, this.toggleCollapse);
      // _listContainer.addEventListener(ƒui.EVENT.UPDATE, this.collectMutator);
      _listContainer.addEventListener(ƒui.EVENT.MUTATE, this.collectMutator);
    }
    public getMutator(): ƒ.Mutator {
      return this.mutator;
    }

    public setMutator(_mutator: ƒ.Mutator): void {
      this.mutator = _mutator;
      let hule: HTMLUListElement = this.buildFromMutator(this.mutator);
      this.listRoot.replaceWith(hule);
      this.listRoot = hule;
    }

    public collectMutator = (): ƒ.Mutator => {
      let children: HTMLCollection = this.listRoot.children;
      // for (let child of children) {
      //   this.mutator[(<ƒui.CollapsableAnimationList>child).name] = (<ƒui.CollapsableAnimationList>child).mutator;
      // }
      ƒ.Debug.info(this.mutator);
      return this.mutator;
    }

    public getElementIndex(): ƒ.Mutator {
      return this.index;
    }
    public updateMutator(_update: ƒ.Mutator): void {
      this.mutator = this.updateMutatorEntry(_update, this.mutator);
      this.updateEntry(this.mutator, this.index);
    }

    private updateEntry(_update: ƒ.Mutator, _index: ƒ.Mutator): void {
      for (let key in _update) {
        if (typeof _update[key] == "object") {
          this.updateEntry(<ƒ.Mutator>_update[key], <ƒ.Mutator>_index[key]);
        }
        else if (typeof _update[key] == "string" || "number") {
          let element: HTMLInputElement = <HTMLInputElement>_index[key];
          element.value = <string>_update[key];
        }
      }
    }

    private updateMutatorEntry(_update: ƒ.Mutator, _toUpdate: ƒ.Mutator): ƒ.Mutator {
      let updatedMutator: ƒ.Mutator = _toUpdate;
      for (let key in _update) {
        if (typeof updatedMutator[key] == "object") {
          if (typeof updatedMutator[key] == "object") {
            updatedMutator[key] = this.updateMutatorEntry(<ƒ.Mutator>_update[key], <ƒ.Mutator>updatedMutator[key]);
          }
        }
        else if (typeof _update[key] == "string" || "number") {
          if (typeof updatedMutator[key] == "string" || "number") {
            updatedMutator[key] = _update[key];
          }
        }
      }
      return updatedMutator;
    }
    private buildFromMutator(_mutator: ƒ.Mutator): HTMLUListElement {
      let listRoot: HTMLUListElement = document.createElement("ul");
      // for (let key in _mutator) {
      //   let listElement: ƒui.CollapsableAnimationList = new ƒui.CollapsableAnimationList((<ƒ.Mutator>this.mutator[key]), key);
      //   listRoot.append(listElement);
      //   this.index[key] = listElement.getElementIndex();
      //   console.log(this.index);
      // }
      return listRoot;
    }

    private toggleCollapse = (_event: Event): void => {
      _event.preventDefault();
      // console.log(_event.target instanceof ƒui.CollapsableAnimationList);
      // if (_event.target instanceof ƒui.CollapsableAnimationList) {
      //   let target: ƒui.CollapsableAnimationList = <ƒui.CollapsableAnimationList>_event.target;
      //   target.collapse(target);
      // }
    }
  }
}