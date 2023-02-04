namespace FudgeUserInterface {
  import ƒ = FudgeCore;
  /**
   * Extension of tr-element that represents an object in a [[Table]]
   */
  export class TableItem<T extends Object> extends HTMLTableRowElement {
    public data: T = null;
    public controller: TableController<T>;

    public constructor(_controller: TableController<T>, _data: T) {
      super();
      this.controller = _controller;
      this.data = _data;
      // this.display = this.controller.getLabel(_data);
      // TODO: handle cssClasses
      this.create(this.controller.getHead());
      this.className = "table";

      this.addEventListener(EVENT.POINTER_UP, this.hndPointerUp);
      this.addEventListener(EVENT.KEY_DOWN, this.hndKey);
      this.addEventListener(EVENT.CHANGE, this.hndChange);
      // this.addEventListener(EVENT.DOUBLE_CLICK, this.hndDblClick);
      // this.addEventListener(EVENT_TREE.FOCUS_NEXT, this.hndFocus);
      // this.addEventListener(EVENT_TREE.FOCUS_PREVIOUS, this.hndFocus);

      this.draggable = true;
      this.addEventListener(EVENT.DRAG_START, this.hndDragStart);
      this.addEventListener(EVENT.DRAG_OVER, this.hndDragOver);

      // this.addEventListener(EVENT.UPDATE, this.hndUpdate);
    }

    /**
     * Returns attaches or detaches the [[CSS_CLASS.SELECTED]] to this item
     */
    public set selected(_on: boolean) {
      if (_on)
        this.classList.add(CSS_CLASS.SELECTED);
      else
        this.classList.remove(CSS_CLASS.SELECTED);
    }

    /**
     * Returns true if the [[TREE_CLASSES.SELECTED]] is attached to this item
     */
    public get selected(): boolean {
      return this.classList.contains(CSS_CLASS.SELECTED);
    }

    /**
     * Dispatches the [[EVENT.SELECT]] event
     * @param _additive For multiple selection (+Ctrl) 
     * @param _interval For selection over interval (+Shift)
     */
    public select(_additive: boolean, _interval: boolean = false): void {
      let event: CustomEvent = new CustomEvent(EVENT.SELECT, { bubbles: true, detail: { data: this.data, additive: _additive, interval: _interval } });
      this.dispatchEvent(event);
    }

    private create(_filter: TABLE[]): void {
      for (let entry of _filter) {
        let value: string = <string>Reflect.get(this.data, entry.key);
        let td: HTMLTableCellElement = document.createElement("td");
        let input: HTMLInputElement = document.createElement("input");
        input.type = "text";
        input.disabled = !entry.editable;
        input.readOnly = true;
        input.value = value;
        input.setAttribute("key", entry.key);

        input.addEventListener(EVENT.KEY_DOWN, this.hndInputEvent);
        input.addEventListener(EVENT.DOUBLE_CLICK, this.hndInputEvent);
        input.addEventListener(EVENT.FOCUS_OUT, this.hndChange);

        td.appendChild(input);
        this.appendChild(td);
      }
      this.tabIndex = 0;
    }

    private hndInputEvent = (_event: KeyboardEvent | MouseEvent): void => {
      if (_event instanceof KeyboardEvent && _event.code != ƒ.KEYBOARD_CODE.F2)
        return;

      let input: HTMLInputElement = <HTMLInputElement>_event.target;
      input.readOnly = false;
      input.focus();
    }

    private hndChange = (_event: Event): void => {
      let target: HTMLInputElement = <HTMLInputElement>_event.target;
      target.readOnly = true;
      let key: string = target.getAttribute("key");
      Reflect.set(this.data, key, target.value);
      this.focus();
    }

    private hndKey = (_event: KeyboardEvent): void => {
      _event.stopPropagation();
      if (_event.target != this)
        return;
      // if (!this.label.disabled)
      //   return;
      // let content: TreeList<T> = <TreeList<T>>this.querySelector("ul");

      switch (_event.code) {
        // case ƒ.KEYBOARD_CODE.ARROW_RIGHT:
        //   this.dispatchEvent(new KeyboardEvent(EVENT.FOCUS_NEXT, { bubbles: true, shiftKey: _event.shiftKey, ctrlKey: _event.ctrlKey }));
        //   break;
        // case ƒ.KEYBOARD_CODE.ARROW_LEFT:
        //   this.dispatchEvent(new KeyboardEvent(EVENT.FOCUS_PREVIOUS, { bubbles: true, shiftKey: _event.shiftKey, ctrlKey: _event.ctrlKey }));
        //   break;
        case ƒ.KEYBOARD_CODE.ARROW_DOWN:
          this.dispatchEvent(new KeyboardEvent(EVENT.FOCUS_NEXT, { bubbles: true, shiftKey: _event.shiftKey, ctrlKey: _event.ctrlKey }));
          break;
        case ƒ.KEYBOARD_CODE.ARROW_UP:
          this.dispatchEvent(new KeyboardEvent(EVENT.FOCUS_PREVIOUS, { bubbles: true, shiftKey: _event.shiftKey, ctrlKey: _event.ctrlKey }));
          break;
        case ƒ.KEYBOARD_CODE.SPACE:
          this.select(_event.ctrlKey, _event.shiftKey);
          break;
        case ƒ.KEYBOARD_CODE.ESC:
          this.dispatchEvent(new Event(EVENT.ESCAPE, { bubbles: true }));
          break;
        case ƒ.KEYBOARD_CODE.DELETE:
          this.dispatchEvent(new Event(EVENT.DELETE, { bubbles: true }));
          break;
        case ƒ.KEYBOARD_CODE.C:
          if (_event.ctrlKey || _event.metaKey) {
            _event.preventDefault();
            this.dispatchEvent(new Event(EVENT.COPY, { bubbles: true }));
          }
          break;
        case ƒ.KEYBOARD_CODE.V:
          if (_event.ctrlKey || _event.metaKey) {
            _event.preventDefault();
            this.dispatchEvent(new Event(EVENT.PASTE, { bubbles: true }));
          }
          break;
        case ƒ.KEYBOARD_CODE.X:
          if (_event.ctrlKey || _event.metaKey) {
            _event.preventDefault();
            this.dispatchEvent(new Event(EVENT.CUT, { bubbles: true }));
          }
          break;
      }
    }

    private hndDragStart = (_event: DragEvent): void => {
      // _event.stopPropagation();
      this.controller.dragDrop.sources = [];
      if (this.selected)
        this.controller.dragDrop.sources = this.controller.selection;
      else
        this.controller.dragDrop.sources = [this.data];
      _event.dataTransfer.effectAllowed = "all";
    }

    private hndDragOver = (_event: DragEvent): void => {
      // _event.stopPropagation();
      _event.preventDefault();
      this.controller.dragDrop.target = this.data;
      // _event.dataTransfer.dropEffect = "link";
    }

    private hndPointerUp = (_event: PointerEvent): void => {
      _event.stopPropagation();
      this.focus();
      this.select(_event.ctrlKey, _event.shiftKey);
    }
  }
  customElements.define("table-item", <CustomElementConstructor><unknown>TableItem, { extends: "tr" });
}