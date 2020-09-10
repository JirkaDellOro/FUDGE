namespace DirectoryBrowser {

  import ƒ = FudgeCore;
  import ƒUi = FudgeUserInterface;

  export class TreeControllerDirectory extends ƒUi.TreeController<DirectoryEntry> {
    public getLabel(_entry: DirectoryEntry): string {
      return _entry.name;
    }
    public rename(_entry: DirectoryEntry, _new: string): boolean {
      // _entry.name = _new;
      // TODO: change filename!
      return true;
    }

    public hasChildren(_entry: DirectoryEntry): boolean {
      return !_entry.isFile;
    }

    public getChildren(_entry: DirectoryEntry): DirectoryEntry[] {
      //TODO: fs.readdirSync of this entry
      return _entry.getContent();
    }

    public delete(_focussed: DirectoryEntry[]): DirectoryEntry[] {
      // delete selection independend of focussed item
      let deleted: DirectoryEntry[] = [];
      let expend: DirectoryEntry[] = this.selection.length > 0 ? this.selection : _focussed;
      for (let entry of this.selection || expend) {
        entry.delete();
        deleted.push(entry);
      }
      this.selection.splice(0);
      return deleted;
    }

    public addChildren(_entries: DirectoryEntry[], _target: DirectoryEntry): DirectoryEntry[] {
      // disallow drop for sources being ancestor to target
      let move: DirectoryEntry[] = [];
      for (let entry of _entries)
        if (!_target.isDescendantOf(entry))
          move.push(entry);

      for (let entry of move)
        _target.addEntry(entry);

      return move;
    }

    public copy(_originals: DirectoryEntry[]): DirectoryEntry[] {
      // try to create copies and return them for paste operation
      let copies: DirectoryEntry[] = [];
      for (let original of _originals) {
        // TODO: copy files to directory
        // let serialization: ƒ.Serialization = ƒ.Serializer.serialize(original);
        // let copy: ƒ.Node = <ƒ.Node>ƒ.Serializer.deserialize(serialization);
        // copies.push(copy);


        //fs.copyFile(src, dest[, mode], callback)
      }
      return copies;
    }
  }
}