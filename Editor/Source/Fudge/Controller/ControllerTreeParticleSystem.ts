namespace Fudge {
  import ƒ = FudgeCore;
  import ƒui = FudgeUserInterface;

  export class ControllerTreeParticleSystem extends ƒui.CustomTreeController<ƒ.ParticleEffectNode> {

    public createContent(_node: ƒ.ParticleEffectNode): HTMLElement {
      let content: HTMLElement = document.createElement("span");
      let labelKey: HTMLInputElement = document.createElement("input");
      labelKey.type = "text";
      labelKey.disabled = true;
      labelKey.value = _node.key.toString();
      labelKey.setAttribute("key", "key");
      content.appendChild(labelKey);

      let labelValue: HTMLInputElement = document.createElement("input");
      labelValue.type = "text";
      labelValue.disabled = true;
      if (_node instanceof ƒ.ParticleEffectNodeVariable) {
        labelValue.setAttribute("key", "value");
        labelValue.value = _node.value.toString();
      }
      if (_node instanceof ƒ.ParticleEffectNodeFunction) {
        labelValue.setAttribute("key", "function");
        labelValue.value = _node.function;
      }
      content.appendChild(labelValue);

      return content;
    }

    public getLabel(_key: string, _node: ƒ.ParticleEffectNode): string {
      return _node[_key];
    }

    public getAttributes(_node: ƒ.ParticleEffectNode): string {
      let attributes: string[] = [];
      if (_node instanceof ƒ.ParticleEffectNodeFunction) 
        attributes.push("closure");
      if (_node instanceof ƒ.ParticleEffectNodeVariable && typeof _node.value == "string") 
        attributes.push(typeof _node.value);

      return attributes.join(" ");
    }
    
    public rename(_node: ƒ.ParticleEffectNode, _key: string, _new: string): boolean {
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