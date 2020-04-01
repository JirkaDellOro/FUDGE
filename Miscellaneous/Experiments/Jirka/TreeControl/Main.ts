///<reference path="../../../../Core/Build/FudgeCore.d.ts"/>
namespace TreeControl {
  import ƒ = FudgeCore;
  let selection: Object[] = [];
  let dragDrop: { source: Object[], target: Object } = { source: [], target: null };

  export class Broker extends TreeBroker<TreeEntry> {
    public selection: Object[] = selection;
    public dragDrop: { source: Object[], target: Object } = dragDrop;

    public getLabel(_object: TreeEntry): string { return _object.display; }
    public hasChildren(_object: TreeEntry): boolean { return _object.children && _object.children.length > 0; }
    public getChildren(_object: TreeEntry): TreeEntry[] { return _object.children; }
    public rename(_object: TreeEntry, _new: string): boolean {
      _object.display = _new;
      return true;
    }
    public delete(_objects: TreeEntry[]): boolean {
      // disallow deletion if necessary
      return false;
    }
    public drop(_source: Object[], _target: Object): boolean {
      // if dropTarget is child of one of the dropSources -> no drag&drop possible
      if (isChild(<TreeEntry>_target, <TreeEntry[]>_source))
        return false;

      let children: TreeEntry[] = this.getChildren(<TreeEntry>_target) || [];
      children.push(...<TreeEntry[]>_source);
      _target["children"] = children;
      deleteObjects(<TreeEntry[]>_source);
      return true;
    }
  }

  let tree: Tree<TreeEntry> = new Tree<TreeEntry>(new Broker(), data[0]);
  document.body.appendChild(tree);

  // // tree.addEventListener(EVENT_TREE.DELETE, hndDelete);
  document.addEventListener("pointerup", (_event: Event): void => tree.clearSelection());
  document.addEventListener("keyup", hndKey);

  show(0, 1, 1, 0);

  export function show(..._index: number[]): void {
    let path: TreeEntry[] = [];
    let branch: TreeEntry[] = data;
    for (let i of _index) {
      path.push(branch[i]);
      branch = branch[i].children;
    }
    tree.show(path, true);
  }

  function hndKey(_event: KeyboardEvent): void {
    switch (_event.code) {
      case ƒ.KEYBOARD_CODE.ESC:
        tree.clearSelection();
        break;
      case ƒ.KEYBOARD_CODE.DELETE:
        deleteObjects(<TreeEntry[]>selection);
        selection.splice(0);
        break;
    }
  }

  function deleteObjects(_objects: TreeEntry[]): void {
    for (let object of _objects) {
      let item: TreeItem<TreeEntry> = tree.findOpen(object);
      let list: TreeItem<TreeEntry> = <TreeItem<TreeEntry>>item.parentElement.parentElement;
      let siblings: TreeEntry[] = list.data["children"];
      siblings.splice(siblings.indexOf(item.data), 1);
    } 
    tree.delete(_objects);
  }

  function isChild(_child: TreeEntry, _parents: TreeEntry[]): boolean {
    for (let parent of _parents) {
      let itemParent: TreeItem<TreeEntry> = tree.findOpen(parent);
      let openSuccessors: TreeEntry[] = itemParent.getOpenData();
      if (openSuccessors.indexOf(_child) > -1)
        return true;
    }
    return false;
  }
}