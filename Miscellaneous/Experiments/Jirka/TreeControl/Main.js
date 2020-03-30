///<reference path="../../../../Core/Build/FudgeCore.d.ts"/>
var TreeControl;
(function (TreeControl) {
    var ƒ = FudgeCore;
    let selection = [];
    let dragSource = [];
    let dropTarget = [];
    class Proxy extends TreeControl.TreeProxy {
        constructor() {
            super(...arguments);
            this.selection = selection;
            this.dragSource = dragSource;
            this.dropTarget = dropTarget;
        }
        getLabel(_object) { return _object.display; }
        hasChildren(_object) { return _object.children && _object.children.length > 0; }
        getChildren(_object) { return _object.children; }
        rename(_object, _new) {
            _object.display = _new;
            return true;
        }
        delete(_objects) {
            // disallow deletion
            return false;
        }
    }
    TreeControl.Proxy = Proxy;
    let tree = new TreeControl.Tree(new Proxy(), TreeControl.data[0]);
    document.body.appendChild(tree);
    // // tree.addEventListener(EVENT_TREE.DELETE, hndDelete);
    document.addEventListener("pointerup", (_event) => tree.clearSelection());
    document.addEventListener("keyup", hndKey);
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
                tree.clearSelection();
                break;
            case ƒ.KEYBOARD_CODE.DELETE:
                deleteObjects(selection);
                selection.splice(0);
                break;
        }
    }
    function deleteObjects(_objects) {
        for (let object of _objects) {
            let item = tree.findOpen(object);
            let list = item.parentElement.parentElement;
            let siblings = list.data["children"];
            let removed = siblings.splice(siblings.indexOf(item.data), 1);
        }
        let deleted = tree.delete(_objects);
    }
})(TreeControl || (TreeControl = {}));
//# sourceMappingURL=Main.js.map