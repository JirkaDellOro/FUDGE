///<reference path="../../../../Core/Build/FudgeCore.d.ts"/>
namespace TreeControl {
  import ƒ = FudgeCore;

  export enum TREE_CLASSES {
    SELECTED = "selected"
  }

  export enum EVENT_TREE {
    RENAME = "rename",
    OPEN = "open"
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

    public addBranch(_items: TreeItem[]): void {
      // tslint:disable no-use-before-declare
      let list: TreeList = new TreeList(_items);
      this.appendChild(list);
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
      this.addEventListener("focusNext", this.hndFocus);
      this.addEventListener("focusPrevious", this.hndFocus);
      this.tabIndex = 0;
    }

    private hndFocus = (_event: Event): void => {
      let listening: HTMLElement = <HTMLElement>_event.currentTarget;
      switch (_event.type) {
        case "focusNext":
          let next: HTMLElement = <HTMLElement>listening.nextElementSibling;
          if (!next)
            return;
          next.focus();
          _event.stopPropagation();
          break;
        case "focusPrevious":
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
            this.dispatchEvent(new Event("focusNext", { bubbles: true }));
          break;
        case ƒ.KEYBOARD_CODE.ARROW_UP:
          this.dispatchEvent(new Event("focusPrevious", { bubbles: true }));
          break;
        case ƒ.KEYBOARD_CODE.F2:
          this.startTypingLabel();
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
          target.dispatchEvent(new Event("rename", { bubbles: true }));
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

    constructor(_items: TreeItem[]) {
      super();
      this.add(_items);
    }

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

    public findItem(_data: Object): TreeItem {
      for (let item of this.children)
        if ((<TreeItem>item).data == _data)
          return <TreeItem>item;

      return null;
    }

    private add(_items: TreeItem[]): void {
      for (let item of _items) {
        this.appendChild(item);
      }
    }
  }

  customElements.define("ul-tree-list", TreeList, { extends: "ul" });
  customElements.define("ul-tree-item", TreeItem, { extends: "li" });

  let treeItem: TreeItem = new TreeItem(data[0].display, data[0], data[0].children != undefined);
  let tree: TreeList = new TreeList([treeItem]);
  tree.addEventListener(EVENT_TREE.RENAME, hndRename);
  tree.addEventListener(EVENT_TREE.OPEN, hndOpen);
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
    let target: TreeItem = <TreeItem>_event.target;
    let children: TreeEntry[] = target.data["children"];

    if (!children)
      return;

    let list: TreeItem[] = [];
    for (let child of children) {
      list.push(new TreeItem(child.display, child, child.children != undefined));
    }

    target.addBranch(list);
    console.log(_event);
  }
}