///<reference path="../../../../Core/Build/FudgeCore.d.ts"/>
var TreeControl;
(function (TreeControl) {
    let TREE_CLASSES;
    (function (TREE_CLASSES) {
        TREE_CLASSES["SELECTED"] = "selected";
        TREE_CLASSES["INACTIVE"] = "inactive";
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
        EVENT_TREE["DOUBLE_CLICK"] = "dblclick";
        EVENT_TREE["KEY_DOWN"] = "keydown";
        EVENT_TREE["DRAG_START"] = "dragstart";
        EVENT_TREE["DRAG_OVER"] = "dragover";
        EVENT_TREE["DROP"] = "drop";
        EVENT_TREE["POINTER_UP"] = "pointerup";
        EVENT_TREE["SELECT"] = "itemselect";
    })(EVENT_TREE = TreeControl.EVENT_TREE || (TreeControl.EVENT_TREE = {}));
    /**
     * Extension of li-element that represents an object in a [[TreeList]] with a checkbox and a textinput as content.
     * Additionally, it holds an instance of [[TreeList]] to display children of the corresponding object.
     */
    class Tree extends TreeControl.TreeList {
        constructor(_proxy, _root) {
            super([]);
            this.proxy = _proxy;
            let root = new TreeControl.TreeItem(this.proxy, _root);
            this.appendChild(root);
            this.addEventListener(EVENT_TREE.OPEN, this.hndOpen);
            this.addEventListener(EVENT_TREE.RENAME, this.hndRename);
            this.addEventListener(EVENT_TREE.SELECT, this.hndSelect);
            this.addEventListener(EVENT_TREE.DROP, this.hndDrop);
        }
        clearSelection() {
            this.proxy.selection.splice(0);
            this.displaySelection(this.proxy.selection);
        }
        hndOpen(_event) {
            let item = _event.target;
            let children = this.proxy.getChildren(item.data);
            if (!children)
                return;
            let branch = this.createBranch(children);
            item.setBranch(branch);
            // tree.displaySelection(this.proxy.selection);
        }
        createBranch(_data) {
            let branch = new TreeControl.TreeList([]);
            for (let child of _data) {
                branch.addItems([new TreeControl.TreeItem(this.proxy, child)]);
            }
            return branch;
        }
        hndRename(_event) {
            let item = _event.target.parentNode;
            let renamed = this.proxy.rename(item.data, item.getLabel());
            if (renamed)
                item.setLabel(this.proxy.getLabel(item.data));
        }
        // Callback / Eventhandler in Tree
        hndSelect(_event) {
            _event.stopPropagation();
            let index = this.proxy.selection.indexOf(_event.detail.data);
            if (_event.detail.interval) {
                let dataStart = this.proxy.selection[0];
                let dataEnd = _event.detail.data;
                this.clearSelection();
                this.selectInterval(dataStart, dataEnd);
                return;
            }
            if (index >= 0 && _event.detail.additive)
                this.proxy.selection.splice(index, 1);
            else {
                if (!_event.detail.additive)
                    this.clearSelection();
                this.proxy.selection.push(_event.detail.data);
            }
            this.displaySelection(this.proxy.selection);
        }
        // Use proxy to manage drop...
        hndDrop(_event) {
            _event.stopPropagation();
            if (this.proxy.dragSource[0] == this.proxy.dropTarget[0])
                return;
            // let removed: TreeEntry = deleteItem(this.proxy.dragSource);
            this.delete(this.proxy.dragSource);
            let targetData = this.proxy.dropTarget[0];
            let targetItem = this.findOpen(targetData);
            let children = this.proxy.getChildren(targetData) || [];
            children.push(this.proxy.dragSource[0]);
            // HACK!!
            targetData["children"] = children;
            let branch = this.createBranch(children);
            let old = targetItem.getBranch();
            if (old)
                old.restructure(branch);
            else
                targetItem.open(true);
            targetItem.hasChildren = true;
            this.proxy.dragSource.splice(0);
            this.proxy.dropTarget.splice(0);
        }
    }
    TreeControl.Tree = Tree;
    customElements.define("ul-tree", Tree, { extends: "ul" });
})(TreeControl || (TreeControl = {}));
// IDEA to stuff the proxy into the tree class
// export abstract class Tree<T> extends TreeItem<T> {
//   // private proxy: TreeProxy<T>;
//   constructor(_root: T) {
//     super(_root);
//   }
//   public abstract objGetLabel(_object: T): string;
//   public abstract objHasChildren(_object: T): boolean;
//   public abstract objGetChildren(_object: T): T[];
// }
//# sourceMappingURL=Tree.js.map