///<reference path="../../../../Core/Build/FudgeCore.d.ts"/>
var TreeControl;
(function (TreeControl) {
    let TREE_CLASS;
    (function (TREE_CLASS) {
        TREE_CLASS["SELECTED"] = "selected";
        TREE_CLASS["INACTIVE"] = "inactive";
    })(TREE_CLASS = TreeControl.TREE_CLASS || (TreeControl.TREE_CLASS = {}));
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
        EVENT_TREE["DOUBLE_CLICK"] = "dblclick";
        EVENT_TREE["KEY_DOWN"] = "keydown";
        EVENT_TREE["DRAG_START"] = "dragstart";
        EVENT_TREE["DRAG_OVER"] = "dragover";
        EVENT_TREE["DROP"] = "drop";
        EVENT_TREE["POINTER_UP"] = "pointerup";
        EVENT_TREE["SELECT"] = "itemselect";
    })(EVENT_TREE = TreeControl.EVENT_TREE || (TreeControl.EVENT_TREE = {}));
    /**
     * Extension of [[TreeItem]] that represents the root of a tree control
     */
    class Tree extends TreeControl.TreeList {
        constructor(_broker, _root) {
            super([]);
            this.broker = _broker;
            let root = new TreeControl.TreeItem(this.broker, _root);
            this.appendChild(root);
            this.addEventListener(EVENT_TREE.OPEN, this.hndOpen);
            this.addEventListener(EVENT_TREE.RENAME, this.hndRename);
            this.addEventListener(EVENT_TREE.SELECT, this.hndSelect);
            this.addEventListener(EVENT_TREE.DROP, this.hndDrop);
        }
        /**
         * Clear the current selection
         */
        clearSelection() {
            this.broker.selection.splice(0);
            this.displaySelection(this.broker.selection);
        }
        hndOpen(_event) {
            let item = _event.target;
            let children = this.broker.getChildren(item.data);
            if (!children)
                return;
            let branch = this.createBranch(children);
            item.setBranch(branch);
            this.displaySelection(this.broker.selection);
        }
        createBranch(_data) {
            let branch = new TreeControl.TreeList([]);
            for (let child of _data) {
                branch.addItems([new TreeControl.TreeItem(this.broker, child)]);
            }
            return branch;
        }
        hndRename(_event) {
            let item = _event.target.parentNode;
            let renamed = this.broker.rename(item.data, item.getLabel());
            if (renamed)
                item.setLabel(this.broker.getLabel(item.data));
        }
        // Callback / Eventhandler in Tree
        hndSelect(_event) {
            _event.stopPropagation();
            let index = this.broker.selection.indexOf(_event.detail.data);
            if (_event.detail.interval) {
                let dataStart = this.broker.selection[0];
                let dataEnd = _event.detail.data;
                this.clearSelection();
                this.selectInterval(dataStart, dataEnd);
                return;
            }
            if (index >= 0 && _event.detail.additive)
                this.broker.selection.splice(index, 1);
            else {
                if (!_event.detail.additive)
                    this.clearSelection();
                this.broker.selection.push(_event.detail.data);
            }
            this.displaySelection(this.broker.selection);
        }
        hndDrop(_event) {
            _event.stopPropagation();
            // if drop target included in drag source -> no drag&drop possible
            if (this.broker.dragDrop.source.indexOf(this.broker.dragDrop.target) > -1)
                return;
            // if the drop method of the broker returns falls -> no drag&drop possible
            if (!this.broker.drop(this.broker.dragDrop.source, this.broker.dragDrop.target))
                return;
            this.delete(this.broker.dragDrop.source);
            let targetData = this.broker.dragDrop.target;
            let targetItem = this.findOpen(targetData);
            let branch = this.createBranch(this.broker.getChildren(targetData));
            let old = targetItem.getBranch();
            targetItem.hasChildren = true;
            if (old)
                old.restructure(branch);
            else
                targetItem.open(true);
            this.broker.dragDrop.source = [];
            this.broker.dragDrop.target = null;
        }
    }
    TreeControl.Tree = Tree;
    customElements.define("ul-tree", Tree, { extends: "ul" });
})(TreeControl || (TreeControl = {}));
//# sourceMappingURL=Tree.js.map