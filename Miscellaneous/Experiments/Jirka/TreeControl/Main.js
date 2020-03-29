///<reference path="../../../../Core/Build/FudgeCore.d.ts"/>
var TreeControl;
(function (TreeControl) {
    let treeItem = new TreeControl.TreeItem(TreeControl.data[0].display, TreeControl.data[0], TreeControl.data[0].children != undefined);
    let tree = new TreeControl.TreeList([treeItem]);
    tree.addEventListener(TreeControl.EVENT_TREE.RENAME, hndRename);
    tree.addEventListener(TreeControl.EVENT_TREE.OPEN, hndOpen);
    tree.addEventListener(TreeControl.EVENT_TREE.DELETE, hndDelete);
    tree.addEventListener(TreeControl.EVENT_TREE.DROP, hndDrop);
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
        let branch = createBranch(children);
        item.setBranch(branch);
        // console.log(_event);
    }
    function createBranch(_data) {
        let branch = new TreeControl.TreeList([]);
        for (let child of _data) {
            branch.addItems([new TreeControl.TreeItem(child.display, child, child.children != undefined)]);
        }
        return branch;
    }
    function hndDelete(_event) {
        deleteItem(_event.target);
    }
    function deleteItem(_item) {
        let tree = _item.parentElement;
        let parentItem = tree.parentElement;
        let siblings = parentItem.data["children"];
        let removed = siblings.splice(siblings.indexOf(_item.data), 1);
        if (siblings.length) {
            tree.removeChild(_item);
            tree.restructure(tree);
        }
        else {
            parentItem.data["children"] = undefined;
            parentItem.setBranch(null);
            parentItem.hasChildren = false;
        }
        return removed[0];
    }
    function hndDrop(_event) {
        _event.stopPropagation();
        if (globalThis.dragSource == globalThis.dragTarget)
            return;
        let removed = deleteItem(globalThis.dragSource);
        let targetItem = globalThis.dragTarget;
        let targetData = targetItem.data;
        let children = targetData["children"] || [];
        children.push(removed);
        targetData["children"] = children;
        let branch = createBranch(children);
        let old = targetItem.getBranch();
        if (old)
            old.restructure(branch);
        else
            targetItem.open(true);
        targetItem.hasChildren = true;
        globalThis.dragSource = null;
        globalThis.dragTarget = null;
    }
})(TreeControl || (TreeControl = {}));
//# sourceMappingURL=Main.js.map