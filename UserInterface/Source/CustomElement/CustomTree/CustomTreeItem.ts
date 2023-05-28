///<reference path="../../../../Core/Build/FudgeCore.d.ts"/>
namespace FudgeUserInterface {
  import ƒ = FudgeCore;

  /**
   * Extension of li-element that represents an object in a {@link CustomTreeList} with a checkbox and an HTMLElement as content.
   * Additionally, may hold an instance of {@link CustomTreeList} as branch to display children of the corresponding object.
   */
  export class CustomTreeItem<T> extends HTMLLIElement {
    public classes: CSS_CLASS[] = [];
    public data: T = null;
    public controller: CustomTreeController<T>;
    
    private checkbox: HTMLInputElement;
    #content: HTMLFormElement;
    
    public constructor(_controller: CustomTreeController<T>, _data: T) {
      super();
      this.controller = _controller;
      this.data = _data;
      // TODO: handle cssClasses
      this.create();
      this.hasChildren = this.controller.hasChildren(_data);

      this.addEventListener(EVENT.CHANGE, this.hndChange);
      this.addEventListener(EVENT.DOUBLE_CLICK, this.hndDblClick);
      this.addEventListener(EVENT.FOCUS_OUT, this.hndFocus);
      this.addEventListener(EVENT.KEY_DOWN, this.hndKey);
      // this.addEventListener(EVENT_TREE.FOCUS_NEXT, this.hndFocus);
      // this.addEventListener(EVENT_TREE.FOCUS_PREVIOUS, this.hndFocus);

      this.draggable = this.controller.draggable(_data);
      this.addEventListener(EVENT.DRAG_START, this.hndDragStart);
      this.addEventListener(EVENT.DRAG_ENTER, this.hndDragEnter);
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
     * Returns true if the {@link CSS_CLASS.SELECTED} is attached to this item
     */
    public get selected(): boolean {
      return this.classList.contains(CSS_CLASS.SELECTED);
    }

    /**
     * Attaches or detaches the {@link CSS_CLASS.SELECTED} to this item
     */
    public set selected(_on: boolean) {
      if (_on)
        this.classList.add(CSS_CLASS.SELECTED);
      else
        this.classList.remove(CSS_CLASS.SELECTED);
    }

    /**
     * Returns the content representing the attached {@link data}
     */
    public get content(): HTMLFormElement {
      return this.#content;
    }

    /**
     * Set the content representing the attached {@link data}
     */
    public set content(_content: HTMLFormElement) {
      if (this.contains(this.#content))
        this.replaceChild(_content, this.#content);
      else
        this.appendChild(_content);
      this.#content = _content;
      this.#content.onsubmit = (_event) => {
        _event.preventDefault();
        return false;
      };    
    }

    public refreshAttributes(): void {
      this.setAttribute("attributes", this.controller.getAttributes(this.data));
    }

    public refreshContent(): void {
      this.content = this.controller.createContent(this.data);
    }

    /**
     * Tries to expanding the {@link CustomTreeList} of children, by dispatching {@link EVENT.EXPAND}.
     * The user of the tree needs to add an event listener to the tree 
     * in order to create that {@link CustomTreeList} and add it as branch to this item
     */
    public expand(_expand: boolean): void {
      // this.removeBranch();

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
        data.push((<CustomTreeItem<T>>item).data);
      return data;
    }

    /**
     * Sets the branch of children of this item. The branch must be a previously compiled {@link CustomTreeList}
     */
    public setBranch(_branch: CustomTreeList<T>): void {
      this.removeBranch();
      if (_branch)
        this.appendChild(_branch);
    }

    /**
     * Returns the branch of children of this item.
     */
    public getBranch(): CustomTreeList<T> {
      return <CustomTreeList<T>>this.querySelector("ul");
    }


    /**
     * Dispatches the {@link EVENT.SELECT} event
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
      let content: CustomTreeList<T> = this.getBranch();
      if (!content)
        return;
      this.removeChild(content);
    }

    private create(): void {
      this.checkbox = document.createElement("input");
      this.checkbox.type = "checkbox";
      this.appendChild(this.checkbox);
      this.refreshContent();
      this.refreshAttributes();
      this.tabIndex = 0;
    }

    private hndFocus = (_event: Event): void => {
      _event.stopPropagation();
      if (!(_event.target instanceof HTMLInputElement) || _event.target == this.checkbox) return;

      _event.target.disabled = true;
    }

    private hndKey = (_event: KeyboardEvent): void => {
      _event.stopPropagation();
      for (const iterator of this.content.elements) {
        if (iterator instanceof HTMLInputElement && !iterator.disabled) return;
      }

      let content: CustomTreeList<T> = <CustomTreeList<T>>this.querySelector("ul");

      switch (_event.code) {
        // TODO: repair arrow key navigation
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
          this.startTypingInput();
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

    private startTypingInput(_inputElement?: HTMLElement): void {
      if (!_inputElement) _inputElement = <HTMLElement>this.content.elements.item(0);
      if (_inputElement instanceof HTMLInputElement) {
        _inputElement.disabled = false;
        _inputElement.focus();  
      } 
    }

    private hndDblClick = (_event: Event): void => {
      _event.stopPropagation();
      if (_event.target != this.checkbox)
        this.startTypingInput(<HTMLElement>_event.target);
    }

    private hndChange = (_event: Event): void => {
      let target: HTMLInputElement | HTMLSelectElement = <HTMLInputElement | HTMLSelectElement>_event.target;
      let item: HTMLLIElement = <HTMLLIElement>target.form?.parentNode;
      _event.stopPropagation();

      if (target instanceof HTMLInputElement) {
        switch (target.type) {
          case "checkbox":
            this.expand(target.checked);
            break;
          case "text":
            target.disabled = true;
            item.focus();
            this.dispatchEvent(new CustomEvent(EVENT.RENAME, { bubbles: true, detail: { id: target.id, value: target.value }}));
            break;
          case "default":
            // console.log(target);
            break;
        }
      }
      
      if (target instanceof HTMLSelectElement) 
        this.dispatchEvent(new CustomEvent(EVENT.RENAME, { bubbles: true, detail: { id: target.id, value: target.value } }));
        
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
      _event.dataTransfer.setDragImage(document.createElement("img"), 0, 0);
      this.controller.dragDrop.target = null;

      // mark as already processed by this tree item to ignore it in further propagation through the tree
      _event.dataTransfer.setData("dragstart", "dragstart");
    }

    private hndDragEnter = (_event: DragEvent): void => { // this prevents cursor from flickering
      _event.preventDefault();
      _event.dataTransfer.dropEffect = "move";
    }

    private hndDragOver = (_event: DragEvent): void => {      
      let rect: DOMRect = this.content.getBoundingClientRect();
      let upper: number = rect.top + rect.height * (1 / 3);
      let lower: number = rect.top + rect.height * (2 / 3);
      let offset: number = _event.clientY;
      if (this.parentElement instanceof CustomTree || (offset > upper && (offset < lower || this.checkbox.checked))) {
        _event.preventDefault();
        _event.stopPropagation();
        _event.dataTransfer.dropEffect = "move";
        this.controller.dragDropDivider.remove();
        this.controller.dragDrop.at = null;
        this.controller.dragDrop.target = this.data;
      }
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

  customElements.define("li-custom-tree-item", <CustomElementConstructor><unknown>CustomTreeItem, { extends: "li" });
}