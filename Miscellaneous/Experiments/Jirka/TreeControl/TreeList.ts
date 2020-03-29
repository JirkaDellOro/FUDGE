///<reference path="../../../../Core/Build/FudgeCore.d.ts"/>
namespace TreeControl {

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
  export class TreeList extends HTMLUListElement {

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
}