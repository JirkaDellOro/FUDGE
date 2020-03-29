///<reference path="../../../../Core/Build/FudgeCore.d.ts"/>
namespace TreeControl {
  import ƒ = FudgeCore;

  export enum TREE_CLASSES {
    SELECTED = "selected"
  }

  export enum EVENT_TREE {
    RENAME = "rename",
    OPEN = "open",
    FOCUS_NEXT = "focusNext",
    FOCUS_PREVIOUS = "focusPrevious",
    DELETE = "delete"
  }

  /**
   * Extension of li-element that represents an object in a [[TreeList]] with a checkbox and a textinput as content.
   * Additionally, may hold an instance of [[TreeList]] if the corresponding object appears to have children.
   */
  class TreeItem extends HTMLLIElement {
    public display: string = "TreeItem";
    public classes: TREE_CLASSES[] = [];
    public data: Object = null;
    public hasChildren: boolean = false;

    private checkbox: HTMLInputElement;
    private label: HTMLInputElement;

    constructor(_display: string, _data: Object, _hasChildren: boolean, _classes?: TREE_CLASSES[]) {
      super();
      this.display = _display;
      this.data = _data;
      this.hasChildren = _hasChildren;
      // TODO: handle cssClasses
      this.create();

      this.addEventListener("change", this.hndChange);
      this.addEventListener("dblclick", this.hndDblClick);
      // this.addEventListener("focusin", this.hndFocus);
    }

    public setLabel(_text: string): void {
      this.label.value = _text;
    }

    public getLabel(): string {
      return this.label.value;
    }

    public open(_open: boolean): void {
      this.removeContent();

      if (_open)
        this.dispatchEvent(new Event(EVENT_TREE.OPEN, { bubbles: true }));

      (<HTMLInputElement>this.querySelector("input[type='checkbox']")).checked = _open;
    }

    public addBranch(_branch: TreeList): void {
      // tslint:disable no-use-before-declare
      this.appendChild(_branch);
    }

    public getBranch(): TreeList {
      return <TreeList>this.querySelector("ul");
    }

    private removeContent(): void {
      let content: HTMLUListElement = this.querySelector("ul");
      if (!content)
        return;
      this.removeChild(content);
    }

    private create(): void {
      this.checkbox = document.createElement("input");
      this.checkbox.type = "checkbox";
      this.appendChild(this.checkbox);
      if (!this.hasChildren)
        this.checkbox.style.visibility = "hidden";

      this.label = document.createElement("input");
      this.label.type = "text";
      this.label.disabled = true;
      this.label.value = this.display;
      this.label.draggable = true;
      this.appendChild(this.label);

      this.addEventListener("keydown", this.hndKey);
      this.addEventListener(EVENT_TREE.FOCUS_NEXT, this.hndFocus);
      this.addEventListener(EVENT_TREE.FOCUS_PREVIOUS, this.hndFocus);
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
          break;
        case ƒ.KEYBOARD_CODE.ARROW_LEFT:
          if (content)
            this.open(false);
          else
            this.parentElement.focus();
          break;
        case ƒ.KEYBOARD_CODE.ARROW_DOWN:
          if (content)
            (<HTMLElement>content.firstChild).focus();
          else
            this.dispatchEvent(new Event(EVENT_TREE.FOCUS_NEXT, { bubbles: true }));
          break;
        case ƒ.KEYBOARD_CODE.ARROW_UP:
          this.dispatchEvent(new Event(EVENT_TREE.FOCUS_PREVIOUS, { bubbles: true }));
          break;
        case ƒ.KEYBOARD_CODE.F2:
          this.startTypingLabel();
          break;
        case ƒ.KEYBOARD_CODE.DELETE:
          this.dispatchEvent(new Event(EVENT_TREE.DELETE, { bubbles: true }));
          break;
      }
    }

    private startTypingLabel(): void {
      let text: HTMLInputElement = this.querySelector("input[type=text]");
      text.disabled = false;
      text.focus();
    }

    private hndDblClick = (_event: Event): void => {
      _event.stopPropagation();
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
  }

  /**
   * Extension of ul-element that builds a tree structure with interactive controls from an array of type [[TreeItem]]
   *  
   * ```plaintext
   * treeList <ul>
   * ├ treeItem <li>
   * ├ treeItem <li>
   * │ └ treeList <ul>
   * │   ├ treeItem <li>
   * │   └ treeItem <li>
   * └ treeItem <li>
   * ```
   */
  class TreeList extends HTMLUListElement {

    constructor(_items: TreeItem[] = []) {
      super();
      this.addItems(_items);
    }

    /**
     * Opens the tree along the given path to show the objects the path includes
     * @param _path An array of objects starting with one being contained in this treelist and following the correct hierarchy of successors
     * @param _focus If true (default) the last object found in the tree gets the focus
     */
    public show(_path: Object[], _focus: boolean = true): void {
      let currentTree: TreeList = this;

      for (let data of _path) {
        let item: TreeItem = currentTree.findItem(data);
        item.focus();
        let content: TreeList = item.getBranch();
        if (!content) {
          item.open(true);
          content = item.getBranch();
        }
        currentTree = content;
      }
    }

    /**
     * Restructures the list to sync with the given list. 
     * [[TreeItem]]s referencing the same object remain in the list, new items get added in the order of appearance, obsolete ones are deleted.
     * @param _tree A list to sync this with
     */
    public restructure(_tree: TreeList): void {
      let items: TreeItem[] = [];
      for (let item of _tree.getItems()) {
        let found: TreeItem = this.findItem(item.data);
        if (found) {
          found.setLabel(item.display);
          found.hasChildren = item.hasChildren;
          if (!found.hasChildren)
            found.open(false);
          items.push(found);
        }
        else
          items.push(item);
      }

      this.innerHTML = "";
      this.addItems(items);
    }

    /**
     * Returns the [[TreeItem]] of this list referencing the given object or null, if not found
     */
    public findItem(_data: Object): TreeItem {
      for (let item of this.children)
        if ((<TreeItem>item).data == _data)
          return <TreeItem>item;

      return null;
    }

    /**
     * Adds the given [[TreeItem]]s at the end of this list
     */
    public addItems(_items: TreeItem[]): void {
      for (let item of _items) {
        this.appendChild(item);
      }
    }

    /**
     * Returns the content of this list as array of [[TreeItem]]s
     */
    public getItems(): TreeItem[] {
      return <TreeItem[]><unknown>this.children;
    }
  }

  customElements.define("ul-tree-list", TreeList, { extends: "ul" });
  customElements.define("ul-tree-item", TreeItem, { extends: "li" });

  let treeItem: TreeItem = new TreeItem(data[0].display, data[0], data[0].children != undefined);
  let tree: TreeList = new TreeList([treeItem]);
  tree.addEventListener(EVENT_TREE.RENAME, hndRename);
  tree.addEventListener(EVENT_TREE.OPEN, hndOpen);
  tree.addEventListener(EVENT_TREE.DELETE, hndDelete);
  document.body.appendChild(tree);

  show(0, 1, 1, 0);

  export function show(..._index: number[]): void {
    let path: TreeEntry[] = [];
    let branch: TreeEntry[] = data;
    for (let i of _index) {
      path.push(branch[i]);
      branch = branch[i].children;
    }
    tree.show(path, true);
  }

  function hndRename(_event: Event): void {
    let item: TreeItem = <TreeItem>(<HTMLInputElement>_event.target).parentNode;
    let data: TreeEntry = <TreeEntry>item.data;
    data.display = item.getLabel();
    item.setLabel(data.display);
  }

  function hndOpen(_event: Event): void {
    let item: TreeItem = <TreeItem>_event.target;
    let children: TreeEntry[] = item.data["children"];

    if (!children)
      return;

    let branch: TreeList = new TreeList([]);
    for (let child of children) {
      branch.addItems([new TreeItem(child.display, child, child.children != undefined)]);
    }

    item.addBranch(branch);
    console.log(_event);
  }

  function hndDelete(_event: Event): void {
    let item: TreeItem = <TreeItem>_event.target;
    let tree: TreeList = <TreeList>item.parentElement;
    tree.removeChild(item);
    tree.restructure(tree);
  }
}