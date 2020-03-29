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
                            this.dispatchEvent(new Event("focusNext", { bubbles: true }));
                        break;
                    case ƒ.KEYBOARD_CODE.ARROW_UP:
                        this.dispatchEvent(new Event("focusPrevious", { bubbles: true }));
                        break;
                    case ƒ.KEYBOARD_CODE.F2:
                        this.startTypingLabel();
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
                        target.dispatchEvent(new Event("rename", { bubbles: true }));
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
        setLabel(_text) {
            this.label.value = _text;
        }
        getLabel() {
            return this.label.value;
        }
        open(_open) {
            this.removeContent();
            if (_open)
                this.dispatchEvent(new Event(EVENT_TREE.OPEN, { bubbles: true }));
            this.querySelector("input[type='checkbox']").checked = _open;
        }
        addBranch(_items) {
            // tslint:disable no-use-before-declare
            let list = new TreeList(_items);
            this.appendChild(list);
        }
        getBranch() {
            return this.querySelector("ul");
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
            this.label = document.createElement("input");
            this.label.type = "text";
            this.label.disabled = true;
            this.label.value = this.display;
            this.label.draggable = true;
            this.appendChild(this.label);
            this.addEventListener("keydown", this.hndKey);
            this.addEventListener("focusNext", this.hndFocus);
            this.addEventListener("focusPrevious", this.hndFocus);
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
        constructor(_items) {
            super();
            this.add(_items);
        }
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
        findItem(_data) {
            for (let item of this.children)
                if (item.data == _data)
                    return item;
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
    let tree = new TreeList([treeItem]);
    tree.addEventListener(EVENT_TREE.RENAME, hndRename);
    tree.addEventListener(EVENT_TREE.OPEN, hndOpen);
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
        let target = _event.target;
        let children = target.data["children"];
        if (!children)
            return;
        let list = [];
        for (let child of children) {
            list.push(new TreeItem(child.display, child, child.children != undefined));
        }
        target.addBranch(list);
        console.log(_event);
    }
})(TreeControl || (TreeControl = {}));
//# sourceMappingURL=Main.js.map