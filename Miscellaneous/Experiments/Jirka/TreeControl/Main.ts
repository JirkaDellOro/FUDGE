///<reference path="../../../../Core/Build/FudgeCore.d.ts"/>
namespace TreeControl {
  let treeItem: TreeItem = new TreeItem(data[0].display, data[0], data[0].children != undefined);
  let tree: TreeList = new TreeList([treeItem]);
  tree.addEventListener(EVENT_TREE.RENAME, hndRename);
  tree.addEventListener(EVENT_TREE.OPEN, hndOpen);
  tree.addEventListener(EVENT_TREE.DELETE, hndDelete);
  tree.addEventListener(EVENT_TREE.DROP, hndDrop);
  tree.addEventListener(EVENT_TREE.SELECT, hndSelect);
  document.body.appendChild(tree);

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
    // console.log(_event);
    tree.displaySelection(globalThis.selection);
  }

  function createBranch(_data: TreeEntry[]): TreeList {
    let branch: TreeList = new TreeList([]);
    for (let child of _data) {
      branch.addItems([new TreeItem(child.display, child, child.children != undefined)]);
    }
    return branch;
  }

  function hndDelete(_event: Event): void {
    deleteItem(<TreeItem>_event.target);
  }

  function deleteItem(_item: TreeItem): TreeEntry {
    let tree: TreeList = <TreeList>_item.parentElement;
    let parentItem: TreeItem = <TreeItem>tree.parentElement;
    let siblings: TreeEntry[] = parentItem.data["children"];

    let removed: TreeEntry[] = siblings.splice(siblings.indexOf(<TreeEntry>_item.data), 1);
    if (siblings.length) {
      tree.removeChild(_item);
      tree.restructure(tree);
    } else {
      parentItem.data["children"] = undefined;
      parentItem.setBranch(null);
      parentItem.hasChildren = false;
    }
    return removed[0];
  }

  function hndDrop(_event: DragEvent): void {
    _event.stopPropagation();
    if (globalThis.dragSource == globalThis.dragTarget)
      return;

    let removed: TreeEntry = deleteItem(globalThis.dragSource);

    let targetItem: TreeItem = globalThis.dragTarget;
    let targetData: TreeEntry = <TreeEntry>targetItem.data;
    let children: TreeEntry[] = targetData["children"] || [];
    children.push(removed);
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
  
  function hndSelect(_event: CustomEvent): void {
    _event.stopPropagation();
    globalThis.selection = globalThis.selection || [];
    let item: TreeItem = <TreeItem>_event.target;
    let index: number = globalThis.selection.indexOf(_event.detail.data);

    if (index >= 0 && _event.detail.additive)
      globalThis.selection.splice(index, 1);
    else {
      if (!_event.detail.additive)
        globalThis.selection = [];
      globalThis.selection.push(_event.detail.data);
    }

    tree.displaySelection(globalThis.selection);
  }
}