namespace Fudge {

  import ƒ = FudgeCore;
  import ƒUi = FudgeUserInterface;

  export class ControllerTreeDirectory extends ƒUi.TreeController<DirectoryEntry> {
    public getLabel(_entry: DirectoryEntry): string {
      return _entry.name;
    }
    public rename(_entry: DirectoryEntry, _new: string): boolean {
      _entry.name = _new;
      return true;
    }

    public hasChildren(_entry: DirectoryEntry): boolean {
      return _entry.isDirectory;
    }

    public getChildren(_entry: DirectoryEntry): DirectoryEntry[] {
      return _entry.getDirectoryContent();
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
      for (let entry of _entries) {
        _target.addEntry(entry);
        entry.delete();
      }
      return _entries;
    }

    public async copy(_originals: DirectoryEntry[]): Promise<DirectoryEntry[]> {
      // copies can not be created at this point, but when copying the files. See addChildren
      return _originals;
    }
  }
}