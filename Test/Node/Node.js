var NodeTest;
(function (NodeTest) {
    var ƒ = FudgeCore;
    window.addEventListener("DOMContentLoaded", init);
    function init() {
        let graph = new ƒ.Node("graph");
        let node1 = new ƒ.Node("node1");
        let node2 = new ƒ.Node("node2");
        let child1 = new ƒ.Node("child1");
        let child2 = new ƒ.Node("child2");
        graph.addChild(node1);
        graph.addChild(node2);
        node1.addChild(child1);
        node2.addChild(child2);
        for (let node of graph.graph)
            ƒ.Debug.log(node.name);
        node1.addChild(child2);
        for (let node of graph.graph)
            ƒ.Debug.log(node.name);
    }
})(NodeTest || (NodeTest = {}));
//# sourceMappingURL=Node.js.map