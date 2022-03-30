namespace FudgeUserInterface {

  // TODO: duplicated code in Table and Tree, may be optimized...

  export interface TABLE {
    label: string;
    key: string;
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
    public icon: string;

    constructor(_controller: TableController<T>, _data: T[], _icon?: string) {
      super();
      this.controller = _controller;
      this.data = _data;
      this.icon = _icon;
      this.create();
      this.className = "sortable";

      this.addEventListener(EVENT.SORT, <EventListener>this.hndSort);
      this.addEventListener(EVENT.SELECT, this.hndSelect);
      this.addEventListener(EVENT.FOCUS_NEXT, <EventListener>this.hndFocus);
      this.addEventListener(EVENT.FOCUS_PREVIOUS, <EventListener>this.hndFocus);
      this.addEventListener(EVENT.ESCAPE, this.hndEscape);
      this.addEventListener(EVENT.DELETE, this.hndDelete);
      // this.addEventListener(EVENT_TABLE.CHANGE, this.hndSort);
      // this.addEventListener(EVENT_TREE.RENAME, this.hndRename);
      // this.addEventListener(EVENT_TREE.DROP, this.hndDrop);
      // this.addEventListener(EVENT_TREE.COPY, this.hndCopyPaste);
      // this.addEventListener(EVENT_TREE.PASTE, this.hndCopyPaste);
      // this.addEventListener(EVENT_TREE.CUT, this.hndCopyPaste);
    }

    /**
     * Create the table
     */
    public create(): void {
      this.innerHTML = "";
      let head: TABLE[] = this.controller.getHead();

      this.appendChild(this.createHead(head));

      for (let row of this.data) {
        // tr = this.createRow(row, head);
        let item: TableItem<T> = new TableItem<T>(this.controller, row);
        // TODO: see if icon consideration should move to TableItem
        if (this.icon)
          item.setAttribute("icon", Reflect.get(row, this.icon));
        this.appendChild(item);
      }
    }

    /**
     * Clear the current selection
     */
    public clearSelection(): void {
      this.controller.selection.splice(0);
      this.displaySelection(<T[]>this.controller.selection);
    }

    /**
     * Return the object in focus
     */
    public getFocussed(): T {
      let items: TableItem<T>[] = <TableItem<T>[]>Array.from(this.querySelectorAll("tr"));
      let found: number = items.indexOf(<TableItem<T>>document.activeElement);
      if (found > -1)
        return items[found].data;

      return null;
    }

    public selectInterval(_dataStart: T, _dataEnd: T): void {
      let items: NodeListOf<TableItem<T>> = <NodeListOf<TableItem<T>>>this.querySelectorAll("tr");
      let selecting: boolean = false;
      let end: T = null;
      for (let item of items) {
        if (!selecting) {
          selecting = true;
          if (item.data == _dataStart)
            end = _dataEnd;
          else if (item.data == _dataEnd)
            end = _dataStart;
          else
            selecting = false;
        }
        if (selecting) {
          item.select(true, false);
          if (item.data == end)
            break;
        }
      }
      // console.log(_dataStart, _dataEnd);
    }

    public displaySelection(_data: T[]): void {
      // console.log(_data);
      let items: NodeListOf<TableItem<T>> = <NodeListOf<TableItem<T>>>this.querySelectorAll("tr");
      for (let item of items)
        item.selected = (_data != null && _data.indexOf(item.data) > -1);
    }

    private createHead(_headInfo: TABLE[]): HTMLTableRowElement {
      let tr: HTMLTableRowElement = document.createElement("tr");
      for (let entry of _headInfo) {
        let th: HTMLTableHeaderCellElement = document.createElement("th");
        th.textContent = entry.label;
        th.setAttribute("key", entry.key);

        if (entry.sortable) {
          th.appendChild(this.getSortButtons());
          th.addEventListener(
            EVENT.CHANGE,
            (_event: Event) => th.dispatchEvent(new CustomEvent(EVENT.SORT, { detail: _event.target, bubbles: true }))
          );
        }
        tr.appendChild(th);
      }
      return tr;
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

    private hndSort(_event: CustomEvent): void {
      let value: string = (<HTMLInputElement>_event.detail).value;
      let key: string = (<HTMLElement>_event.target).getAttribute("key");
      let direction: number = (value == "up") ? 1 : -1;
      this.controller.sort(this.data, key, direction);
      this.create();
    }

    // private hndEvent(_event: Event): void {
    //   console.log(_event.currentTarget);
    //   switch (_event.type) {
    //     case EVENT.CLICK:
    //       let event: CustomEvent = new CustomEvent(EVENT.SELECT, { bubbles: true });
    //       this.dispatchEvent(event);
    //   }
    // }

    // private hndRename(_event: Event): void {
    //   // let item: TreeItem<T> = <TreeItem<T>>(<HTMLInputElement>_event.target).parentNode;
    //   // let renamed: boolean = this.controller.rename(item.data, item.getLabel());
    //   // if (renamed)
    //   //   item.setLabel(this.controller.getLabel(item.data));
    // }

    private hndSelect(_event: Event): void {
      // _event.stopPropagation();
      let detail: { data: Object, interval: boolean, additive: boolean } = (<CustomEvent>_event).detail;
      let index: number = this.controller.selection.indexOf(<T>detail.data);

      if (detail.interval) {
        let dataStart: T = <T>this.controller.selection[0];
        let dataEnd: T = <T>detail.data;
        this.clearSelection();
        this.selectInterval(dataStart, dataEnd);
        return;
      }

      if (index >= 0 && detail.additive)
        this.controller.selection.splice(index, 1);
      else {
        if (!detail.additive)
          this.clearSelection();
        this.controller.selection.push(<T>detail.data);
      }

      this.displaySelection(<T[]>this.controller.selection);
    }

    // private hndDrop(_event: DragEvent): void {
    //   // _event.stopPropagation();
    //   // this.addChildren(this.controller.dragDrop.sources, this.controller.dragDrop.target);
    // }

    private hndDelete = async (_event: Event): Promise<void> => {
      let target: TableItem<T> = <TableItem<T>>_event.target;
      _event.stopPropagation();
      let deleted: T[] = await this.controller.delete([target.data]);
      if (deleted.length)
        this.dispatchEvent(new Event(EVENT.REMOVE_CHILD, { bubbles: true }));
    }

    private hndEscape = (_event: Event): void => {
      this.clearSelection();
    }

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

    private hndFocus = (_event: KeyboardEvent): void => {
      _event.stopPropagation();
      let items: TableItem<T>[] = <TableItem<T>[]>Array.from(this.querySelectorAll("tr"));
      let target: TableItem<T> = <TableItem<T>>_event.target;
      let index: number = items.indexOf(target);
      if (index < 0)
        return;

      if (_event.shiftKey && this.controller.selection.length == 0)
        target.select(true);

      switch (_event.type) {
        case EVENT.FOCUS_NEXT:
          if (++index < items.length)
            items[index].focus();
          break;
        case EVENT.FOCUS_PREVIOUS:
          if (--index >= 0)
            items[index].focus();
          break;
        default:
          break;
      }

      if (_event.shiftKey)
        (<TreeItem<T>>document.activeElement).select(true);
      else if (!_event.ctrlKey)
        this.clearSelection();
    }
  }

  customElements.define("table-sortable", Table, { extends: "table" });
}
