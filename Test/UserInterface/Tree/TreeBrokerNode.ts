namespace UI_Tree {
  import ƒ = FudgeCore;
  import ƒUi = FudgeUserInterface;
  // import ƒAid = FudgeAid;

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

    public drop(_sources: ƒ.Node[], _target: ƒ.Node): boolean {
      for (let source of _sources)
        _target.addChild(source);
      return true;
    }
  }
}