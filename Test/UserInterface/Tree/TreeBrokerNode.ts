namespace UI_Tree {
  import ƒ = FudgeCore;
  import ƒUi = FudgeUserInterface;

  export class TreeBrokerNode extends ƒUi.TreeBroker<ƒ.Node> {
    public getLabel(_node: ƒ.Node): string {
      return _node.name;
    }
    public rename(_node: ƒ.Node, _new: string): boolean {
      _node.name = _new;
      return true;
    }

    public hasChildren(_node: ƒ.Node): boolean {
      return _node.getChildren().length > 0;
    }

    public getChildren(_node: ƒ.Node): ƒ.Node[] {
      return _node.getChildren();
    }

    public delete(_object: ƒ.Node): ƒ.Node[] {
      // delete selection independend of focussed item
      let deleted: ƒ.Node[] = [];
      for (let node of this.selection)
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
  }
}