var DirectoryBrowser;
(function (DirectoryBrowser) {
    var ƒ = FudgeCore;
    var ƒUi = FudgeUserInterface;
    class TreeControllerDirectory extends ƒUi.TreeController {
        getLabel(_entry) {
            return _entry.name;
        }
        rename(_entry, _new) {
            _entry.name = _new;
            // TODO: change filename!
            return true;
        }
        hasChildren(_entry) {
            return _entry.isDirectory();
        }
        getChildren(_entry) {
            //TODO: fs.readdirSync of this entry
            return null;
        }
        delete(_focussed) {
            // delete selection independend of focussed item
            let deleted = [];
            let expend = this.selection.length > 0 ? this.selection : _focussed;
            for (let dirent of this.selection || expend)
                if (node.getParent()) {
                    node.getParent().removeChild(node);
                    deleted.push(node);
                }
            this.selection.splice(0);
            return deleted;
        }
        addChildren(_children, _target) {
            // disallow drop for sources being ancestor to target
            let move = [];
            for (let child of _children)
                if (!_target.isDescendantOf(child))
                    move.push(child);
            for (let node of move)
                _target.addChild(node);
            return move;
        }
        copy(_originals) {
            // try to create copies and return them for paste operation
            let copies = [];
            for (let original of _originals) {
                let serialization = ƒ.Serializer.serialize(original);
                let copy = ƒ.Serializer.deserialize(serialization);
                copies.push(copy);
            }
            return copies;
        }
    }
    DirectoryBrowser.TreeControllerDirectory = TreeControllerDirectory;
})(DirectoryBrowser || (DirectoryBrowser = {}));
export {};
//# sourceMappingURL=TreeControllerDirectory.js.map