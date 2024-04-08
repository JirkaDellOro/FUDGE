namespace Fudge {
  import ƒ = FudgeCore;
  import ƒUi = FudgeUserInterface;

  export class ControllerTreeHierarchy extends ƒUi.CustomTreeController<ƒ.Node> {

    public createContent(_object: ƒ.Node): HTMLFieldSetElement {
      let content: HTMLFieldSetElement = document.createElement("fieldset");
      let name: HTMLInputElement = document.createElement("input");
      name.value = _object.name;
      content.appendChild(name);
      return content;
    }

    public getAttributes(_node: ƒ.Node): string {
      let attributes: string[] = [_node.isActive ? "active" : "inactive"];
      if (_node instanceof ƒ.GraphInstance)
        attributes.push("GraphInstance");
      return attributes.join(" ");
    }

    public async setValue(_node: ƒ.Node, _id: string, _new: string): Promise<boolean> {
      let rename: boolean = _node.name != _new;
      if (rename) {
        _node.name = _new;
        await (<ƒ.GraphGLTF>_node).load?.();
      }

      return rename;
    }

    public hasChildren(_node: ƒ.Node): boolean {
      return _node.getChildren().length > 0;
    }

    public getChildren(_node: ƒ.Node): ƒ.Node[] {
      return _node.getChildren();
    }

    public async delete(_focussed: ƒ.Node[]): Promise<ƒ.Node[]> {
      // delete selection independend of focussed item
      let deleted: ƒ.Node[] = [];
      let expend: ƒ.Node[] = this.selection.length > 0 ? this.selection : _focussed;
      for (let node of expend)
        if (node.getParent()) {
          node.getParent().removeChild(node);
          deleted.push(node);
        }
      this.selection.splice(0);
      return deleted;
    }

    public addChildren(_children: ƒ.Node[], _target: ƒ.Node, _index?: number): ƒ.Node[] {
      // disallow drop for sources being ancestor to target
      let move: ƒ.Node[] = [];
      for (let child of _children)
        if (!_target.isDescendantOf(child))
          move.push(child);

      move.forEach((_node, _iMove) => _target.addChild(_node, _index == undefined ? _index : _index + _iMove));
      // for (let node of move)
      //   _target.addChild(node, _iTarget);

      return move;
    }

    public async copy(_originals: ƒ.Node[]): Promise<ƒ.Node[]> {
      // try to create copies and return them for paste operation
      let copies: ƒ.Node[] = [];
      for (let original of _originals) {
        let serialization: ƒ.Serialization = ƒ.Serializer.serialize(original);
        let copy: ƒ.Node = <ƒ.Node>await ƒ.Serializer.deserialize(serialization);
        copies.push(copy);
      }
      return copies;
    }

    public canAddChildren(_sources: ƒ.Node[], _target: ƒ.Node): boolean {
      if (_sources.length == 0)
        return false;

      return _sources.every(_source => checkGraphDrop(_source, _target));

      function checkGraphDrop(_source: ƒ.Node, _target: ƒ.Node): boolean {
        let idSources: string[] = [];
        for (let node of _source.getIterator())
          if (node instanceof ƒ.GraphInstance)
            idSources.push(node.idSource);
          else if (node instanceof ƒ.Graph)
            idSources.push(node.idResource);

        do {
          if (_target instanceof ƒ.Graph)
            if (idSources.indexOf(_target.idResource) > -1)
              return false;
          if (_target instanceof ƒ.GraphInstance)
            if (idSources.indexOf(_target.idSource) > -1)
              return false;

          _target = _target.getParent();
        } while (_target);

        return true;
      }
    }
  }
}