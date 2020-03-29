///<reference path="../../../../Core/Build/FudgeCore.d.ts"/>
var TreeControl;
(function (TreeControl) {
    var ƒ = FudgeCore;
    let TREE_CLASSES;
    (function (TREE_CLASSES) {
        TREE_CLASSES["SELECTED"] = "selected";
    })(TREE_CLASSES = TreeControl.TREE_CLASSES || (TreeControl.TREE_CLASSES = {}));
    let EVENT_TREE;
    (function (EVENT_TREE) {
        EVENT_TREE["RENAME"] = "rename";
        EVENT_TREE["OPEN"] = "open";
        EVENT_TREE["FOCUS_NEXT"] = "focusNext";
        EVENT_TREE["FOCUS_PREVIOUS"] = "focusPrevious";
        EVENT_TREE["DELETE"] = "delete";
    })(EVENT_TREE = TreeControl.EVENT_TREE || (TreeControl.EVENT_TREE = {}));
    /**
     * Extension of li-element that represents an object in a [[TreeList]] with a checkbox and a textinput as content.
     * Additionally, may hold an instance of [[TreeList]] to display children of the corresponding object.
     */
    class TreeItem extends HTMLLIElement {
        constructor(_display, _data, _hasChildren, _classes) {
            super();
            this.display = "TreeItem";
            this.classes = [];
            this.data = null;
            this.hasChildren = false;
            this.hndFocus = (_event) => {
                let listening = _event.currentTarget;
                switch (_event.type) {
                    case EVENT_TREE.FOCUS_NEXT:
                        let next = listening.nextElementSibling;
                        if (!next)
                            return;
                        next.focus();
                        _event.stopPropagation();
                        break;
                    case EVENT_TREE.FOCUS_PREVIOUS:
                        if (listening == _event.target)
                            return;
                        let items = listening.querySelectorAll("li");
                        let prev = listening;
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
            };
            this.hndKey = (_event) => {
                _event.stopPropagation();
                let content = this.querySelector("ul");
                switch (_event.code) {
                    case ƒ.KEYBOARD_CODE.ARROW_RIGHT:
                        if (content)
                            content.firstChild.focus();
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
                            content.firstChild.focus();
                        else
                            this.dispatchEvent(new Event(EVENT_TREE.FOCUS_NEXT, { bubbles: true }));
                        break;
                    case ƒ.KEYBOARD_CODE.ARROW_UP:
                        this.dispatchEvent(new Event(EVENT_TREE.FOCUS_PREVIOUS, { bubbles: true }));
                        break;
                    case ƒ.KEYBOARD_CODE.F2:
                        this.startTypingLabel();
                        break;
                    case ƒ.KEYBOARD_CODE.DELETE:
                        this.dispatchEvent(new Event(EVENT_TREE.DELETE, { bubbles: true }));
                        break;
                }
            };
            this.hndDblClick = (_event) => {
                _event.stopPropagation();
                this.startTypingLabel();
            };
            this.hndChange = (_event) => {
                console.log(_event);
                let target = _event.target;
                let item = target.parentElement;
                _event.stopPropagation();
                switch (target.type) {
                    case "checkbox":
                        this.open(target.checked);
                        break;
                    case "text":
                        target.disabled = true;
                        item.focus();
                        target.dispatchEvent(new Event(EVENT_TREE.RENAME, { bubbles: true }));
                        break;
                    case "default":
                        console.log(target);
                        break;
                }
            };
            this.display = _display;
            this.data = _data;
            this.hasChildren = _hasChildren;
            // TODO: handle cssClasses
            this.create();
            this.addEventListener("change", this.hndChange);
            this.addEventListener("dblclick", this.hndDblClick);
            // this.addEventListener("focusin", this.hndFocus);
        }
        /**
         * Set the label text to show
         */
        setLabel(_text) {
            this.label.value = _text;
        }
        /**
         * Get the label text shown
         */
        getLabel() {
            return this.label.value;
        }
        /**
         * Tries to open the [[TreeList]] of children, by dispatching [[EVENT_TREE.OPEN]].
         * The user of the tree needs to add an event listener to the tree
         * in order to create that [[TreeList]] and add it as branch to this item
         * @param _open If false, the item will be closed
         */
        open(_open) {
            this.removeBranch();
            if (_open)
                this.dispatchEvent(new Event(EVENT_TREE.OPEN, { bubbles: true }));
            this.querySelector("input[type='checkbox']").checked = _open;
        }
        /**
         * Sets the branch of children of this item. The branch must be a previously compiled [[TreeList]]
         */
        setBranch(_branch) {
            // tslint:disable no-use-before-declare
            this.removeBranch();
            this.appendChild(_branch);
        }
        /**
         * Returns the branch of children of this item.
         */
        getBranch() {
            return this.querySelector("ul");
        }
        /**
         * Removes the branch of children from this item
         */
        removeBranch() {
            let content = this.querySelector("ul");
            if (!content)
                return;
            this.removeChild(content);
        }
        create() {
            this.checkbox = document.createElement("input");
            this.checkbox.type = "checkbox";
            this.appendChild(this.checkbox);
            if (!this.hasChildren)
                this.checkbox.style.visibility = "hidden";
            this.label = document.createElement("input");
            this.label.type = "text";
            this.label.disabled = true;
            this.label.value = this.display;
            this.label.draggable = true;
            this.appendChild(this.label);
            this.addEventListener("keydown", this.hndKey);
            this.addEventListener(EVENT_TREE.FOCUS_NEXT, this.hndFocus);
            this.addEventListener(EVENT_TREE.FOCUS_PREVIOUS, this.hndFocus);
            this.tabIndex = 0;
        }
        startTypingLabel() {
            let text = this.querySelector("input[type=text]");
            text.disabled = false;
            text.focus();
        }
    }
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
    }
    customElements.define("ul-tree-list", TreeList, { extends: "ul" });
    customElements.define("ul-tree-item", TreeItem, { extends: "li" });
    let treeItem = new TreeItem(TreeControl.data[0].display, TreeControl.data[0], TreeControl.data[0].children != undefined);
    let tree = new TreeList([treeItem]);
    tree.addEventListener(EVENT_TREE.RENAME, hndRename);
    tree.addEventListener(EVENT_TREE.OPEN, hndOpen);
    tree.addEventListener(EVENT_TREE.DELETE, hndDelete);
    document.body.appendChild(tree);
    show(0, 1, 1, 0);
    function show(..._index) {
        let path = [];
        let branch = TreeControl.data;
        for (let i of _index) {
            path.push(branch[i]);
            branch = branch[i].children;
        }
        tree.show(path, true);
    }
    TreeControl.show = show;
    function hndRename(_event) {
        let item = _event.target.parentNode;
        let data = item.data;
        data.display = item.getLabel();
        item.setLabel(data.display);
    }
    function hndOpen(_event) {
        let item = _event.target;
        let children = item.data["children"];
        if (!children)
            return;
        let branch = new TreeList([]);
        for (let child of children) {
            branch.addItems([new TreeItem(child.display, child, child.children != undefined)]);
        }
        item.setBranch(branch);
        console.log(_event);
    }
    function hndDelete(_event) {
        let item = _event.target;
        let tree = item.parentElement;
        tree.removeChild(item);
        tree.restructure(tree);
    }
})(TreeControl || (TreeControl = {}));
//# sourceMappingURL=Main.js.map