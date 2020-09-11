var DirectoryBrowser;
(function (DirectoryBrowser) {
    var ƒUi = FudgeUserInterface;
    class TreeControllerDirectory extends ƒUi.TreeController {
        getLabel(_entry) {
            return _entry.name;
        }
        rename(_entry, _new) {
            // _entry.name = _new;
            // TODO: change filename!
            return true;
        }
        hasChildren(_entry) {
            return !_entry.isFile;
        }
        getChildren(_entry) {
            //TODO: fs.readdirSync of this entry
            return _entry.getContent();
        }
        delete(_focussed) {
            // delete selection independend of focussed item
            let deleted = [];
            let expend = this.selection.length > 0 ? this.selection : _focussed;
            for (let entry of this.selection || expend) {
                entry.delete();
                deleted.push(entry);
            }
            this.selection.splice(0);
            return deleted;
        }
        addChildren(_entries, _target) {
            // disallow drop for sources being ancestor to target
            let move = [];
            for (let entry of _entries)
                // if (!_target.isDescendantOf(entry))
                move.push(entry);
            for (let entry of move) {
                _target.addEntry(entry);
                entry.delete();
            }
            return move;
        }
        copy(_originals) {
            // try to create copies and return them for paste operation
            // let copies: DirectoryEntry[] = [];
            // for (let original of _originals) {
            //   // TODO: copy files to directory
            //   // let serialization: ƒ.Serialization = ƒ.Serializer.serialize(original);
            //   // let copy: ƒ.Node = <ƒ.Node>ƒ.Serializer.deserialize(serialization);
            //   // copies.push(copy);
            //   // original.copy()
            // }
            return _originals;
        }
    }
    DirectoryBrowser.TreeControllerDirectory = TreeControllerDirectory;
})(DirectoryBrowser || (DirectoryBrowser = {}));
//# sourceMappingURL=TreeControllerDirectory.js.map