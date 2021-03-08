namespace FudgeUserInterface {
  import ƒ = FudgeCore;

  export class DetailsArray extends Details {
    public mutable: ƒ.MutableArray<ƒ.Mutable>;

    constructor(_legend: string, _array: ƒ.MutableArray<ƒ.Mutable>) {
      super(_legend);
      this.setContent(_array);
      this.addEventListener("input", this.mutateOnInput);
    }

    public setContent(_array: ƒ.MutableArray<ƒ.Mutable>): void {
      this.mutable = _array;
      // this.content.innerHTML = "";
      this.removeChild(this.content);
      this.content = Generator.createInterfaceFromMutable(this.mutable);
      this.appendChild(this.content);
      console.log(this);
      for (let child of this.content.children as HTMLCollectionOf<HTMLElement>) {
        child.draggable = true;
        child.addEventListener("dragstart", this.hndDragStart);
        child.addEventListener("drop", this.hndDrop);
        child.addEventListener("dragover", this.hndDragOver);
        child.addEventListener("keydown", this.hndkey, true);
        child.tabIndex = 0;
      }
    }


    public getMutator(): ƒ.Mutator {
      return Controller.getMutator(this.mutable, this);
    }

    protected mutateOnInput = async (_event: Event) => {
      let mutator: ƒ.Mutator = this.getMutator();
      // console.log(mutator);
      await this.mutable.mutate(mutator);
      _event.stopPropagation();

      this.dispatchEvent(new Event(ƒ.EVENT.MUTATE, { bubbles: true }));
    }

    private rearrangeMutable(_focus: number = undefined): void {
      let sequence: number[] = [];
      for (let child of this.content.children) {
        sequence.push(parseInt(child.getAttribute("label")));
      }
      console.log(sequence);
      this.mutable.rearrange(sequence);
      this.setContent(this.mutable);
      Controller.updateUserInterface(this.mutable, this);
      this.setFocus(_focus);
    }

    private setFocus(_focus: number = undefined): void {
      if (_focus == undefined)
        return;
      _focus = Math.min(_focus, this.content.children.length - 1);
      (<HTMLElement>this.content.children[_focus]).focus();
    }

    private hndDragStart = (_event: DragEvent): void => {
      // _event.preventDefault; 
      let keyDrag: string = (<HTMLElement>_event.currentTarget).getAttribute("key");
      _event.dataTransfer.setData("index", keyDrag);
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
        drag = <HTMLElement>drag.cloneNode(true);
      if (_event.shiftKey) {
        drag.parentNode.removeChild(drag);
      } else
        drop.insertAdjacentElement(insertion, drag);
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
          _event.shiftKey ? item = <HTMLElement>item.cloneNode(true) : sibling = <HTMLElement>item.previousSibling;
          if (!sibling)
            break;
          sibling.insertAdjacentElement("beforebegin", item);
          this.rearrangeMutable(--focus);
          break;
        case ƒ.KEYBOARD_CODE.ARROW_DOWN:
          if (!_event.altKey) {
            this.setFocus(++focus);
            break;
          }
          _event.shiftKey ? item = <HTMLElement>item.cloneNode(true) : sibling = <HTMLElement>item.nextSibling;
          if (!sibling)
            break;
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