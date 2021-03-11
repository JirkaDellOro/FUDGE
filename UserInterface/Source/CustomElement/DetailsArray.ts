namespace FudgeUserInterface {
  import ƒ = FudgeCore;

  export class DetailsArray extends Details {
    // public mutable: ƒ.MutableArray<ƒ.Mutable>;

    constructor(_legend: string) {
      super(_legend);
    }

    public setContent(_content: HTMLDivElement): void {
      super.setContent(_content);
      // this.mutable = _array;
      // this.removeChild(this.content);
      // this.content = Generator.createInterfaceFromMutable(this.mutable);
      // this.appendChild(this.content);
      for (let child of this.content.children as HTMLCollectionOf<HTMLElement>) {
        child.draggable = true;
        child.addEventListener(EVENT.DRAG_START, this.hndDragStart);
        child.addEventListener(EVENT.DROP, this.hndDrop);
        child.addEventListener(EVENT.DRAG_OVER, this.hndDragOver);
        child.addEventListener(EVENT.KEY_DOWN, this.hndkey, true);
        child.tabIndex = 0;
      }
    }


    public getMutator(): ƒ.Mutator {
      let mutator: ƒ.Mutator[] = [];

      for (let child of this.content.children as HTMLCollectionOf<CustomElement>) {
        mutator.push(child.getMutatorValue());
      }
      return mutator;
    }

    // protected mutateOnInput = async (_event: Event) => {
    //   let mutator: ƒ.Mutator = this.getMutator();
    //   console.log(mutator);
    //   await this.mutable.mutate(mutator);
    //   _event.stopPropagation();

    //   this.dispatchEvent(new Event(ƒ.EVENT.MUTATE, { bubbles: true }));
    // }

    private rearrangeMutable(_focus: number = undefined): void {
      let sequence: number[] = [];
      for (let child of this.content.children) {
        sequence.push(parseInt(child.getAttribute("label")));
      }
      console.log(sequence);
      // this.mutable.rearrange(sequence);

      // this.setContent(this.mutable);
      // Controller.updateUserInterface(this.mutable, this);
      this.setFocus(_focus);
      this.dispatchEvent(new CustomEvent(EVENT.REARRANGE_ARRAY, { bubbles: true, detail: { key: this.getAttribute("key"), sequence: sequence }}));
      this.dispatchEvent(new Event(EVENT.INPUT, { bubbles: true }));
    }

    private setFocus(_focus: number = undefined): void {
      if (_focus == undefined)
        return;
      _focus = Math.max(0, Math.min(_focus, this.content.children.length - 1));
      (<HTMLElement>this.content.children[_focus]).focus();
    }

    private hndDragStart = (_event: DragEvent): void => {
      // _event.preventDefault; 
      let keyDrag: string = (<HTMLElement>_event.currentTarget).getAttribute("key");
      _event.dataTransfer.setData("index", keyDrag);
      console.log(keyDrag);
    }

    private hndDragOver = (_event: DragEvent): void => {
      _event.preventDefault();
      if (_event.ctrlKey)
        _event.dataTransfer.dropEffect = "copy";
      if (_event.shiftKey)
        _event.dataTransfer.dropEffect = "link";
    }

    private hndDrop = (_event: DragEvent): void => {
      let drop: HTMLElement = <HTMLElement>_event.currentTarget;
      let keyDrop: string = drop.getAttribute("key");
      let keyDrag: string = _event.dataTransfer.getData("index");
      let drag: HTMLElement = this.querySelector(`[key=${keyDrag}]`);

      let insertion: InsertPosition = keyDrag > keyDrop ? "beforebegin" : "afterend";
      if (_event.ctrlKey)
        drag = <HTMLElement>drag.cloneNode(false);
      if (_event.shiftKey)
        drag.parentNode.removeChild(drag);
      else
        drop.insertAdjacentElement(insertion, drag);

      this.rearrangeMutable();
    }

    private hndkey = (_event: KeyboardEvent): void => {
      let item: HTMLElement = <HTMLElement>_event.currentTarget;

      // only work on items of list, not their children
      if ((<HTMLElement>_event.target) != item)
        return;

      let focus: number = parseInt(item.getAttribute("label"));
      let sibling: HTMLElement = item;
      let passEvent: boolean = false;

      switch (_event.code) {
        case ƒ.KEYBOARD_CODE.DELETE:
          item.parentNode.removeChild(item);
          this.rearrangeMutable(focus);
          break;
        case ƒ.KEYBOARD_CODE.ARROW_UP:
          if (!_event.altKey) {
            this.setFocus(--focus);
            break;
          }
          _event.shiftKey ? item = <HTMLElement>item.cloneNode(false) : sibling = <HTMLElement>item.previousSibling;
          if (sibling)
            sibling.insertAdjacentElement("beforebegin", item);
          this.rearrangeMutable(--focus);
          break;
        case ƒ.KEYBOARD_CODE.ARROW_DOWN:
          if (!_event.altKey) {
            this.setFocus(++focus);
            break;
          }
          _event.shiftKey ? item = <HTMLElement>item.cloneNode(false) : sibling = <HTMLElement>item.nextSibling;
          if (sibling)
            sibling.insertAdjacentElement("afterend", item);
          this.rearrangeMutable(++focus);
          break;
        default:
          passEvent = true;
      }

      if (!passEvent) {
        _event.stopPropagation();
        // this.mutateOnInput(null);
      }
    }
  }

  customElements.define("ui-list", DetailsArray, { extends: "details" });
}