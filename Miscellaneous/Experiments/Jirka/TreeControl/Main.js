///<reference path="../../../../Core/Build/FudgeCore.d.ts"/>
var TreeControl;
(function (TreeControl) {
    var ƒ = FudgeCore;
    class Proxy extends TreeControl.TreeProxy {
        getLabel(_object) { return "Test"; }
        hasChildren(_object) { return true; }
        getChildren(_object) { return []; }
    }
    TreeControl.Proxy = Proxy;
    let tree = new TreeControl.Tree(new Proxy(), TreeControl.data[0]);
    tree.addEventListener(TreeControl.EVENT_TREE.RENAME, hndRename);
    tree.addEventListener(TreeControl.EVENT_TREE.OPEN, hndOpen);
    // tree.addEventListener(EVENT_TREE.DELETE, hndDelete);
    tree.addEventListener(TreeControl.EVENT_TREE.DROP, hndDrop);
    tree.addEventListener(TreeControl.EVENT_TREE.SELECT, hndSelect);
    document.body.appendChild(tree);
    document.body.addEventListener("pointerup", forgetSelection);
    document.body.addEventListener("keyup", hndKey);
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
    function hndKey(_event) {
        switch (_event.code) {
            case ƒ.KEYBOARD_CODE.ESC:
                forgetSelection();
                break;
            case ƒ.KEYBOARD_CODE.DELETE:
                deleteObjects(globalThis.selection);
                forgetSelection();
                break;
        }
    }
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
        tree.displaySelection(globalThis.selection);
    }
    // Independent helper function
    function createBranch(_data) {
        let branch = new TreeControl.TreeList([]);
        for (let child of _data) {
            branch.addItems([new TreeControl.TreeItem(child.display, child, child.children != undefined)]);
        }
        return branch;
    }
    // function hndDelete(_event: Event): void {
    //   deleteItem(<TreeItem>_event.target);
    // }
    // function deleteItem(_item: TreeItem): TreeEntry {
    //   let tree: TreeList = <TreeList>_item.parentElement;
    //   let parentItem: TreeItem = <TreeItem>tree.parentElement;
    //   let siblings: TreeEntry[] = parentItem.data["children"];
    //   let removed: TreeEntry[] = siblings.splice(siblings.indexOf(<TreeEntry>_item.data), 1);
    //   if (siblings.length) {
    //     tree.removeChild(_item);
    //     tree.restructure(tree);
    //   } else {
    //     parentItem.data["children"] = undefined;
    //     parentItem.setBranch(null);
    //     parentItem.hasChildren = false;
    //   }
    //   return removed[0];
    // }
    // EventHandler / Callback, partially in tree?
    function hndDrop(_event) {
        _event.stopPropagation();
        if (globalThis.dragSource == globalThis.dragTarget)
            return;
        // let removed: TreeEntry = deleteItem(globalThis.dragSource);
        tree.delete([globalThis.dragSource.data]);
        let targetItem = globalThis.dragTarget;
        let targetData = targetItem.data;
        let children = targetData["children"] || [];
        children.push(globalThis.dragSource.data);
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
    // Callback / Eventhandler in Tree
    function hndSelect(_event) {
        _event.stopPropagation();
        globalThis.selection = globalThis.selection || [];
        // let item: TreeItem = <TreeItem>_event.target;
        let index = globalThis.selection.indexOf(_event.detail.data);
        if (_event.detail.interval) {
            let dataStart = globalThis.selection[0];
            let dataEnd = _event.detail.data;
            globalThis.selection = [];
            tree.selectInterval(dataStart, dataEnd);
            return;
        }
        if (index >= 0 && _event.detail.additive)
            globalThis.selection.splice(index, 1);
        else {
            if (!_event.detail.additive)
                globalThis.selection = [];
            globalThis.selection.push(_event.detail.data);
        }
        tree.displaySelection(globalThis.selection);
    }
    // Independent
    function forgetSelection() {
        globalThis.selection = [];
        tree.displaySelection(globalThis.selection);
    }
    // Independent
    function deleteObjects(_objects) {
        let deleted = tree.delete(_objects);
        for (let item of deleted) {
            let list = item.parentElement.parentElement;
            let siblings = list.data["children"];
            let removed = siblings.splice(siblings.indexOf(item.data), 1);
        }
    }
})(TreeControl || (TreeControl = {}));
//# sourceMappingURL=Main.js.map