///<reference path="../../../../Core/Build/FudgeCore.d.ts"/>
namespace FudgeUserInterface {
  import ƒ = FudgeCore;

  /**
   * Extension of li-element that represents an object in a [[TreeList]] with a checkbox and a textinput as content.
   * Additionally, may hold an instance of [[TreeList]] as branch to display children of the corresponding object.
   */
  export class TreeItem<T> extends HTMLLIElement {
    public display: string = "TreeItem";
    public classes: CSS_CLASS[] = [];
    public data: T = null;
    public controller: TreeController<T>;

    private checkbox: HTMLInputElement;
    private label: HTMLInputElement;

    public constructor(_controller: TreeController<T>, _data: T) {
      super();
      this.controller = _controller;
      this.data = _data;
      this.display = this.controller.getLabel(_data);
      // TODO: handle cssClasses
      this.create();
      this.hasChildren = this.controller.hasChildren(_data);

      this.addEventListener(EVENT.CHANGE, this.hndChange);
      this.addEventListener(EVENT.DOUBLE_CLICK, this.hndDblClick);
      this.addEventListener(EVENT.FOCUS_OUT, this.hndFocus);
      this.addEventListener(EVENT.KEY_DOWN, this.hndKey);
      // this.addEventListener(EVENT_TREE.FOCUS_NEXT, this.hndFocus);
      // this.addEventListener(EVENT_TREE.FOCUS_PREVIOUS, this.hndFocus);

      this.draggable = true;
      this.addEventListener(EVENT.DRAG_START, this.hndDragStart);
      this.addEventListener(EVENT.DRAG_OVER, this.hndDragOver);

      this.addEventListener(EVENT.POINTER_UP, this.hndPointerUp);
      this.addEventListener(EVENT.REMOVE_CHILD, this.hndRemove);
    }

    /**
     * Returns true, when this item has a visible checkbox in front to expand the subsequent branch 
     */
    public get hasChildren(): boolean {
      return this.checkbox.style.visibility != "hidden";
    }

    /**
     * Shows or hides the checkbox for expanding the subsequent branch
     */
    public set hasChildren(_has: boolean) {
      this.checkbox.style.visibility = _has ? "visible" : "hidden";
    }

    /**
     * Returns attaches or detaches the [[TREE_CLASS.SELECTED]] to this item
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
     * Set the label text to show
     */
    public setLabel(_text: string): void {
      this.label.value = _text;
    }

    /**
     * Get the label text shown
     */
    public getLabel(): string {
      return this.label.value;
    }

    /**
     * Tries to expanding the [[TreeList]] of children, by dispatching [[EVENT.EXPAND]].
     * The user of the tree needs to add an event listener to the tree 
     * in order to create that [[TreeList]] and add it as branch to this item
     */
    public expand(_expand: boolean): void {
      this.removeBranch();

      if (_expand)
        this.dispatchEvent(new Event(EVENT.EXPAND, { bubbles: true }));

      (<HTMLInputElement>this.querySelector("input[type='checkbox']")).checked = _expand;
    }

    /**
     * Returns a list of all data referenced by the items succeeding this
     */
    public getVisibleData(): T[] {
      let list: NodeListOf<HTMLLIElement> = this.querySelectorAll("li");
      let data: T[] = [];
      for (let item of list)
        data.push((<TreeItem<T>>item).data);
      return data;
    }

    /**
     * Sets the branch of children of this item. The branch must be a previously compiled [[TreeList]]
     */
    public setBranch(_branch: TreeList<T>): void {
      this.removeBranch();
      if (_branch)
        this.appendChild(_branch);
    }

    /**
     * Returns the branch of children of this item.
     */
    public getBranch(): TreeList<T> {
      return <TreeList<T>>this.querySelector("ul");
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

    /**
     * Removes the branch of children from this item
     */
    private removeBranch(): void {
      let content: TreeList<T> = this.getBranch();
      if (!content)
        return;
      this.removeChild(content);
    }

    private create(): void {
      this.checkbox = document.createElement("input");
      this.checkbox.type = "checkbox";
      this.appendChild(this.checkbox);

      this.label = document.createElement("input");
      this.label.type = "text";
      this.label.disabled = true;
      this.label.value = this.display;
      this.appendChild(this.label);

      this.tabIndex = 0;
    }


    private hndFocus = (_event: Event): void => {
      if (_event.target == this.label)
        this.label.disabled = true;
    }

    private hndKey = (_event: KeyboardEvent): void => {
      _event.stopPropagation();
      if (!this.label.disabled)
        return;
      let content: TreeList<T> = <TreeList<T>>this.querySelector("ul");

      switch (_event.code) {
        case ƒ.KEYBOARD_CODE.ARROW_RIGHT:
          if (this.hasChildren && !content)
            this.expand(true);
          else
            this.dispatchEvent(new KeyboardEvent(EVENT.FOCUS_NEXT, { bubbles: true, shiftKey: _event.shiftKey, ctrlKey: _event.ctrlKey }));
          break;
        case ƒ.KEYBOARD_CODE.ARROW_LEFT:
          if (content)
            this.expand(false);
          else
            this.dispatchEvent(new KeyboardEvent(EVENT.FOCUS_PREVIOUS, { bubbles: true, shiftKey: _event.shiftKey, ctrlKey: _event.ctrlKey }));
          break;
        case ƒ.KEYBOARD_CODE.ARROW_DOWN:
          this.dispatchEvent(new KeyboardEvent(EVENT.FOCUS_NEXT, { bubbles: true, shiftKey: _event.shiftKey, ctrlKey: _event.ctrlKey }));
          break;
        case ƒ.KEYBOARD_CODE.ARROW_UP:
          this.dispatchEvent(new KeyboardEvent(EVENT.FOCUS_PREVIOUS, { bubbles: true, shiftKey: _event.shiftKey, ctrlKey: _event.ctrlKey }));
          break;
        case ƒ.KEYBOARD_CODE.F2:
          this.startTypingLabel();
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
          if (!_event.ctrlKey)
            break;
          _event.preventDefault();
          this.dispatchEvent(new Event(EVENT.COPY, { bubbles: true }));
          break;
        case ƒ.KEYBOARD_CODE.V:
          if (!_event.ctrlKey)
            break;
          _event.preventDefault();
          this.dispatchEvent(new Event(EVENT.PASTE, { bubbles: true }));
          break;
        case ƒ.KEYBOARD_CODE.X:
          if (!_event.ctrlKey)
            break;
          _event.preventDefault();
          this.dispatchEvent(new Event(EVENT.CUT, { bubbles: true }));
          break;
      }
    }

    private startTypingLabel(): void {
      this.label.disabled = false;
      this.label.focus();
    }

    private hndDblClick = (_event: Event): void => {
      _event.stopPropagation();
      if (_event.target != this.checkbox)
        this.startTypingLabel();
    }

    private hndChange = (_event: Event): void => {
      let target: HTMLInputElement = <HTMLInputElement>_event.target;
      let item: HTMLLIElement = <HTMLLIElement>target.parentElement;
      _event.stopPropagation();

      switch (target.type) {
        case "checkbox":
          this.expand(target.checked);
          break;
        case "text":
          target.disabled = true;
          item.focus();
          target.dispatchEvent(new Event(EVENT.RENAME, { bubbles: true }));
          break;
        case "default":
          // console.log(target);
          break;
      }
    }

    private hndDragStart = (_event: DragEvent): void => {
      // _event.stopPropagation();
      if (_event.dataTransfer.getData("dragstart"))
        return;

      this.controller.dragDrop.sources = [];
      if (this.selected)
        this.controller.dragDrop.sources = this.controller.selection;
      else
        this.controller.dragDrop.sources = [this.data];
      _event.dataTransfer.effectAllowed = "all";
      this.controller.dragDrop.target = null;

      // mark as already processed by this tree item to ignore it in further propagation through the tree
      _event.dataTransfer.setData("dragstart", this.label.value);
    }

    private hndDragOver = (_event: DragEvent): void => {
      // this.controller.hndDragOver(_event);
      if (Reflect.get(_event, "dragoverDone"))
        return;
      
      Reflect.set(_event, "dragoverDone", true);
      // _event.stopPropagation();
      _event.preventDefault();
      this.controller.dragDrop.target = this.data;
      _event.dataTransfer.dropEffect = "move";
    }

    private hndPointerUp = (_event: PointerEvent): void => {
      _event.stopPropagation();
      if (_event.target == this.checkbox)
        return;
      this.select(_event.ctrlKey, _event.shiftKey);
    }

    private hndRemove = (_event: Event): void => {
      if (_event.currentTarget == _event.target)
        return;
      _event.stopPropagation();
      this.hasChildren = this.controller.hasChildren(this.data);
    }
  }

  customElements.define("li-tree-item", <CustomElementConstructor><unknown>TreeItem, { extends: "li" });
}