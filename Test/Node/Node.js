var NodeTest;
(function (NodeTest) {
    var ƒ = FudgeCore;
    window.addEventListener("DOMContentLoaded", init);
    function init() {
        let branch = new ƒ.Node("branch");
        let node1 = new ƒ.Node("node1");
        let node2 = new ƒ.Node("node2");
        let child1 = new ƒ.Node("child1");
        let child2 = new ƒ.Node("child2");
        branch.appendChild(node1);
        branch.appendChild(node2);
        node1.appendChild(child1);
        node2.appendChild(child2);
        for (let node of branch.branch)
            ƒ.Debug.log(node.name);
        node1.appendChild(child2);
        for (let node of branch.branch)
            ƒ.Debug.log(node.name);
    }
})(NodeTest || (NodeTest = {}));
//# sourceMappingURL=Node.js.map