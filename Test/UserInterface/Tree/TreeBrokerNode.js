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
        delete(_object) {
            // delete selection independend of focussed item
            let deleted = [];
            for (let node of this.selection)
                if (node.getParent()) {
                    node.getParent().removeChild(node);
                    deleted.push(node);
                }
            this.selection.splice(0);
            return deleted;
        }
        drop(_sources, _target) {
            // disallow drop for sources being ancestor to target
            let move = [];
            for (let source of _sources)
                if (!_target.isDescendantOf(source))
                    move.push(source);
            for (let node of move)
                _target.addChild(node);
            return move;
        }
    }
    UI_Tree.TreeBrokerNode = TreeBrokerNode;
})(UI_Tree || (UI_Tree = {}));
//# sourceMappingURL=TreeBrokerNode.js.map