var NodeTest;
(function (NodeTest) {
    var ƒ = FudgeCore;
    window.addEventListener("DOMContentLoaded", init);
    let node;
    let child;
    let grandchild;
    function init() {
        Scenes.createThreeLevelNodeHierarchy();
        console.log(Scenes.node);
        let all = Scenes.node.getAllComponents();
        console.log(all);
        let cmpMaterial = Scenes.node.getComponents(ƒ.ComponentMaterial);
        let cmpMesh = Scenes.node.getComponents(ƒ.ComponentMesh);
        console.log(cmpMaterial, cmpMesh);
        let all2 = [];
        all2 = all2.concat(cmpMesh);
        all2 = all2.concat(cmpMaterial);
        console.log(all2);
        var array1 = ["a", "b", "c"];
        var array2 = ["d", "e", "f"];
        console.log(array1.concat(array2));
        // expected output: Array ["a", "b", "c", "d", "e", "f"]
    }
})(NodeTest || (NodeTest = {}));
//# sourceMappingURL=Node.js.map