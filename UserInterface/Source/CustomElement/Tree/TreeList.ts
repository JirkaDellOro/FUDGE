///<reference path="../../../../Core/Build/FudgeCore.d.ts"/>
namespace FudgeUserInterface {

  /**
  * Extension of ul-element that keeps a list of [[TreeItem]]s to represent a branch in a tree
  */
  export class TreeList<T> extends HTMLUListElement {

    constructor(_items: TreeItem<T>[] = []) {
      super();
      this.addItems(_items);
      this.className = "tree";
    }

    /**
     * Expands the tree along the given path to show the objects the path includes
     * @param _path An array of objects starting with one being contained in this treelist and following the correct hierarchy of successors
     * @param _focus If true (default) the last object found in the tree gets the focus
     */
    public show(_path: T[], _focus: boolean = true): void {
      let currentTree: TreeList<T> = this;

      for (let data of _path) {
        let item: TreeItem<T> = currentTree.findItem(data);
        item.focus();
        let content: TreeList<T> = item.getBranch();
        if (!content) {
          item.expand(true);
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
    public restructure(_tree: TreeList<T>): void {
      let items: TreeItem<T>[] = [];
      for (let item of _tree.getItems()) {
        let found: TreeItem<T> = this.findItem(item.data);
        if (found) {
          found.setLabel(item.display);
          found.hasChildren = item.hasChildren;
          if (!found.hasChildren)
            found.expand(false);
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
    public findItem(_data: T): TreeItem<T> {
      for (let item of this.children)
        if ((<TreeItem<T>>item).data == _data)
          return <TreeItem<T>>item;

      return null;
    }

    /**
     * Adds the given [[TreeItem]]s at the end of this list
     */
    public addItems(_items: TreeItem<T>[]): void {
      for (let item of _items) {
        this.appendChild(item);
      }
    }

    /**
     * Returns the content of this list as array of [[TreeItem]]s
     */
    public getItems(): TreeItem<T>[] {
      return <TreeItem<T>[]><unknown>this.children;
    }

    public displaySelection(_data: T[]): void {
      let items: NodeListOf<TreeItem<T>> = <NodeListOf<TreeItem<T>>>this.querySelectorAll("li");
      for (let item of items)
        item.selected = (_data != null && _data.indexOf(item.data) > -1);
    }

    public selectInterval(_dataStart: T, _dataEnd: T): void {
      let items: NodeListOf<TreeItem<T>> = <NodeListOf<TreeItem<T>>>this.querySelectorAll("li");
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
    }

    public delete(_data: T[]): TreeItem<T>[] {
      let items: NodeListOf<TreeItem<T>> = <NodeListOf<TreeItem<T>>>this.querySelectorAll("li");
      let deleted: TreeItem<T>[] = [];

      for (let item of items)
        if (_data.indexOf(item.data) > -1) {
          // item.dispatchEvent(new Event(EVENT.UPDATE, { bubbles: true }));
          item.dispatchEvent(new Event(EVENT.REMOVE_CHILD, { bubbles: true }));
          deleted.push(item.parentNode.removeChild(item));
        }

      return deleted;
    }

    public findVisible(_data: T): TreeItem<T> {
      let items: NodeListOf<TreeItem<T>> = <NodeListOf<TreeItem<T>>>this.querySelectorAll("li");
      for (let item of items)
        if (_data == item.data)
          return item;
      return null;
    }
  }


  customElements.define("ul-tree-list", TreeList, { extends: "ul" });
}