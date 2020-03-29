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
        EVENT_TREE["FOCUS_IN"] = "focusin";
        EVENT_TREE["FOCUS_OUT"] = "focusout";
        EVENT_TREE["DELETE"] = "delete";
        EVENT_TREE["CHANGE"] = "change";
        EVENT_TREE["RESTRUCTURE"] = "restructure";
        EVENT_TREE["DOUBLE_CLICK"] = "dblclick";
        EVENT_TREE["KEYDOWN"] = "keydown";
        EVENT_TREE["DRAG_START"] = "dragstart";
        EVENT_TREE["DRAG_OVER"] = "dragover";
        EVENT_TREE["DROP"] = "drop";
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
                    case EVENT_TREE.FOCUS_OUT:
                        if (_event.target == this.label)
                            this.label.disabled = true;
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
                if (_event.target != this.checkbox)
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
            this.hndDragStart = (_event) => {
                _event.stopPropagation();
                globalThis.dragSource = this;
                _event.dataTransfer.effectAllowed = "all";
            };
            this.hndDragOver = (_event) => {
                _event.stopPropagation();
                _event.preventDefault();
                globalThis.dragTarget = this;
                _event.dataTransfer.dropEffect = "move";
            };
            this.hndRestructure = (_event) => {
                _event.stopPropagation();
            };
            this.display = _display;
            this.data = _data;
            // TODO: handle cssClasses
            this.create();
            this.hasChildren = _hasChildren;
            this.addEventListener(EVENT_TREE.CHANGE, this.hndChange);
            this.addEventListener(EVENT_TREE.DOUBLE_CLICK, this.hndDblClick);
            this.addEventListener(EVENT_TREE.FOCUS_OUT, this.hndFocus);
            this.addEventListener(EVENT_TREE.KEYDOWN, this.hndKey);
            this.addEventListener(EVENT_TREE.FOCUS_NEXT, this.hndFocus);
            this.addEventListener(EVENT_TREE.FOCUS_PREVIOUS, this.hndFocus);
            this.draggable = true;
            this.addEventListener(EVENT_TREE.DRAG_START, this.hndDragStart);
            this.addEventListener(EVENT_TREE.DRAG_OVER, this.hndDragOver);
            this.addEventListener(EVENT_TREE.RESTRUCTURE, this.hndRestructure);
        }
        get hasChildren() {
            return this.checkbox.style.visibility != "hidden";
        }
        set hasChildren(_has) {
            this.checkbox.style.visibility = _has ? "visible" : "hidden";
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
            if (_branch)
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
            this.label = document.createElement("input");
            this.label.type = "text";
            this.label.disabled = true;
            this.label.value = this.display;
            this.appendChild(this.label);
            this.tabIndex = 0;
        }
        startTypingLabel() {
            this.label.disabled = false;
            this.label.focus();
        }
    }
    TreeControl.TreeItem = TreeItem;
    customElements.define("ul-tree-item", TreeItem, { extends: "li" });
})(TreeControl || (TreeControl = {}));
//# sourceMappingURL=TreeItem.js.map