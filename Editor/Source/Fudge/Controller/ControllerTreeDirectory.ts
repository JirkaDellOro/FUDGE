namespace Fudge {

  import ƒ = FudgeCore;
  import ƒUi = FudgeUserInterface;

  export class ControllerTreeDirectory extends ƒUi.CustomTreeController<DirectoryEntry> {

    public createContent(_entry: DirectoryEntry): HTMLFieldSetElement {
      let content: HTMLFieldSetElement = document.createElement("fieldset");
      let name: HTMLInputElement = document.createElement("input");
      name.value = _entry.name;
      content.appendChild(name);
      return content;
    }

    public async setValue(_entry: DirectoryEntry, _id: string, _new: string): Promise<boolean> {
      try {
        _entry.name = _new;
      } catch (_error) {
        ƒ.Debug.warn(`Could not rename file '${_entry.name}' to '${_new}'.`, _error);
        return false;
      }

      return true;
    }

    public getAttributes(_object: DirectoryEntry): string {
      return "";
    }

    public hasChildren(_entry: DirectoryEntry): boolean {
      return _entry.isDirectory;
    }

    public getChildren(_entry: DirectoryEntry): DirectoryEntry[] {
      return _entry.getDirectoryContent();
    }

    public equals(_a: DirectoryEntry, _b: DirectoryEntry): boolean {
      return _a.pathRelative == _b.pathRelative;
    }

    public async delete(_focussed: DirectoryEntry[]): Promise<DirectoryEntry[]> {
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
      let move: DirectoryEntry[] = [];
      for (let entry of _entries) {
        try {
          _target.addEntry(entry);
          entry.delete();
          move.push(entry);
        } catch (_error) {
          ƒ.Debug.warn(`Could not add file '${entry.name}' to '${_target.name}'.`, _error);
        }
      }
      return move;
    }

    public async copy(_originals: DirectoryEntry[]): Promise<DirectoryEntry[]> {
      // copies can not be created at this point, but when copying the files. See addChildren
      return _originals;
    }
  }
}