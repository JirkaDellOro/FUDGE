var UI_Tree;
(function (UI_Tree) {
    var ƒUi = FudgeUserInterface;
    // import ƒAid = FudgeAid;
    class TreeBrokerNode extends ƒUi.TreeBroker {
        getLabel(_node) {
            return _node.name;
        }
        rename(_node, _new) {
            _node.name = _new;
            return true;
        }
        hasChildren(_node) {
            return _node.getChildren().length > 0;
        }
        getChildren(_node) {
            return _node.getChildren();
        }
        drop(_sources, _target) {
            for (let source of _sources)
                _target.addChild(source);
            return true;
        }
    }
    UI_Tree.TreeBrokerNode = TreeBrokerNode;
})(UI_Tree || (UI_Tree = {}));
//# sourceMappingURL=TreeBrokerNode.js.map