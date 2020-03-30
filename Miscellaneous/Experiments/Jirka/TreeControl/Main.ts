///<reference path="../../../../Core/Build/FudgeCore.d.ts"/>
namespace TreeControl {
  import ƒ = FudgeCore;
  let selection: Object[] = [];

  export class Proxy extends TreeProxy<TreeEntry> {
    public selection: Object[] = selection;

    public getLabel(_object: TreeEntry): string { return _object.display; }
    public hasChildren(_object: TreeEntry): boolean { return _object.children && _object.children.length > 0; }
    public getChildren(_object: TreeEntry): TreeEntry[] { return _object.children; }
    public rename(_object: TreeEntry, _new: string): boolean {
      _object.display = _new;
      return true;
    }
  }

  let tree: Tree<TreeEntry> = new Tree(new Proxy(), data[0]);
  document.body.appendChild(tree);


  // // tree.addEventListener(EVENT_TREE.DELETE, hndDelete);
  // tree.addEventListener(EVENT_TREE.DROP, hndDrop);

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
        deleteObjects(selection);
        selection.splice(0);
        break;
    }
  }  

  function deleteObjects(_objects: Object[]): void {
    for (let object of _objects) {
      let item: TreeItem<TreeEntry> = tree.findOpen(<TreeEntry>object);
      let list: TreeItem<TreeEntry> = <TreeItem<TreeEntry>>item.parentElement.parentElement;
      let siblings: TreeEntry[] = list.data["children"];
      let removed: TreeEntry[] = siblings.splice(siblings.indexOf(<TreeEntry>item.data), 1);
    }
    let deleted: TreeItem<TreeEntry>[] = tree.delete(<TreeEntry[]>_objects);
  }

  // // EventHandler / Callback, partially in tree?
  // function hndDrop(_event: DragEvent): void {
  //   _event.stopPropagation();
  //   if (globalThis.dragSource == globalThis.dragTarget)
  //     return;

  //   // let removed: TreeEntry = deleteItem(globalThis.dragSource);
  //   tree.delete([globalThis.dragSource.data]);

  //   let targetItem: TreeItem = globalThis.dragTarget;
  //   let targetData: TreeEntry = <TreeEntry>targetItem.data;
  //   let children: TreeEntry[] = targetData["children"] || [];
  //   children.push(globalThis.dragSource.data);
  //   targetData["children"] = children;

  //   let branch: TreeList = createBranch(children);
  //   let old: TreeList = targetItem.getBranch();
  //   if (old)
  //     old.restructure(branch);
  //   else
  //     targetItem.open(true);
  //   targetItem.hasChildren = true;

  //   globalThis.dragSource = null;
  //   globalThis.dragTarget = null;
  // }
}