namespace FudgeUserInterface {
  /**
   * Extension of tr-element that represents an object in a [[Table]]
   */
  export class TableItem<T> extends HTMLTableRowElement {
    public data: T = null;
    public controller: TableController<T>;

    public constructor(_controller: TableController<T>, _data: T) {
      super();
      this.controller = _controller;
      this.data = _data;
      // this.display = this.controller.getLabel(_data);
      // TODO: handle cssClasses
      this.create(this.controller.getHead());

      this.addEventListener(EVENT.POINTER_UP, this.hndPointerUp);
      // this.addEventListener(EVENT.CHANGE, this.hndChange);
      // this.addEventListener(EVENT.DOUBLE_CLICK, this.hndDblClick);
      // this.addEventListener(EVENT.FOCUS_OUT, this.hndFocus);
      // this.addEventListener(EVENT.KEY_DOWN, this.hndKey);
      // this.addEventListener(EVENT_TREE.FOCUS_NEXT, this.hndFocus);
      // this.addEventListener(EVENT_TREE.FOCUS_PREVIOUS, this.hndFocus);

      // this.draggable = true;
      // this.addEventListener(EVENT.DRAG_START, this.hndDragStart);
      // this.addEventListener(EVENT.DRAG_OVER, this.hndDragOver);

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
        let value: Object = Reflect.get(<Object>this.data, entry.key);
        let td: HTMLTableCellElement = document.createElement("td");
        td.innerHTML = value.toString();
        this.appendChild(td);
      }
      this.tabIndex = 0;
    }

    private hndPointerUp = (_event: PointerEvent): void => {
      this.select(_event.ctrlKey, _event.shiftKey);
    }
  }
  customElements.define("table-item", <CustomElementConstructor><unknown>TableItem, { extends: "tr" });
}