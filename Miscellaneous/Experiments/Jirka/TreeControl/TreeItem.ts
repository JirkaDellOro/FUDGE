///<reference path="../../../../Core/Build/FudgeCore.d.ts"/>
namespace TreeControl {
  import ƒ = FudgeCore;

  export enum TREE_CLASSES {
    SELECTED = "selected",
    INACTIVE = "inactive"
  }

  export enum EVENT_TREE {
    RENAME = "rename",
    OPEN = "open",
    FOCUS_NEXT = "focusNext",
    FOCUS_PREVIOUS = "focusPrevious",
    FOCUS_IN = "focusin",
    FOCUS_OUT = "focusout",
    DELETE = "delete",
    CHANGE = "change",
    DOUBLE_CLICK = "dblclick",
    KEY_DOWN = "keydown",
    DRAG_START = "dragstart",
    DRAG_OVER = "dragover",
    DROP = "drop",
    POINTER_UP = "pointerup",
    SELECT = "itemselect"
  }

  /**
   * Extension of li-element that represents an object in a [[TreeList]] with a checkbox and a textinput as content.
   * Additionally, may hold an instance of [[TreeList]] to display children of the corresponding object.
   */
  export class TreeItem extends HTMLLIElement {
    public display: string = "TreeItem";
    public classes: TREE_CLASSES[] = [];
    public data: Object = null;

    private checkbox: HTMLInputElement;
    private label: HTMLInputElement;

    constructor(_display: string, _data: Object, _hasChildren: boolean, _classes?: TREE_CLASSES[]) {
      super();
      this.display = _display;
      this.data = _data;
      // TODO: handle cssClasses
      this.create();
      this.hasChildren = _hasChildren;

      this.addEventListener(EVENT_TREE.CHANGE, this.hndChange);
      this.addEventListener(EVENT_TREE.DOUBLE_CLICK, this.hndDblClick);
      this.addEventListener(EVENT_TREE.FOCUS_OUT, this.hndFocus);
      this.addEventListener(EVENT_TREE.KEY_DOWN, this.hndKey);
      this.addEventListener(EVENT_TREE.FOCUS_NEXT, this.hndFocus);
      this.addEventListener(EVENT_TREE.FOCUS_PREVIOUS, this.hndFocus);

      this.draggable = true;
      this.addEventListener(EVENT_TREE.DRAG_START, this.hndDragStart);
      this.addEventListener(EVENT_TREE.DRAG_OVER, this.hndDragOver);

      this.addEventListener(EVENT_TREE.POINTER_UP, this.hndPointerUp);
    }

    public get hasChildren(): boolean {
      return this.checkbox.style.visibility != "hidden";
    }

    public set hasChildren(_has: boolean) {
      this.checkbox.style.visibility = _has ? "visible" : "hidden";
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
     * Tries to open the [[TreeList]] of children, by dispatching [[EVENT_TREE.OPEN]].
     * The user of the tree needs to add an event listener to the tree 
     * in order to create that [[TreeList]] and add it as branch to this item
     * @param _open If false, the item will be closed
     */
    public open(_open: boolean): void {
      this.removeBranch();

      if (_open)
        this.dispatchEvent(new Event(EVENT_TREE.OPEN, { bubbles: true }));

      (<HTMLInputElement>this.querySelector("input[type='checkbox']")).checked = _open;
    }

    /**
     * Sets the branch of children of this item. The branch must be a previously compiled [[TreeList]]
     */
    public setBranch(_branch: TreeList): void {
      // tslint:disable no-use-before-declare
      this.removeBranch();
      if (_branch)
        this.appendChild(_branch);
    }

    /**
     * Returns the branch of children of this item.
     */
    public getBranch(): TreeList {
      return <TreeList>this.querySelector("ul");
    }

    public set selected(_on: boolean) {
      if (_on)
        this.classList.add(TREE_CLASSES.SELECTED);
      else
        this.classList.remove(TREE_CLASSES.SELECTED);
    }

    public get selected(): boolean {
      return this.classList.contains(TREE_CLASSES.SELECTED);
    }

    public select(_additive: boolean, _interval: boolean = false): void {
      let event: CustomEvent = new CustomEvent(EVENT_TREE.SELECT, { bubbles: true, detail: { data: this.data, additive: _additive, interval: _interval } });
      this.dispatchEvent(event);
    }

    /**
     * Removes the branch of children from this item
     */
    private removeBranch(): void {
      let content: HTMLUListElement = this.querySelector("ul");
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
      let listening: HTMLElement = <HTMLElement>_event.currentTarget;
      switch (_event.type) {
        case EVENT_TREE.FOCUS_NEXT:
          let next: HTMLElement = <HTMLElement>listening.nextElementSibling;
          if (!next)
            return;
          next.focus();
          _event.stopPropagation();
          break;
        case EVENT_TREE.FOCUS_PREVIOUS:
          if (listening == _event.target)
            return;
          let items: NodeListOf<HTMLLIElement> = listening.querySelectorAll("li");
          let prev: HTMLElement = listening;
          for (let item of items) {
            if (item == _event.target)
              break;
            prev = item;
          }
          prev.focus();
          _event.stopPropagation();
          break;
        case EVENT_TREE.FOCUS_OUT:
          if (_event.target == this.label)
            this.label.disabled = true;
          break;
        default:
          break;
      }
    }

    private hndKey = (_event: KeyboardEvent): void => {
      _event.stopPropagation();
      let content: TreeList = <TreeList>this.querySelector("ul");

      switch (_event.code) {
        case ƒ.KEYBOARD_CODE.ARROW_RIGHT:
          if (content)
            (<HTMLElement>content.firstChild).focus();
          else
            this.open(true);

          if (_event.shiftKey)
            (<TreeItem>document.activeElement).select(true);
          break;
        case ƒ.KEYBOARD_CODE.ARROW_LEFT:
          if (content)
            this.open(false);
          else
            this.parentElement.focus();

          if (_event.shiftKey)
            (<TreeItem>document.activeElement).select(true);
          break;
        case ƒ.KEYBOARD_CODE.ARROW_DOWN:
          if (content)
            (<HTMLElement>content.firstChild).focus();
          else
            this.dispatchEvent(new Event(EVENT_TREE.FOCUS_NEXT, { bubbles: true }));

          if (_event.shiftKey)
            (<TreeItem>document.activeElement).select(true);
          break;
        case ƒ.KEYBOARD_CODE.ARROW_UP:
          this.dispatchEvent(new Event(EVENT_TREE.FOCUS_PREVIOUS, { bubbles: true }));

          if (_event.shiftKey)
            (<TreeItem>document.activeElement).select(true);
          break;
        case ƒ.KEYBOARD_CODE.F2:
          this.startTypingLabel();
          break;
        case ƒ.KEYBOARD_CODE.DELETE:
          this.dispatchEvent(new Event(EVENT_TREE.DELETE, { bubbles: true }));
          break;
        case ƒ.KEYBOARD_CODE.SPACE:
          this.select(_event.ctrlKey, _event.shiftKey);
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
      console.log(_event);
      let target: HTMLInputElement = <HTMLInputElement>_event.target;
      let item: HTMLLIElement = <HTMLLIElement>target.parentElement;
      _event.stopPropagation();

      switch (target.type) {
        case "checkbox":
          this.open(target.checked);
          break;
        case "text":
          target.disabled = true;
          item.focus();
          target.dispatchEvent(new Event(EVENT_TREE.RENAME, { bubbles: true }));
          break;
        case "default":
          console.log(target);
          break;
      }
    }


    private hndDragStart = (_event: DragEvent): void => {
      _event.stopPropagation();
      // TODO: send custom event with this as item and data as load
      globalThis.dragSource = this;
      _event.dataTransfer.effectAllowed = "all";
    }

    private hndDragOver = (_event: DragEvent): void => {
      _event.stopPropagation();
      _event.preventDefault();
      // TODO: send custom event with this as item and data as load
      globalThis.dragTarget = this;
      _event.dataTransfer.dropEffect = "move";
    }

    private hndPointerUp = (_event: PointerEvent): void => {
      _event.stopPropagation();
      if (_event.target == this.checkbox)
        return;
      this.select(_event.ctrlKey, _event.shiftKey);
    }

  }

  customElements.define("ul-tree-item", TreeItem, { extends: "li" });
}