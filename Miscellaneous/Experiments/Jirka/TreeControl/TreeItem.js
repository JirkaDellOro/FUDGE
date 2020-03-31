///<reference path="../../../../Core/Build/FudgeCore.d.ts"/>
var TreeControl;
(function (TreeControl) {
    var ƒ = FudgeCore;
    /**
     * Extension of li-element that represents an object in a [[TreeList]] with a checkbox and a textinput as content.
     * Additionally, may hold an instance of [[TreeList]] as branch to display children of the corresponding object.
     */
    class TreeItem extends HTMLLIElement {
        constructor(_broker, _data) {
            super();
            this.display = "TreeItem";
            this.classes = [];
            this.data = null;
            this.hndFocus = (_event) => {
                let listening = _event.currentTarget;
                switch (_event.type) {
                    case TreeControl.EVENT_TREE.FOCUS_NEXT:
                        let next = listening.nextElementSibling;
                        if (!next)
                            return;
                        next.focus();
                        _event.stopPropagation();
                        break;
                    case TreeControl.EVENT_TREE.FOCUS_PREVIOUS:
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
                    case TreeControl.EVENT_TREE.FOCUS_OUT:
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
                        if (_event.shiftKey)
                            document.activeElement.select(true);
                        break;
                    case ƒ.KEYBOARD_CODE.ARROW_LEFT:
                        if (content)
                            this.open(false);
                        else
                            this.parentElement.focus();
                        if (_event.shiftKey)
                            document.activeElement.select(true);
                        break;
                    case ƒ.KEYBOARD_CODE.ARROW_DOWN:
                        if (content)
                            content.firstChild.focus();
                        else
                            this.dispatchEvent(new Event(TreeControl.EVENT_TREE.FOCUS_NEXT, { bubbles: true }));
                        if (_event.shiftKey)
                            document.activeElement.select(true);
                        break;
                    case ƒ.KEYBOARD_CODE.ARROW_UP:
                        this.dispatchEvent(new Event(TreeControl.EVENT_TREE.FOCUS_PREVIOUS, { bubbles: true }));
                        if (_event.shiftKey)
                            document.activeElement.select(true);
                        break;
                    case ƒ.KEYBOARD_CODE.F2:
                        this.startTypingLabel();
                        break;
                    case ƒ.KEYBOARD_CODE.SPACE:
                        this.select(_event.ctrlKey, _event.shiftKey);
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
                        target.dispatchEvent(new Event(TreeControl.EVENT_TREE.RENAME, { bubbles: true }));
                        break;
                    case "default":
                        console.log(target);
                        break;
                }
            };
            this.hndDragStart = (_event) => {
                _event.stopPropagation();
                this.broker.dragDrop.source = [];
                if (this.selected)
                    this.broker.dragDrop.source = this.broker.selection;
                else
                    this.broker.dragDrop.source = [this.data];
                _event.dataTransfer.effectAllowed = "all";
            };
            this.hndDragOver = (_event) => {
                _event.stopPropagation();
                _event.preventDefault();
                this.broker.dragDrop.target = this.data;
                _event.dataTransfer.dropEffect = "move";
            };
            this.hndPointerUp = (_event) => {
                _event.stopPropagation();
                if (_event.target == this.checkbox)
                    return;
                this.select(_event.ctrlKey, _event.shiftKey);
            };
            this.broker = _broker;
            this.data = _data;
            this.display = this.broker.getLabel(_data);
            // TODO: handle cssClasses
            this.create();
            this.hasChildren = this.broker.hasChildren(_data);
            this.addEventListener(TreeControl.EVENT_TREE.CHANGE, this.hndChange);
            this.addEventListener(TreeControl.EVENT_TREE.DOUBLE_CLICK, this.hndDblClick);
            this.addEventListener(TreeControl.EVENT_TREE.FOCUS_OUT, this.hndFocus);
            this.addEventListener(TreeControl.EVENT_TREE.KEY_DOWN, this.hndKey);
            this.addEventListener(TreeControl.EVENT_TREE.FOCUS_NEXT, this.hndFocus);
            this.addEventListener(TreeControl.EVENT_TREE.FOCUS_PREVIOUS, this.hndFocus);
            this.draggable = true;
            this.addEventListener(TreeControl.EVENT_TREE.DRAG_START, this.hndDragStart);
            this.addEventListener(TreeControl.EVENT_TREE.DRAG_OVER, this.hndDragOver);
            this.addEventListener(TreeControl.EVENT_TREE.POINTER_UP, this.hndPointerUp);
        }
        /**
         * Returns true, when this item has a visible checkbox in front to open the subsequent branch
         */
        get hasChildren() {
            return this.checkbox.style.visibility != "hidden";
        }
        /**
         * Shows or hides the checkbox for opening the subsequent branch
         */
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
                this.dispatchEvent(new Event(TreeControl.EVENT_TREE.OPEN, { bubbles: true }));
            this.querySelector("input[type='checkbox']").checked = _open;
        }
        /**
         * Returns a list of all data referenced by the items succeeding this
         */
        getOpenData() {
            let list = this.querySelectorAll("li");
            let data = [];
            for (let item of list)
                data.push(item.data);
            return data;
        }
        /**
         * Sets the branch of children of this item. The branch must be a previously compiled [[TreeList]]
         */
        setBranch(_branch) {
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
         * Returns attaches or detaches the [[TREE_CLASS.SELECTED]] to this item
         */
        set selected(_on) {
            if (_on)
                this.classList.add(TreeControl.TREE_CLASS.SELECTED);
            else
                this.classList.remove(TreeControl.TREE_CLASS.SELECTED);
        }
        /**
         * Returns true if the [[TREE_CLASSES.SELECTED]] is attached to this item
         */
        get selected() {
            return this.classList.contains(TreeControl.TREE_CLASS.SELECTED);
        }
        /**
         * Dispatches the [[EVENT_TREE.SELECT]] event
         * @param _additive For multiple selection (+Ctrl)
         * @param _interval For selection over interval (+Shift)
         */
        select(_additive, _interval = false) {
            let event = new CustomEvent(TreeControl.EVENT_TREE.SELECT, { bubbles: true, detail: { data: this.data, additive: _additive, interval: _interval } });
            this.dispatchEvent(event);
        }
        /**
         * Removes the branch of children from this item
         */
        removeBranch() {
            let content = this.getBranch();
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
    customElements.define("li-tree-item", TreeItem, { extends: "li" });
})(TreeControl || (TreeControl = {}));
//# sourceMappingURL=TreeItem.js.map