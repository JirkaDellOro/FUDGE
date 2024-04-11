///<reference path="CustomTreeList.ts"/>
namespace FudgeUserInterface {

  /**
   * Extension of {@link CustomTreeList} that represents the root of a tree control  
   * ```text
   * tree <ul>
   * ├ treeItem <li>
   * ├ treeItem <li>
   * │ └ treeList <ul>
   * │   ├ treeItem <li>
   * │   └ treeItem <li>
   * └ treeItem <li>
   * ```
   */
  export class CustomTree<T> extends CustomTreeList<T> {

    public constructor(_controller: CustomTreeController<T>, _root: T) {
      super(_controller, []);
      let root: CustomTreeItem<T> = new CustomTreeItem<T>(this.controller, _root);
      this.appendChild(root);

      this.addEventListener(EVENT.EXPAND, this.hndExpand);
      this.addEventListener(EVENT.SELECT, this.hndSelect);
      this.addEventListener(EVENT.DROP, this.hndDrop, true);
      this.addEventListener(EVENT.DRAG_LEAVE, this.hndDragLeave);
      this.addEventListener(EVENT.DELETE, this.hndDelete);
      this.addEventListener(EVENT.ESCAPE, this.hndEscape);
      this.addEventListener(EVENT.COPY, this.hndCopyPaste);
      this.addEventListener(EVENT.PASTE, this.hndCopyPaste);
      this.addEventListener(EVENT.CUT, this.hndCopyPaste);
      // @ts-ignore
      this.addEventListener(EVENT.FOCUS_NEXT, this.hndFocus);
      // @ts-ignore
      this.addEventListener(EVENT.FOCUS_PREVIOUS, this.hndFocus);
    }

    /**
     * Clear the current selection
     */
    public clearSelection(): void {
      this.controller.selection.splice(0);
      this.displaySelection(<T[]>this.controller.selection);
    }

    /**
     * Return the object in focus or null if none is focussed
     */
    public getFocussed(): T {
      let items: CustomTreeItem<T>[] = <CustomTreeItem<T>[]>Array.from(this.querySelectorAll("li"));
      let found: number = items.indexOf(<CustomTreeItem<T>>document.activeElement);
      if (found > -1)
        return items[found].data;

      return null;
    }

    /**
     * Refresh the whole tree to synchronize with the data the tree is based on
     */
    public refresh(): void {
      for (const item of this) {
        if (!item.expanded)
          continue;

        let branch: CustomTreeList<T> = this.createBranch(this.controller.getChildren(item.data));
        item.getBranch().restructure(branch);
        if (!this.controller.hasChildren(item.data))
          item.expand(false);
      }
    }

    /**
     * Adds the given children to the given target at the given index. If no index is given, the children are appended at the end of the list.
     */
    public addChildren(_children: T[], _target: T, _index?: number): void {
      // if drop target included in children -> refuse
      if (_children.indexOf(_target) > -1)
        return;

      // add only the objects the addChildren-method of the controller returns
      let move: T[] = this.controller.addChildren(_children, _target, _index);
      if (!move || move.length == 0)
        return;

      let focus: T = this.getFocussed();
      // TODO: don't, when copying or coming from another source
      this.delete(move);

      let targetData: T = <T>_target;
      let targetItem: CustomTreeItem<T> = this.findVisible(targetData);

      let branch: CustomTreeList<T> = this.createBranch(this.controller.getChildren(targetData));
      let old: CustomTreeList<T> = targetItem.getBranch();
      targetItem.hasChildren = true;
      if (old)
        old.restructure(branch);
      else
        targetItem.expand(true);

      this.findVisible(focus)?.focus();
    }

    private hndExpand(_event: Event): void {
      let item: CustomTreeItem<T> = <CustomTreeItem<T>>_event.target;
      let children: T[] = this.controller.getChildren(item.data);
      if (!children || children.length == 0)
        return;

      let branch: CustomTreeList<T> = this.createBranch(children);
      item.setBranch(branch);
      this.displaySelection(this.controller.selection);
    }

    private createBranch(_data: T[]): CustomTreeList<T> {
      let branch: CustomTreeList<T> = new CustomTreeList<T>(this.controller, []);
      for (let child of _data) {
        branch.addItems([new CustomTreeItem(this.controller, child)]);
      }
      return branch;
    }

    // Callback / Eventhandler in Tree
    private hndSelect(_event: Event): void {
      // _event.stopPropagation();
      let detail: { data: Object; interval: boolean; additive: boolean } = (<CustomEvent>_event).detail;
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

    private hndDrop(_event: DragEvent): void {
      this.addChildren(this.controller.dragDrop.sources, this.controller.dragDrop.target, this.controller.dragDrop.at);
      this.controller.dragDrop.sources = [];
      this.controller.dragDropIndicator.remove();

    }

    private hndDragLeave = (_event: DragEvent): void => {
      let relatedTarget: EventTarget = _event.relatedTarget;
      if (relatedTarget instanceof HTMLElement && !this.contains(relatedTarget) && !this.contains(relatedTarget.offsetParent)) // offset parent is for weird (invisible) divs which are placed over input elements and trigger leave events... 
        this.controller.dragDropIndicator.remove();
    };

    private hndDelete = async (_event: Event): Promise<void> => {
      let target: CustomTreeItem<T> = <CustomTreeItem<T>>_event.target;
      _event.stopPropagation();
      let remove: T[] = await this.controller.delete([target.data]);
      this.delete(remove);
    };

    private hndEscape = (_event: Event): void => {
      this.clearSelection();
    };

    private hndCopyPaste = async (_event: Event): Promise<void> => {
      // console.log(_event);
      _event.stopPropagation();
      let target: CustomTreeItem<T> = <CustomTreeItem<T>>_event.target;
      switch (_event.type) {
        case EVENT.COPY:
          this.controller.copyPaste.sources = await this.controller.copy([...this.controller.selection]);
          break;
        case EVENT.PASTE:
          this.addChildren(this.controller.copyPaste.sources, target.data);
          break;
        case EVENT.CUT:
          this.controller.copyPaste.sources = await this.controller.copy([...this.controller.selection]);
          let cut: T[] = await this.controller.delete(this.controller.selection);
          this.delete(cut);
          break;
      }
    };

    private hndFocus = (_event: KeyboardEvent): void => {
      _event.stopPropagation();
      let items: CustomTreeItem<T>[] = <CustomTreeItem<T>[]>Array.from(this.querySelectorAll("li"));
      let target: CustomTreeItem<T> = <CustomTreeItem<T>>_event.target;
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
        (<CustomTreeItem<T>>document.activeElement).select(true);
      else if (!_event.ctrlKey)
        this.clearSelection();
    };
  }

  customElements.define("ul-custom-tree", <CustomElementConstructor><unknown>CustomTree, { extends: "ul" });
}
