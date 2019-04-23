var Iterator;
(function (Iterator) {
    var ƒ = Fudge;
    window.addEventListener("DOMContentLoaded", init);
    let node;
    let child;
    let grandchild;
    function init() {
        Scenes.createThreeLevelNodeHierarchy();
        node = Scenes.node;
        child = node.getChildren()[0];
        grandchild = child.getChildren()[0];
        let child2 = Scenes.createCompleteMeshNode("Child2", ƒ.ShaderBasic, new ƒ.Vector3(0, 0, 255), new ƒ.MeshCube(1, 1, 7));
        child2.cmpTransform.rotateX(45);
        child.appendChild(child2);
        Scenes.createViewport();
        for (let iter of node.generator())
            console.log(iter.name);
    }
})(Iterator || (Iterator = {}));
//# sourceMappingURL=Iterator.js.map