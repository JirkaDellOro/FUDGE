namespace Iterator {
    import ƒ = Fudge;
    window.addEventListener("DOMContentLoaded", init);

    let node: ƒ.Node;
    let child: ƒ.Node;
    let grandchild: ƒ.Node;

    function init(): void {
        Scenes.createThreeLevelNodeHierarchy();

        node = Scenes.node;
        child = node.getChildren()[0];
        grandchild = child.getChildren()[0];

        let child2: ƒ.Node = Scenes.createCompleteMeshNode("Child2", ƒ.ShaderBasic, new ƒ.Vector3(0, 0, 255), new ƒ.MeshCube(1, 1, 7));
        child2.cmpTransform.rotateX(45);
        child.appendChild(child2);
        Scenes.createViewport();

        for (let iter of node.branch)
            console.log(iter.name);
    }
} 