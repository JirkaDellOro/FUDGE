///<reference path="../../../../Core/Build/FudgeCore.d.ts"/>
namespace TreeControl {
  import ƒ = FudgeCore;

  export interface TreeEntry {
    display: string;
    children?: TreeEntry[];
    cssClasses?: string[];
    data?: Object;
  }

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
    private text: HTMLInputElement;

    constructor(_display: string, _data: Object, _hasChildren: boolean, _classes?: TREE_CLASSES[]) {
      super();
      this.update(_display, _data, _hasChildren);
      // TODO: handle cssClasses
      this.create();

      this.addEventListener("change", this.hndChange);
      // this.addEventListener("focusin", this.hndFocus);
    }

    public update(_display: string, _data: Object, _hasChildren: boolean, _classes?: TREE_CLASSES[]): void {
      this.display = _display;
      this.data = _data;
      this.hasChildren = _hasChildren;
    }

    public open(_open: boolean): void {
      this.removeContent();
      if (_open) {
        // TODO: fire "open" - Event, handler must take care of creating new branch
        this.dispatchEvent(new Event(EVENT_TREE.OPEN, {bubbles: true}));
        // let entry: TreeEntry = this.backlink.get(_item);
        // let children: TreeEntry[] = entry.children;
        // if (children)
        //   _item.appendChild(new TreeList(children));
      }
      (<HTMLInputElement>this.querySelector("input[type='checkbox']")).checked = _open;
    }

    public add(_items: TreeItem[]): void {
      // tslint:disable no-use-before-declare
      let list: TreeList = new TreeList(_items);
      this.appendChild(list);
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

      this.text = document.createElement("input");
      this.text.type = "text";
      // text.readOnly = true;
      this.text.disabled = true;
      this.text.value = this.display;
      this.text.draggable = true;
      this.appendChild(this.text);

      this.addEventListener("keydown", this.hndKey);
      this.addEventListener("focusNext", this.hndFocus);
      this.addEventListener("focusPrevious", this.hndFocus);
      this.tabIndex = 0;
      // this.backlink.set(item, _entry);
      // return item;
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
      // console.log(_event);
      // console.log(document.activeElement);
    }

    private hndKey = (_event: KeyboardEvent): void => {
      // console.log(_event);
      _event.stopPropagation();
      let target: HTMLInputElement = <HTMLInputElement>_event.target;
      let item: HTMLLIElement = <HTMLLIElement>_event.currentTarget;
      let content: TreeList = <TreeList>item.querySelector("ul");

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
            item.dispatchEvent(new Event("focusNext", { bubbles: true }));
          break;
        case ƒ.KEYBOARD_CODE.ARROW_UP:
          item.dispatchEvent(new Event("focusPrevious", { bubbles: true }));
          break;
        case ƒ.KEYBOARD_CODE.F2:
          let text: HTMLInputElement = item.querySelector("input[type=text]");
          text.disabled = false;
          text.focus();
          break;
      }
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
          console.log(target.value);
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
   * Extension of ul-element that builds a tree structure with interactive controls from an array of type TreeEntry. 
   * Creates an [[TreeItem]]-Element for each entry
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
    // private backlink: Map<HTMLLIElement, TreeEntry> = new Map();

    constructor(_items: TreeItem[]) {
      super();
      this.add(_items);
    }

    public show(_entries: TreeEntry[], _path: number[], _focus: boolean = true): void {
      // let currentTree: TreeList = this;

      // for (let iEntry of _path) {
      //   if (!_entries)
      //     return;
      //   let entry: TreeEntry = _entries[iEntry];
      //   let item: HTMLLIElement = currentTree.findOpen(entry);
      //   item.focus();
      //   let content: TreeList = currentTree.getBranch(item);
      //   if (!content) {
      //     currentTree.open(true);
      //     content = currentTree.getBranch(item);
      //   }
      //   currentTree = content;
      //   _entries = entry.children;
      // }
    }

    public getBranch(_item: HTMLLIElement): TreeList {
      return <TreeList>_item.querySelector("ul");
    }

    public findOpen(_entry: TreeEntry): HTMLLIElement {
      // for (let entry of this.backlink)
      //   if (entry[1] == _entry)
      //     return entry[0];
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
  export let tree: TreeList = new TreeList([treeItem]);
  tree.addEventListener(EVENT_TREE.RENAME, hndRename);
  tree.addEventListener(EVENT_TREE.OPEN, hndOpen);
  document.body.appendChild(tree);

  // tree.show(data, [0, 1, 1, 0]);

  function hndRename(_event: Event): void {
    let target: TreeItem = <TreeItem>_event.target;
    console.log(target.value);
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

    target.add(list);
    console.log(_event);
  }
}