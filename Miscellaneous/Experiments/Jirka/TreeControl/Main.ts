///<reference path="../../../../Core/Build/FudgeCore.d.ts"/>
namespace TreeControl {
  import ƒ = FudgeCore;

  export interface TreeEntry {
    display: string;
    children?: TreeEntry[];
  }

  /**
   * Extension of ul-Element that builds a tree structure with interactive controls from an array of type TreeEntry. 
   * Creates an li-Element called item for each entry, with a checkbox and a textinput as content.
   * Additional content of an item is again an instance of Tree, if the corresponding entry has children.
   *  
   * ```plaintext
   * tree
   * ├ item
   * ├ item
   * │ └ tree
   * │   ├ item
   * │   └ item
   * └ item
   * ```
   */
  class Tree extends HTMLUListElement {
    private backlink: Map<HTMLLIElement, TreeEntry> = new Map();

    constructor(_entries: TreeEntry[]) {
      super();
      this.create(_entries);
      this.addEventListener("change", this.hndChange);
      // this.addEventListener("focusin", this.hndFocus);
    }

    public open(_item: HTMLLIElement, _open: boolean): void {
      this.removeContent(_item);
      if (_open) {
        let entry: TreeEntry = this.backlink.get(_item);
        let children: TreeEntry[] = entry.children;
        if (children)
          _item.appendChild(new Tree(children));
      }
      (<HTMLInputElement>_item.querySelector("input[type='checkbox']")).checked = _open;
    }

    private create(_entries: TreeEntry[]): void {
      for (let entry of _entries) {
        let item: HTMLLIElement = this.createItem(entry);
        this.appendChild(item);
      }
    }

    private createItem(_entry: TreeEntry): HTMLLIElement {
      let item: HTMLLIElement = document.createElement("li");

      let checkbox: HTMLInputElement = document.createElement("input");
      checkbox.type = "checkbox";
      item.appendChild(checkbox);
      if (!_entry.children)
        checkbox.style.visibility = "hidden";

      let text: HTMLInputElement = document.createElement("input");
      text.type = "text";
      // text.readOnly = true;
      text.disabled = true;
      text.value = _entry.display;
      text.draggable = true;
      item.appendChild(text);

      item.addEventListener("keydown", this.hndKey);
      item.addEventListener("focusNext", this.hndFocus);
      item.addEventListener("focusPrevious", this.hndFocus);
      item.tabIndex = 0;
      this.backlink.set(item, _entry);
      return item;
    }

    private hndChange = (_event: Event): void => {
      console.log(_event);
      let target: HTMLInputElement = <HTMLInputElement>_event.target;
      // TODO: check if listener is better attached to item than to tree
      let item: HTMLLIElement = <HTMLLIElement>target.parentElement;
      _event.stopPropagation();

      switch (target.type) {
        case "checkbox":
          this.open(item, target.checked);
          break;
        case "text":
          console.log(target.value);
          break;
        case "default":
          console.log(target);
          break;
      }
    }

    private removeContent(_item: HTMLLIElement): void {
      let content: HTMLUListElement = _item.querySelector("ul");
      if (!content)
        return;
      _item.removeChild(content);
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
      let content: Tree = <Tree>item.querySelector("ul");

      switch (_event.code) {
        case ƒ.KEYBOARD_CODE.ARROW_RIGHT:
          if (content)
            (<HTMLElement>content.firstChild).focus();
          else
            this.open(item, true);
          break;
        case ƒ.KEYBOARD_CODE.ARROW_LEFT:
          if (content)
            this.open(item, false);
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
      }
    }
  }

  customElements.define("ul-tree", Tree, { extends: "ul" });

  let list: Tree = new Tree(data);
  document.body.appendChild(list);
  console.log(document.querySelectorAll("[tabindex]"));
}