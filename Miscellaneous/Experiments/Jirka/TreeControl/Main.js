///<reference path="../../../../Core/Build/FudgeCore.d.ts"/>
var TreeControl;
(function (TreeControl) {
    var ƒ = FudgeCore;
    let selection = [];
    let dragDrop = { source: [], target: null };
    class Broker extends TreeControl.TreeBroker {
        constructor() {
            super(...arguments);
            this.selection = selection;
            this.dragDrop = dragDrop;
        }
        getLabel(_object) { return _object.display; }
        hasChildren(_object) { return _object.children && _object.children.length > 0; }
        getChildren(_object) { return _object.children; }
        rename(_object, _new) {
            _object.display = _new;
            return true;
        }
        delete(_objects) {
            // disallow deletion if necessary
            return false;
        }
        drop(_source, _target) {
            // if dropTarget is child of one of the dropSources -> no drag&drop possible
            if (isChild(_target, _source))
                return false;
            let children = this.getChildren(_target) || [];
            children.push(..._source);
            _target["children"] = children;
            deleteObjects(_source);
            return true;
        }
    }
    TreeControl.Broker = Broker;
    let tree = new TreeControl.Tree(new Broker(), TreeControl.data[0]);
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
            siblings.splice(siblings.indexOf(item.data), 1);
        }
        tree.delete(_objects);
    }
    function isChild(_child, _parents) {
        for (let parent of _parents) {
            let itemParent = tree.findOpen(parent);
            let openSuccessors = itemParent.getOpenData();
            if (openSuccessors.indexOf(_child) > -1)
                return true;
        }
        return false;
    }
})(TreeControl || (TreeControl = {}));
//# sourceMappingURL=Main.js.map