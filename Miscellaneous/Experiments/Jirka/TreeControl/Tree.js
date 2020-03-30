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
    class Tree extends TreeControl.TreeItem {
        constructor(_proxy, _root) {
            super(_root);
            this.proxy = _proxy;
        }
    }
    TreeControl.Tree = Tree;
    customElements.define("li-tree", Tree, { extends: "li" });
})(TreeControl || (TreeControl = {}));
//# sourceMappingURL=Tree.js.map