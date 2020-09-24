namespace FudgeUserInterface {
  // export enum TREE_CLASS {
  //   SELECTED = "selected",
  //   INACTIVE = "inactive"
  // }

  export enum EVENT_TABLE {
    SORT = "sort",
    CHANGE = "change"
  }
  //   RENAME = "rename",
  //   OPEN = "open",
  //   FOCUS_NEXT = "focusNext",
  //   FOCUS_PREVIOUS = "focusPrevious",
  //   FOCUS_IN = "focusin",
  //   FOCUS_OUT = "focusout",
  //   DELETE = "delete",
  //   CHANGE = "change",
  //   DOUBLE_CLICK = "dblclick",
  //   KEY_DOWN = "keydown",
  //   DRAG_START = "dragstart",
  //   DRAG_OVER = "dragover",
  //   DROP = "drop",
  //   POINTER_UP = "pointerup",
  //   SELECT = "itemselect",
  //   UPDATE = "update",
  //   ESCAPE = "escape",
  //   COPY = "copy",
  //   CUT = "cut",
  //   PASTE = "paste",
  //   FOCUS_SET = "focusSet"
  // }

  export interface TABLE {
    label: string;
    key: string | symbol | number;
    editable: boolean;
    sortable: boolean;
  }

  /**
   * Manages a sortable table of data given as simple array of flat objects   
   * ```plaintext
   * Key0  Key1 Key2
   * ```
   */
  export class Table<T extends Object> extends HTMLTableElement {
    public controller: TableController<T>;
    public data: T[];

    constructor(_controller: TableController<T>, _data: T[]) {
      super();
      this.controller = _controller;
      this.data = _data;
      this.create();

      // this.addEventListener(EVENT_TABLE.CHANGE, this.hndSort);
      // this.addEventListener(EVENT_TABLE.SORT, this.hndSort);
      // this.addEventListener(EVENT_TREE.RENAME, this.hndRename);
      // this.addEventListener(EVENT_TREE.SELECT, this.hndSelect);
      // this.addEventListener(EVENT_TREE.DROP, this.hndDrop);
      // this.addEventListener(EVENT_TREE.DELETE, this.hndDelete);
      // this.addEventListener(EVENT_TREE.ESCAPE, this.hndEscape);
      // this.addEventListener(EVENT_TREE.COPY, this.hndCopyPaste);
      // this.addEventListener(EVENT_TREE.PASTE, this.hndCopyPaste);
      // this.addEventListener(EVENT_TREE.CUT, this.hndCopyPaste);
      // @ts-ignore
      // this.addEventListener(EVENT_TREE.FOCUS_NEXT, this.hndFocus);
      // @ts-ignore
      // this.addEventListener(EVENT_TREE.FOCUS_PREVIOUS, this.hndFocus);
    }

    /**
     * Create the table
     */
    public create(): void {
      this.innerHTML = "";

      // create head
      let head: TABLE[] = this.controller.getHead();
      let tr: HTMLTableRowElement = document.createElement("tr");
      for (let entry of head) {
        let th: HTMLTableHeaderCellElement = document.createElement("th");
        th.textContent = entry.label;
        th.setAttribute("key", entry.key.toString());

        if (entry.sortable) {
          th.appendChild(this.getSortButtons());
          th.addEventListener(EVENT_TABLE.CHANGE, this.hndSort);
        }

        tr.appendChild(th);
      }
      this.appendChild(tr);

      for (let row of this.data) {
        tr = document.createElement("tr");
        for (let entry of head) {
          let value: Object = Reflect.get(row, entry.key);
          let td: HTMLTableCellElement = document.createElement("td");
          td.innerHTML = value.toString();
          tr.appendChild(td);
        }
        this.appendChild(tr);
      }
    }

    /**
     * Clear the current selection
     */
    public clearSelection(): void {
      this.controller.selection.splice(0);
      // this.displaySelection(<T[]>this.controller.selection);
    }

    /**
     * Return the object in focus
     */
    public getFocussed(): T {
      // let items: TreeItem<T>[] = <TreeItem<T>[]>Array.from(this.querySelectorAll("li"));
      // let found: number = items.indexOf(<TreeItem<T>>document.activeElement);
      // if (found > -1)
      //   return items[found].data;

      return null;
    }

    private getSortButtons(): HTMLElement {
      let result: HTMLElement = document.createElement("span");
      for (let direction of ["up", "down"]) {
        let button: HTMLInputElement = document.createElement("input");
        button.type = "radio";
        button.name = "sort";
        button.value = direction;
        result.appendChild(button);
      }
      return result;
    }

    private hndSort(_event: Event): void {
      let direction: string = (<HTMLInputElement>_event.target).value;
      let key: string = (<HTMLElement>_event.currentTarget).getAttribute("key");

      this.controller.sort(this.data, key, direction == "up");
    }

    // private hndRename(_event: Event): void {
    //   // let item: TreeItem<T> = <TreeItem<T>>(<HTMLInputElement>_event.target).parentNode;
    //   // let renamed: boolean = this.controller.rename(item.data, item.getLabel());
    //   // if (renamed)
    //   //   item.setLabel(this.controller.getLabel(item.data));
    // }

    // // Callback / Eventhandler in Tree
    // private hndSelect(_event: Event): void {
    //   // // _event.stopPropagation();
    //   // let detail: { data: Object, interval: boolean, additive: boolean } = (<CustomEvent>_event).detail;
    //   // let index: number = this.controller.selection.indexOf(<T>detail.data);

    //   // if (detail.interval) {
    //   //   let dataStart: T = <T>this.controller.selection[0];
    //   //   let dataEnd: T = <T>detail.data;
    //   //   this.clearSelection();
    //   //   this.selectInterval(dataStart, dataEnd);
    //   //   return;
    //   // }

    //   // if (index >= 0 && detail.additive)
    //   //   this.controller.selection.splice(index, 1);
    //   // else {
    //   //   if (!detail.additive)
    //   //     this.clearSelection();
    //   //   this.controller.selection.push(<T>detail.data);
    //   // }

    //   // this.displaySelection(<T[]>this.controller.selection);
    // }

    // private hndDrop(_event: DragEvent): void {
    //   // _event.stopPropagation();
    //   // this.addChildren(this.controller.dragDrop.sources, this.controller.dragDrop.target);
    // }

    // private hndDelete = (_event: Event): void => {
    //   // let target: TreeItem<T> = <TreeItem<T>>_event.target;
    //   // _event.stopPropagation();
    //   // let remove: T[] = this.controller.delete([target.data]);

    //   // this.delete(remove);
    // }

    // private hndEscape = (_event: Event): void => {
    //   this.clearSelection();
    // }

    // private hndCopyPaste = async (_event: Event): Promise<void> => {
    //   // // console.log(_event);
    //   // _event.stopPropagation();
    //   // let target: TreeItem<T> = <TreeItem<T>>_event.target;
    //   // switch (_event.type) {
    //   //   case EVENT_TREE.COPY:
    //   //     this.controller.copyPaste.sources = await this.controller.copy([...this.controller.selection]);
    //   //     break;
    //   //   case EVENT_TREE.PASTE:
    //   //     this.addChildren(this.controller.copyPaste.sources, target.data);
    //   //     break;
    //   //   case EVENT_TREE.CUT:
    //   //     this.controller.copyPaste.sources = await this.controller.copy([...this.controller.selection]);
    //   //     let cut: T[] = this.controller.delete(this.controller.selection);
    //   //     this.delete(cut);
    //   //     break;
    //   // }
    // }

    // private hndFocus = (_event: KeyboardEvent): void => {
    //   // _event.stopPropagation();
    //   // let items: TreeItem<T>[] = <TreeItem<T>[]>Array.from(this.querySelectorAll("li"));
    //   // let target: TreeItem<T> = <TreeItem<T>>_event.target;
    //   // let index: number = items.indexOf(target);
    //   // if (index < 0)
    //   //   return;

    //   // if (_event.shiftKey && this.controller.selection.length == 0)
    //   //   target.select(true);

    //   // switch (_event.type) {
    //   //   case EVENT_TREE.FOCUS_NEXT:
    //   //     if (++index < items.length)
    //   //       items[index].focus();
    //   //     break;
    //   //   case EVENT_TREE.FOCUS_PREVIOUS:
    //   //     if (--index >= 0)
    //   //       items[index].focus();
    //   //     break;
    //   //   default:
    //   //     break;
    //   // }

    //   // if (_event.shiftKey)
    //   //   (<TreeItem<T>>document.activeElement).select(true);
    //   // else if (!_event.ctrlKey)
    //   //   this.clearSelection();
    // }
  }

  customElements.define("table-fudge", Table, { extends: "table" });
}
