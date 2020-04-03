namespace Fudge {

  import ƒ = FudgeCore;
  import ƒui = FudgeUserInterface;

  export enum EVENT_EDITOR {
    REMOVE = "nodeRemoveEvent",
    HIDE = "nodeHideEvent",
    ACTIVEVIEWPORT = "activeViewport"
  }
  export enum NODEMENU {
    EMPTY = "Empty Node",
    BOX = "Box Mesh Node",
    PYRAMID = "Pyramid Mesh Node",
    PLANE = "Plane Mesh Node"
  }
  export enum COMPONENTMENU {
    MESHBOX = "Mesh Component.Box Mesh Component",
    MESHPLANE = "Mesh Component.Plane Mesh Component",
    MESHPYRAMID = "Mesh Component.Pyramid Mesh Component",
    AUDIOLISTENER = "Audio Listener Component",
    AUDIO = "Audio Component",
    ANIMATION = "Animation Component",
    CAMERA = "Camera Component",
    LIGHT = "Light Component",
    SCRIPT = "Script Component",
    TRANSFORM = "Transform Component"
  }

  export class UINodeList {
    listRoot: HTMLElement;
    selectedEntry: HTMLElement;
    private nodeRoot: ƒ.Node;

    constructor(_node: ƒ.Node, _listContainer: HTMLElement) {
      this.nodeRoot = _node;
      this.nodeRoot.addEventListener(ƒ.EVENT.CHILD_APPEND, this.updateList);
      this.nodeRoot.addEventListener(ƒ.EVENT.CHILD_REMOVE, this.updateList);
      this.listRoot = document.createElement("ul");
      this.listRoot.classList.add("NodeList");
      let list: HTMLUListElement = this.BuildListFromNode(this.nodeRoot);
      this.listRoot.appendChild(list);
      _listContainer.appendChild(this.listRoot);
      _listContainer.addEventListener(ƒui.EVENT_USERINTERFACE.COLLAPSE, this.toggleCollapse);

    }
    public getNodeRoot(): ƒ.Node {
      return this.nodeRoot;
    }
    public setSelection(_node: ƒ.Node): void {
      //TODO: Select Appropriate Entry
    }

    public getSelection(): ƒ.Node {
      return (<ƒui.CollapsableNodeList>this.selectedEntry).node;
    }

    public updateList = (_event: Event): void => {
      this.setNodeRoot(this.nodeRoot);
    }
    public setNodeRoot(_node: ƒ.Node): void {
      this.nodeRoot = _node;
      this.listRoot = this.BuildListFromNode(this.nodeRoot);
      this.listRoot.classList.add("NodeList");
    }
    public toggleCollapse = (_event: Event): void => {
      _event.preventDefault();

      if (event.target instanceof ƒui.CollapsableNodeList) {
        let target: ƒui.CollapsableNodeList = <ƒui.CollapsableNodeList>_event.target;
        if (target.content.children.length > 1)
          target.collapse(target);
        else {
          let nodeToExpand: ƒ.Node = (<ƒui.CollapsableNodeList>target).node;
          let newList: HTMLUListElement = this.BuildListFromNode(nodeToExpand);
          target.replaceWith(newList);
        }
      }
    }

    private BuildListFromNode(_node: ƒ.Node): HTMLUListElement {
      let listRoot: ƒui.CollapsableNodeList = new ƒui.CollapsableNodeList(_node, _node.name, true);
      let nodeChildren: ƒ.Node[] = _node.getChildren();
      for (let child of nodeChildren) {
        let listItem: HTMLUListElement = new ƒui.CollapsableNodeList(child, child.name);
        listRoot.content.appendChild(listItem);
      }
      return listRoot;
    }
  }

  export class UIAnimationList {
    listRoot: HTMLElement;
    private mutator: ƒ.Mutator;
    private index: ƒ.Mutator;

    constructor(_mutator: ƒ.Mutator, _listContainer: HTMLElement) {
      this.mutator = _mutator;
      this.listRoot = document.createElement("ul");
      this.index = {};
      this.listRoot = this.buildFromMutator(this.mutator);
      _listContainer.append(this.listRoot);
      _listContainer.addEventListener(ƒui.EVENT_USERINTERFACE.COLLAPSE, this.toggleCollapse);
      _listContainer.addEventListener(ƒui.EVENT_USERINTERFACE.UPDATE, this.collectMutator);
    }
    public getMutator(): ƒ.Mutator {
      return this.mutator;
    }

    public setMutator(_mutator: ƒ.Mutator): void {
      this.mutator = _mutator;
      let hule: HTMLUListElement = this.buildFromMutator(this.mutator);
      this.listRoot.replaceWith(hule);
      this.listRoot = hule;
    }

    public collectMutator = (): ƒ.Mutator => {
      let children: HTMLCollection = this.listRoot.children;
      for (let child of children) {
        this.mutator[(<ƒui.CollapsableAnimationList>child).name] = (<ƒui.CollapsableAnimationList>child).mutator;
      }
      console.log(this.mutator);
      return this.mutator;
    }

    public getElementIndex(): ƒ.Mutator {
      return this.index;
    }
    public updateMutator(_update: ƒ.Mutator): void {
      this.mutator = this.updateMutatorEntry(_update, this.mutator);
      this.updateEntry(this.mutator, this.index);
    }

    private updateEntry(_update: ƒ.Mutator, _index: ƒ.Mutator): void {
      for (let key in _update) {
        if (typeof _update[key] == "object") {
          this.updateEntry(<ƒ.Mutator>_update[key], <ƒ.Mutator>_index[key]);
        }
        else if (typeof _update[key] == "string" || "number") {
          let element: HTMLInputElement = <HTMLInputElement>_index[key];
          element.value = <string>_update[key];
        }
      }
    }

    private updateMutatorEntry(_update: ƒ.Mutator, _toUpdate: ƒ.Mutator): ƒ.Mutator {
      let updatedMutator: ƒ.Mutator = _toUpdate;
      for (let key in _update) {
        if (typeof updatedMutator[key] == "object") {
          if (typeof updatedMutator[key] == "object") {
            updatedMutator[key] = this.updateMutatorEntry(<ƒ.Mutator>_update[key], <ƒ.Mutator>updatedMutator[key]);
          }
        }
        else if (typeof _update[key] == "string" || "number") {
          if (typeof updatedMutator[key] == "string" || "number") {
            updatedMutator[key] = _update[key];
          }
        }
      }
      return updatedMutator;
    }
    private buildFromMutator(_mutator: ƒ.Mutator): HTMLUListElement {
      let listRoot: HTMLUListElement = document.createElement("ul");
      for (let key in _mutator) {
        let listElement: ƒui.CollapsableAnimationList = new ƒui.CollapsableAnimationList((<ƒ.Mutator>this.mutator[key]), key);
        listRoot.append(listElement);
        this.index[key] = listElement.getElementIndex();
        console.log(this.index);
      }
      return listRoot;
    }

    private toggleCollapse = (_event: Event): void => {
      _event.preventDefault();
      console.log(_event.target instanceof ƒui.CollapsableAnimationList);
      if (_event.target instanceof ƒui.CollapsableAnimationList) {
        let target: ƒui.CollapsableAnimationList = <ƒui.CollapsableAnimationList>_event.target;
        target.collapse(target);
      }
    }
  }

  export class NodeData extends ƒui.Mutable {
    public constructor(_mutable: ƒ.Mutable, _container: HTMLElement) {
      super(_mutable);
      this.root = document.createElement("form");
      ƒui.Generator.createFromMutable(<ƒ.Mutable>_mutable, this.root);
      this.root.addEventListener("input", this.mutateOnInput);
      _container.append(this.root);
    }

  }

}