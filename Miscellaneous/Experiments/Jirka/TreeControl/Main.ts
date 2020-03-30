///<reference path="../../../../Core/Build/FudgeCore.d.ts"/>
namespace TreeControl {
  import ƒ = FudgeCore;

  export class Proxy extends TreeProxy<TreeEntry> {
    public getLabel(_object: TreeEntry): string { return "Test"; }
    public hasChildren(_object: TreeEntry): boolean { return true; }
    public getChildren(_object: TreeEntry): TreeEntry[] { return []; }
  }

  let tree: Tree<TreeEntry> = new Tree(new Proxy(), data[0]);
  tree.addEventListener(EVENT_TREE.RENAME, hndRename);
  tree.addEventListener(EVENT_TREE.OPEN, hndOpen);
  // tree.addEventListener(EVENT_TREE.DELETE, hndDelete);
  tree.addEventListener(EVENT_TREE.DROP, hndDrop);
  tree.addEventListener(EVENT_TREE.SELECT, hndSelect);
  document.body.appendChild(tree);
  document.body.addEventListener("pointerup", forgetSelection);
  document.body.addEventListener("keyup", hndKey);

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
        forgetSelection();
        break;
      case ƒ.KEYBOARD_CODE.DELETE:
        deleteObjects(globalThis.selection);
        forgetSelection();
        break;
    }
  }


  function hndRename(_event: Event): void {
    let item: TreeItem = <TreeItem>(<HTMLInputElement>_event.target).parentNode;
    let data: TreeEntry = <TreeEntry>item.data;
    data.display = item.getLabel();
    item.setLabel(data.display);
  }

  function hndOpen(_event: Event): void {
    let item: TreeItem = <TreeItem>_event.target;
    let children: TreeEntry[] = item.data["children"];

    if (!children)
      return;

    let branch: TreeList = createBranch(children);
    item.setBranch(branch);
    tree.displaySelection(globalThis.selection);
  }

  // Independent helper function
  function createBranch(_data: TreeEntry[]): TreeList {
    let branch: TreeList = new TreeList([]);
    for (let child of _data) {
      branch.addItems([new TreeItem(child.display, child, child.children != undefined)]);
    }
    return branch;
  }

  // function hndDelete(_event: Event): void {
  //   deleteItem(<TreeItem>_event.target);
  // }

  // function deleteItem(_item: TreeItem): TreeEntry {
  //   let tree: TreeList = <TreeList>_item.parentElement;
  //   let parentItem: TreeItem = <TreeItem>tree.parentElement;
  //   let siblings: TreeEntry[] = parentItem.data["children"];

  //   let removed: TreeEntry[] = siblings.splice(siblings.indexOf(<TreeEntry>_item.data), 1);
  //   if (siblings.length) {
  //     tree.removeChild(_item);
  //     tree.restructure(tree);
  //   } else {
  //     parentItem.data["children"] = undefined;
  //     parentItem.setBranch(null);
  //     parentItem.hasChildren = false;
  //   }
  //   return removed[0];
  // }

  // EventHandler / Callback, partially in tree?
  function hndDrop(_event: DragEvent): void {
    _event.stopPropagation();
    if (globalThis.dragSource == globalThis.dragTarget)
      return;

    // let removed: TreeEntry = deleteItem(globalThis.dragSource);
    tree.delete([globalThis.dragSource.data]);

    let targetItem: TreeItem = globalThis.dragTarget;
    let targetData: TreeEntry = <TreeEntry>targetItem.data;
    let children: TreeEntry[] = targetData["children"] || [];
    children.push(globalThis.dragSource.data);
    targetData["children"] = children;

    let branch: TreeList = createBranch(children);
    let old: TreeList = targetItem.getBranch();
    if (old)
      old.restructure(branch);
    else
      targetItem.open(true);
    targetItem.hasChildren = true;

    globalThis.dragSource = null;
    globalThis.dragTarget = null;
  }

  // Callback / Eventhandler in Tree
  function hndSelect(_event: CustomEvent): void {
    _event.stopPropagation();
    globalThis.selection = globalThis.selection || [];
    // let item: TreeItem = <TreeItem>_event.target;
    let index: number = globalThis.selection.indexOf(_event.detail.data);

    if (_event.detail.interval) {
      let dataStart: Object = globalThis.selection[0];
      let dataEnd: Object = _event.detail.data;
      globalThis.selection = [];
      tree.selectInterval(dataStart, dataEnd);
      return;
    }

    if (index >= 0 && _event.detail.additive)
      globalThis.selection.splice(index, 1);
    else {
      if (!_event.detail.additive)
        globalThis.selection = [];
      globalThis.selection.push(_event.detail.data);
    }

    tree.displaySelection(globalThis.selection);
  }

  // Independent
  function forgetSelection(): void {
    globalThis.selection = [];
    tree.displaySelection(globalThis.selection);
  }

  // Independent
  function deleteObjects(_objects: Object[]): void {
    let deleted: TreeItem[] = tree.delete(_objects);
    for (let item of deleted) {
      let list: TreeItem = <TreeItem>item.parentElement.parentElement;
      let siblings: TreeEntry[] = list.data["children"];
      let removed: TreeEntry[] = siblings.splice(siblings.indexOf(<TreeEntry>item.data), 1);
    }
  }
}