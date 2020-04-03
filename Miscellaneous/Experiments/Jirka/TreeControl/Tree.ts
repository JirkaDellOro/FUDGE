///<reference path="../../../../Core/Build/FudgeCore.d.ts"/>
namespace TreeControl {
  import ƒ = FudgeCore;

  export enum TREE_CLASS {
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
   * Extension of [[TreeItem]] that represents the root of a tree control
   */
  export class Tree<T> extends TreeList<T> {
    public broker: TreeBroker<T>;

    constructor(_broker: TreeBroker<T>, _root: T) {
      super([]);
      this.broker = _broker;
      let root: TreeItem<T> = new TreeItem<T>(this.broker, _root);
      this.appendChild(root);

      this.addEventListener(EVENT_TREE.OPEN, this.hndOpen);
      this.addEventListener(EVENT_TREE.RENAME, this.hndRename);
      this.addEventListener(EVENT_TREE.SELECT, this.hndSelect);
      this.addEventListener(EVENT_TREE.DROP, this.hndDrop);
    }

    /**
     * Clear the current selection
     */
    public clearSelection(): void {
      this.broker.selection.splice(0);
      this.displaySelection(<T[]>this.broker.selection);
    }

    private hndOpen(_event: Event): void {
      let item: TreeItem<T> = <TreeItem<T>>_event.target;
      let children: T[] = this.broker.getChildren(item.data);
      if (!children)
        return;

      let branch: TreeList<T> = this.createBranch(children);
      item.setBranch(branch);
      this.displaySelection(<T[]>this.broker.selection);
    }

    private createBranch(_data: T[]): TreeList<T> {
      let branch: TreeList<T> = new TreeList<T>([]);
      for (let child of _data) {
        branch.addItems([new TreeItem(this.broker, child)]);
      }
      return branch;
    }

    private hndRename(_event: Event): void {
      let item: TreeItem<T> = <TreeItem<T>>(<HTMLInputElement>_event.target).parentNode;
      let renamed: boolean = this.broker.rename(item.data, item.getLabel());
      if (renamed)
        item.setLabel(this.broker.getLabel(item.data));
    }

    // Callback / Eventhandler in Tree
    private hndSelect(_event: CustomEvent): void {
      _event.stopPropagation();
      let index: number = this.broker.selection.indexOf(_event.detail.data);

      if (_event.detail.interval) {
        let dataStart: T = <T>this.broker.selection[0];
        let dataEnd: T = _event.detail.data;
        this.clearSelection();
        this.selectInterval(dataStart, dataEnd);
        return;
      }

      if (index >= 0 && _event.detail.additive)
        this.broker.selection.splice(index, 1);
      else {
        if (!_event.detail.additive)
          this.clearSelection();
        this.broker.selection.push(_event.detail.data);
      }

      this.displaySelection(<T[]>this.broker.selection);
    }

    private hndDrop(_event: DragEvent): void {
      _event.stopPropagation();

      // if drop target included in drag source -> no drag&drop possible
      if (this.broker.dragDrop.source.indexOf(this.broker.dragDrop.target) > -1)
        return;

      // if the drop method of the broker returns falls -> no drag&drop possible
      if (!this.broker.drop(<T[]>this.broker.dragDrop.source, <T>this.broker.dragDrop.target))
        return;

      this.delete(<T[]>this.broker.dragDrop.source);

      let targetData: T = <T>this.broker.dragDrop.target;
      let targetItem: TreeItem<T> = this.findOpen(targetData);

      let branch: TreeList<T> = this.createBranch(this.broker.getChildren(targetData));
      let old: TreeList<T> = targetItem.getBranch();
      targetItem.hasChildren = true;
      if (old)
        old.restructure(branch);
      else
        targetItem.open(true);

      this.broker.dragDrop.source = [];
      this.broker.dragDrop.target = null;
    }
  }

  customElements.define("ul-tree", <CustomElementConstructor><unknown>Tree, { extends: "ul" });
}
