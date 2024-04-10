namespace FudgeUserInterface {

  /**
   * Extension of ul-element that keeps a list of {@link CustomTreeItem}s to represent a branch in a tree
   */
  export class CustomTreeList<T> extends HTMLUListElement {
    public controller: CustomTreeController<T>;

    public constructor(_controller: CustomTreeController<T>, _items: CustomTreeItem<T>[] = []) {
      super();
      this.controller = _controller;
      this.addItems(_items);
      this.addEventListener(EVENT.DRAG_OVER, this.hndDragOver);
      this.className = "tree";
    }

    /**
     * Expands the tree along the given paths to show the objects the paths include.
     */
    public expand(_paths: T[][]): void {
      for (let path of _paths)
        this.show(path);
    }

    /**
     * Expands the tree along the given path to show the objects the path includes.
     */
    public show(_path: T[]): void {
      let currentTree: CustomTreeList<T> = this;

      for (let data of _path) {
        let item: CustomTreeItem<T> = currentTree.findItem(data);
        if (!item)
          break;
        
        if (!item.expanded)
          item.expand(true);

        currentTree = item.getBranch();
      }
    }

    /**
     * Restructures the list to sync with the given list. 
     * {@link CustomTreeItem}s referencing the same object remain in the list, new items get added in the order of appearance, obsolete ones are deleted.
     * @param _tree A list to sync this with
     */
    public restructure(_tree: CustomTreeList<T>): void {
      let items: CustomTreeItem<T>[] = [];
      for (let item of _tree.getItems()) {
        let found: CustomTreeItem<T> = this.findItem(item.data);
        if (found) {
          found.refreshContent();
          found.hasChildren = item.hasChildren;
          if (!found.hasChildren)
            found.expand(false);
          items.push(found);
        } else
          items.push(item);
      }

      this.innerHTML = "";
      this.addItems(items);
      this.displaySelection(this.controller.selection);
    }

    /**
     * Returns the {@link CustomTreeItem} of this list referencing the given object or null, if not found
     */
    public findItem(_data: T): CustomTreeItem<T> {
      for (let item of this.children)
        if (this.controller.equals((<CustomTreeItem<T>>item).data, _data))
          return <CustomTreeItem<T>>item;

      return null;
    }

    /**
     * Adds the given {@link CustomTreeItem}s at the end of this list
     */
    public addItems(_items: CustomTreeItem<T>[]): void {
      for (let item of _items) {
        this.appendChild(item);
      }
    }

    /**
     * Returns the content of this list as array of {@link CustomTreeItem}s
     */
    public getItems(): CustomTreeItem<T>[] {
      return <CustomTreeItem<T>[]>Array.from(this.children).filter(_child => _child instanceof CustomTreeItem);
    }

    public displaySelection(_data: T[]): void {
      let items: NodeListOf<CustomTreeItem<T>> = <NodeListOf<CustomTreeItem<T>>>this.querySelectorAll("li");
      for (let item of items)
        item.selected = (_data != null && _data.indexOf(item.data) > -1);
    }

    public selectInterval(_dataStart: T, _dataEnd: T): void {
      let items: NodeListOf<CustomTreeItem<T>> = <NodeListOf<CustomTreeItem<T>>>this.querySelectorAll("li");
      let selecting: boolean = false;
      let end: T = null;
      for (let item of items) {
        if (!selecting) {
          selecting = true;
          if (this.controller.equals(item.data, _dataStart))
            end = _dataEnd;
          else if (this.controller.equals(item.data, _dataEnd))
            end = _dataStart;
          else
            selecting = false;
        }
        if (selecting) {
          item.select(true, false);
          if (this.controller.equals(item.data, end))
            break;
        }
      }
    }

    public delete(_data: T[]): CustomTreeItem<T>[] {
      let items: NodeListOf<CustomTreeItem<T>> = <NodeListOf<CustomTreeItem<T>>>this.querySelectorAll("li");
      let deleted: CustomTreeItem<T>[] = [];

      for (let item of items)
        if (_data.indexOf(item.data) > -1) {
          item.dispatchEvent(new Event(EVENT.REMOVE_CHILD, { bubbles: true }));
          deleted.push(item.parentNode.removeChild(item));
        }

      return deleted;
    }

    public findVisible(_data: T): CustomTreeItem<T> {
      let items: NodeListOf<CustomTreeItem<T>> = <NodeListOf<CustomTreeItem<T>>>this.querySelectorAll("li");
      for (let item of items)
        if (this.controller.equals(_data, item.data))
          return item;
      return null;
    }

    /**
     * Returns all expanded {@link CustomTreeItem}s that are a descendant of this list.
     */
    public getExpanded(): CustomTreeItem<T>[] {
      return [...this].filter(_item => _item.expanded);
    }

    public *[Symbol.iterator](): Iterator<CustomTreeItem<T>> {
      let items: NodeListOf<CustomTreeItem<T>> = <NodeListOf<CustomTreeItem<T>>>this.querySelectorAll("li");
      for (let i: number = 0; i < items.length; i++)
        yield items[i];
    }

    private hndDragOver = (_event: DragEvent): void => {
      _event.stopPropagation();
      let target: T = (<CustomTreeItem<T>>this.parentElement).data;
      if (target == null || !this.controller.canAddChildren(this.controller.dragDrop.sources, target))
        return;

      _event.preventDefault();
      _event.dataTransfer.dropEffect = "move";

      if (_event.target == this)
        this.controller.dragDropIndicator.remove();
      else {
        let targetItem: CustomTreeItem<T> = <CustomTreeItem<T>>_event.composedPath().find(_target => _target instanceof CustomTreeItem);
        if (this.getItems().includes(targetItem)) {
          let rect: DOMRect = targetItem.content.getBoundingClientRect();
          let addBefore: boolean = _event.clientY < rect.top + rect.height / 2;
          let sibling: Element = addBefore ? targetItem.previousElementSibling : targetItem.nextElementSibling;
          if (sibling != this.controller.dragDropIndicator)
            if (addBefore)
              targetItem.before(this.controller.dragDropIndicator);
            else
              targetItem.after(this.controller.dragDropIndicator);
        }
      }

      this.controller.dragDrop.at = this.controller.dragDropIndicator.isConnected ?
        Array.from(this.children).indexOf(this.controller.dragDropIndicator) :
        this.controller.dragDrop.at = null;
      this.controller.dragDrop.target = target;
    };
  }

  customElements.define("ul-custom-tree-list", CustomTreeList, { extends: "ul" });
}