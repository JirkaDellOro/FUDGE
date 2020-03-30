///<reference path="../../../../Core/Build/FudgeCore.d.ts"/>
var TreeControl;
(function (TreeControl) {
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
        constructor(_items = []) {
            super();
            this.addItems(_items);
        }
        /**
         * Opens the tree along the given path to show the objects the path includes
         * @param _path An array of objects starting with one being contained in this treelist and following the correct hierarchy of successors
         * @param _focus If true (default) the last object found in the tree gets the focus
         */
        show(_path, _focus = true) {
            let currentTree = this;
            for (let data of _path) {
                let item = currentTree.findItem(data);
                item.focus();
                let content = item.getBranch();
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
        restructure(_tree) {
            let items = [];
            for (let item of _tree.getItems()) {
                let found = this.findItem(item.data);
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
        findItem(_data) {
            for (let item of this.children)
                if (item.data == _data)
                    return item;
            return null;
        }
        /**
         * Adds the given [[TreeItem]]s at the end of this list
         */
        addItems(_items) {
            for (let item of _items) {
                this.appendChild(item);
            }
        }
        /**
         * Returns the content of this list as array of [[TreeItem]]s
         */
        getItems() {
            return this.children;
        }
        displaySelection(_data) {
            let items = this.querySelectorAll("li");
            for (let item of items)
                item.selected = (_data != null && _data.indexOf(item.data) > -1);
        }
        selectInterval(_dataStart, _dataEnd) {
            let items = this.querySelectorAll("li");
            let selecting = false;
            let end = null;
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
        delete(_data) {
            let items = this.querySelectorAll("li");
            let deleted = [];
            for (let item of items)
                if (_data.indexOf(item.data) > -1)
                    deleted.push(item.parentNode.removeChild(item));
            return deleted;
        }
        findOpen(_data) {
            let items = this.querySelectorAll("li");
            for (let item of items)
                if (_data == item.data)
                    return item;
            return null;
        }
    }
    TreeControl.TreeList = TreeList;
    customElements.define("ul-tree-list", TreeList, { extends: "ul" });
})(TreeControl || (TreeControl = {}));
//# sourceMappingURL=TreeList.js.map