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
    })(EVENT_TREE = TreeControl.EVENT_TREE || (TreeControl.EVENT_TREE = {}));
    /**
     * Extension of li-element that represents an object in a [[TreeList]] with a checkbox and a textinput as content.
     * Additionally, may hold an instance of [[TreeList]] if the corresponding object appears to have children.
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
                    case "focusNext":
                        let next = listening.nextElementSibling;
                        if (!next)
                            return;
                        next.focus();
                        _event.stopPropagation();
                        break;
                    case "focusPrevious":
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
                // console.log(_event);
                // console.log(document.activeElement);
            };
            this.hndKey = (_event) => {
                // console.log(_event);
                _event.stopPropagation();
                let target = _event.target;
                let item = _event.currentTarget;
                let content = item.querySelector("ul");
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
                            item.dispatchEvent(new Event("focusNext", { bubbles: true }));
                        break;
                    case ƒ.KEYBOARD_CODE.ARROW_UP:
                        item.dispatchEvent(new Event("focusPrevious", { bubbles: true }));
                        break;
                    case ƒ.KEYBOARD_CODE.F2:
                        let text = item.querySelector("input[type=text]");
                        text.disabled = false;
                        text.focus();
                        break;
                }
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
                        console.log(target.value);
                        target.disabled = true;
                        item.focus();
                        target.dispatchEvent(new Event("rename", { bubbles: true }));
                        break;
                    case "default":
                        console.log(target);
                        break;
                }
            };
            this.update(_display, _data, _hasChildren);
            // TODO: handle cssClasses
            this.create();
            this.addEventListener("change", this.hndChange);
            // this.addEventListener("focusin", this.hndFocus);
        }
        update(_display, _data, _hasChildren, _classes) {
            this.display = _display;
            this.data = _data;
            this.hasChildren = _hasChildren;
        }
        open(_open) {
            this.removeContent();
            if (_open) {
                // TODO: fire "open" - Event, handler must take care of creating new branch
                this.dispatchEvent(new Event(EVENT_TREE.OPEN, { bubbles: true }));
                // let entry: TreeEntry = this.backlink.get(_item);
                // let children: TreeEntry[] = entry.children;
                // if (children)
                //   _item.appendChild(new TreeList(children));
            }
            this.querySelector("input[type='checkbox']").checked = _open;
        }
        add(_items) {
            // tslint:disable no-use-before-declare
            let list = new TreeList(_items);
            this.appendChild(list);
        }
        removeContent() {
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
            this.text = document.createElement("input");
            this.text.type = "text";
            // text.readOnly = true;
            this.text.disabled = true;
            this.text.value = this.display;
            this.text.draggable = true;
            this.appendChild(this.text);
            this.addEventListener("keydown", this.hndKey);
            this.addEventListener("focusNext", this.hndFocus);
            this.addEventListener("focusPrevious", this.hndFocus);
            this.tabIndex = 0;
            // this.backlink.set(item, _entry);
            // return item;
        }
    }
    /**
     * Extension of ul-element that builds a tree structure with interactive controls from an array of type TreeEntry.
     * Creates an [[TreeItem]]-Element for each entry
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
        // private backlink: Map<HTMLLIElement, TreeEntry> = new Map();
        constructor(_items) {
            super();
            this.add(_items);
        }
        show(_entries, _path, _focus = true) {
            // let currentTree: TreeList = this;
            // for (let iEntry of _path) {
            //   if (!_entries)
            //     return;
            //   let entry: TreeEntry = _entries[iEntry];
            //   let item: HTMLLIElement = currentTree.findOpen(entry);
            //   item.focus();
            //   let content: TreeList = currentTree.getBranch(item);
            //   if (!content) {
            //     currentTree.open(true);
            //     content = currentTree.getBranch(item);
            //   }
            //   currentTree = content;
            //   _entries = entry.children;
            // }
        }
        getBranch(_item) {
            return _item.querySelector("ul");
        }
        findOpen(_entry) {
            // for (let entry of this.backlink)
            //   if (entry[1] == _entry)
            //     return entry[0];
            return null;
        }
        add(_items) {
            for (let item of _items) {
                this.appendChild(item);
            }
        }
    }
    customElements.define("ul-tree-list", TreeList, { extends: "ul" });
    customElements.define("ul-tree-item", TreeItem, { extends: "li" });
    let treeItem = new TreeItem(TreeControl.data[0].display, TreeControl.data[0], TreeControl.data[0].children != undefined);
    TreeControl.tree = new TreeList([treeItem]);
    TreeControl.tree.addEventListener(EVENT_TREE.RENAME, hndRename);
    TreeControl.tree.addEventListener(EVENT_TREE.OPEN, hndOpen);
    document.body.appendChild(TreeControl.tree);
    // tree.show(data, [0, 1, 1, 0]);
    function hndRename(_event) {
        let target = _event.target;
        console.log(target.value);
    }
    function hndOpen(_event) {
        let target = _event.target;
        let children = target.data["children"];
        if (!children)
            return;
        let list = [];
        for (let child of children) {
            list.push(new TreeItem(child.display, child, child.children != undefined));
        }
        target.add(list);
        console.log(_event);
    }
})(TreeControl || (TreeControl = {}));
//# sourceMappingURL=Main.js.map