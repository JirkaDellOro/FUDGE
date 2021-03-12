namespace FudgeUserInterface {
  import ƒ = FudgeCore;

  export class DetailsArray extends Details {

    constructor(_legend: string) {
      super(_legend, "Array");
    }

    public setContent(_content: HTMLDivElement): void {
      super.setContent(_content);
      for (let child of this.content.children as HTMLCollectionOf<HTMLElement>) {
        this.addEventListeners(child);
      }
    }

    public getMutator(): ƒ.Mutator {
      let mutator: ƒ.Mutator[] = [];

      for (let child of this.content.children as HTMLCollectionOf<CustomElement>) {
        mutator.push(child.getMutatorValue());
      }
      return mutator;
    }

    private addEventListeners(_child: HTMLElement): void {
      _child.draggable = true;
      _child.addEventListener(EVENT.DRAG_START, this.hndDragStart);
      _child.addEventListener(EVENT.DROP, this.hndDrop);
      _child.addEventListener(EVENT.DRAG_OVER, this.hndDragOver);
      _child.addEventListener(EVENT.KEY_DOWN, this.hndkey, true);
      _child.tabIndex = 0;
    }

    private rearrange(_focus: number = undefined): void {
      let sequence: number[] = [];
      for (let child of this.content.children) {
        sequence.push(parseInt(child.getAttribute("label")));
      }
      this.setFocus(_focus);
      this.dispatchEvent(new CustomEvent(EVENT.REARRANGE_ARRAY, { bubbles: true, detail: { key: this.getAttribute("key"), sequence: sequence } }));

      let count: number = 0;
      for (let child of this.content.children as HTMLCollectionOf<CustomElement>) {
        child.setAttribute("label", count.toString());
        child.setAttribute("key", "ƒ" + count);
        child.setLabel(count.toString());
        console.log(child.tabIndex);
        count++;
      }

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

      let position: InsertPosition = keyDrag > keyDrop ? "beforebegin" : "afterend";
      if (_event.ctrlKey)
        drag = <HTMLElement>drag.cloneNode(true);
      if (_event.shiftKey)
        drag.parentNode.removeChild(drag);
      else
        drop.insertAdjacentElement(position, drag);

      this.rearrange();
      this.addEventListeners(drag);
      drag.focus();
    }

    private hndkey = (_event: KeyboardEvent): void => {
      let item: HTMLElement = <HTMLElement>_event.currentTarget;

      // only work on items of list, not their children
      if ((<HTMLElement>_event.target) != item)
        return;

      let focus: number = parseInt(item.getAttribute("label"));
      let sibling: HTMLElement = item;
      let insert: HTMLElement = item;
      let passEvent: boolean = false;

      switch (_event.code) {
        case ƒ.KEYBOARD_CODE.DELETE:
          item.parentNode.removeChild(item);
          this.rearrange(focus);
          break;
        case ƒ.KEYBOARD_CODE.ARROW_UP:
          if (!_event.altKey) {
            this.setFocus(--focus);
            break;
          }
          if (_event.shiftKey) {
            insert = <HTMLElement>item.cloneNode(true);
            this.addEventListeners(insert);
          } else
            sibling = <HTMLElement>item.previousSibling;
          if (sibling)
            sibling.insertAdjacentElement("beforebegin", insert);
          this.rearrange(--focus);
          break;
        case ƒ.KEYBOARD_CODE.ARROW_DOWN:
          if (!_event.altKey) {
            this.setFocus(++focus);
            break;
          }
          if (_event.shiftKey) {
            insert = <HTMLElement>item.cloneNode(true);
            this.addEventListeners(insert);
          } else
            sibling = <HTMLElement>item.nextSibling;
          if (sibling)
            sibling.insertAdjacentElement("afterend", insert);
          this.rearrange(++focus);
          break;
        default:
          passEvent = true;
      }

      if (!passEvent) {
        _event.stopPropagation();
      }
    }
  }

  customElements.define("ui-list", DetailsArray, { extends: "details" });
}