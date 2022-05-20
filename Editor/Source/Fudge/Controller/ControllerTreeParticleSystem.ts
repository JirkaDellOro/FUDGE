namespace Fudge {
  import ƒ = FudgeCore;
  import ƒui = FudgeUserInterface;

  export class TreeParticleSystem<T extends ƒ.ParticleEffectNode> extends ƒui.Tree<T> {
    // public constructor(_controller: ƒui.TreeController<T>, _root: T) {
    //   super(_controller, _root);
    //   let root: TreeItemParticleSystem<T> = new TreeItemParticleSystem<T>(this.controller, _root);
    //   this.replaceChild(root , this.firstChild);
    // }

    protected override createBranch(_data: T[]): ƒui.TreeList<T> {
      let branch: ƒui.TreeList<T> = new ƒui.TreeList<T>([]);
      for (let child of _data) {
        branch.addItems([new TreeItemParticleSystem(this.controller, child)]);
      }
      return branch;
    }
  }

  customElements.define("ul-tree-ps", <CustomElementConstructor><unknown>TreeParticleSystem, { extends: "ul" });

  export class TreeItemParticleSystem<T extends ƒ.ParticleEffectNode> extends ƒui.TreeItem<T> {
    protected override create(): void {
      super.create();

      let prefix: HTMLLabelElement = document.createElement("label");

      if (this.data instanceof ƒ.ParticleEffectNodeVariable || this.data instanceof ƒ.ParticleEffectNodeFunction) {
        prefix.textContent = this.data.key + ":";

        this.insertBefore(prefix, this.label);
      }
    }
  }

  customElements.define("li-tree-item-ps", <CustomElementConstructor><unknown>TreeItemParticleSystem, { extends: "li" });

  export class ControllerTreeParticleSystem extends ƒui.TreeController<ƒ.ParticleEffectNode> {
    public getLabel(_node: ƒ.ParticleEffectNode): string {
      if (_node instanceof ƒ.ParticleEffectNodeVariable) return _node.value.toString();
      if (_node instanceof ƒ.ParticleEffectNodeFunction) return _node.function;
      return _node.key.toString();
    }

    public getAttributes(_node: ƒ.ParticleEffectNode): string {
      let attributes: string[] = [];
      if (_node instanceof ƒ.ParticleEffectNodeFunction) 
        attributes.push("closure");
      if (_node instanceof ƒ.ParticleEffectNodeVariable && typeof _node.value == "string") 
        attributes.push(typeof _node.value);

      return attributes.join(" ");
    }
    
    public rename(_node: ƒ.ParticleEffectNode, _new: string): boolean {
      let inputAsNumber: number = Number.parseFloat(_new);

      if (_node instanceof ƒ.ParticleEffectNodeVariable) {
        let input: string | number = Number.isNaN(inputAsNumber) ? _new : inputAsNumber;

        _node.value = input;
      }

      if (_node instanceof ƒ.ParticleEffectNodeFunction) {
        if (Number.isNaN(inputAsNumber)) {
          _node.function = _new;
        } else {
          return false;
        }
      }

      return true;
    }

    public hasChildren(_node: ƒ.ParticleEffectNode): boolean {
      return _node.children.length > 0;
    }

    public getChildren(_node: ƒ.ParticleEffectNode): ƒ.ParticleEffectNode[] {
      return _node.children;
    }

    public delete(_focused: ƒ.ParticleEffectNode[]): ƒ.ParticleEffectNode[] {
      // delete selection independend of focussed item
      let deleted: (ƒ.ParticleEffectNode)[] = [];
      let expend: (ƒ.ParticleEffectNode)[] = this.selection.length > 0 ? this.selection : _focused;
      for (let node of expend)
        if (node.parent) {
          node.parent.removeChild(node);
          deleted.push(node);
        }
      this.selection.splice(0);
      return deleted;
    }

    public addChildren(_children: ƒ.ParticleEffectNode[], _target: ƒ.ParticleEffectNode): ƒ.ParticleEffectNode[] {
      let move: ƒ.ParticleEffectNode[] = [];
      if (_target instanceof ƒ.ParticleEffectNodeFunction) {
        for (let child of _children)
          if (!_target.isDescendantOf(child))
            move.push(child);
          
        for (let node of move)
          _target.addChild(node);
      }
      
      return move;
    }

    public async copy(_originals: ƒ.ParticleEffectNode[]): Promise<ƒ.ParticleEffectNode[]> {
      // try to create copies and return them for paste operation
      let copies: ƒ.ParticleEffectNode[] = [];
      // for (let original of _originals) {
      //   let serialization: ƒ.Serialization = ƒ.Serializer.serialize(original);
      //   let copy: ParticleEffectNode = <ParticleEffectNode>await ƒ.Serializer.deserialize(serialization);
      //   copies.push(copy);
      // }
      return copies;
    }
  }
}