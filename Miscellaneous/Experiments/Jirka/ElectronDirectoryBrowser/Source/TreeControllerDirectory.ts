import { Dirent, unlinkSync } from "fs";

namespace DirectoryBrowser {
  import ƒ = FudgeCore;
  import ƒUi = FudgeUserInterface;

  export class TreeControllerDirectory extends ƒUi.TreeController<Dirent> {
    public getLabel(_entry: Dirent): string {
      return _entry.name;
    }
    public rename(_entry: Dirent, _new: string): boolean {
      _entry.name = _new;
      // TODO: change filename!
      return true;
    }

    public hasChildren(_entry: Dirent): boolean {
      return _entry.isDirectory();
    }

    public getChildren(_entry: Dirent): Dirent[] {
      //TODO: fs.readdirSync of this entry
      return null;
    }

    public delete(_focussed: Dirent[]): Dirent[] {
      // delete selection independend of focussed item
      let deleted: Dirent[] = [];
      let expend: Dirent[] = this.selection.length > 0 ? this.selection : _focussed;
      for (let dirent of this.selection || expend)
        if (node.getParent()) {
          node.getParent().removeChild(node);
          deleted.push(node);
        }
      this.selection.splice(0);
      return deleted;
    }

    public addChildren(_children: ƒ.Node[], _target: ƒ.Node): ƒ.Node[] {
      // disallow drop for sources being ancestor to target
      let move: ƒ.Node[] = [];
      for (let child of _children)
        if (!_target.isDescendantOf(child))
          move.push(child);

      for (let node of move)
        _target.addChild(node);

      return move;
    }

    public copy(_originals: ƒ.Node[]): ƒ.Node[] {
      // try to create copies and return them for paste operation
      let copies: ƒ.Node[] = [];
      for (let original of _originals) {
        let serialization: ƒ.Serialization = ƒ.Serializer.serialize(original);
        let copy: ƒ.Node = <ƒ.Node>ƒ.Serializer.deserialize(serialization);
        copies.push(copy);
      }
      return copies;
    }
  }
}