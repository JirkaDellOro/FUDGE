namespace ListControl {
  import ƒUi = FudgeUserInterface;

  export class List extends HTMLDivElement {
    public mutable: ƒ.MutableArray<ƒ.Mutable>;

    constructor(_array: ƒ.MutableArray<ƒ.Mutable>) {
      super();
      this.setContent(_array);
      this.addEventListener("input", this.mutateOnInput);
    }

    public setContent(_array: ƒ.MutableArray<ƒ.Mutable>): void {
      this.mutable = _array;
      this.innerHTML = "";
      this.appendChild(ƒUi.Generator.createInterfaceFromMutable(this.mutable));
    }

    public getMutator(): ƒ.Mutator {
      return ƒUi.Controller.getMutator(this.mutable, this);
    }

    protected mutateOnInput = async (_event: Event) => {
      let mutator: ƒ.Mutator = this.getMutator();
      console.log(mutator);
      await this.mutable.mutate(mutator);
      _event.stopPropagation();

      this.dispatchEvent(new Event(ƒ.EVENT.MUTATE, { bubbles: true }));
    }
  }
  customElements.define("list-array", List, { extends: "div" });
}