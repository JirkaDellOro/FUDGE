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

        let child2: ƒ.Node = Scenes.createCompleteMeshNode("Child2", new ƒ.Material("Blue", new ƒ.Color(0, 0, 1, 1), ƒ.ShaderBasic), new ƒ.MeshCube(1, 1, 7));
        child2.cmpTransform.rotateX(45);
        child.appendChild(child2);
        Scenes.createViewport();
        Scenes.viewPort.draw();

        console.group("Nodes in branch");
        for (let iter of node.branch)
            console.log(iter.name);
        console.groupEnd();

        console.group("Keys in ...");
        for (let key in node)
            console.log(key);
        console.groupEnd();
    }
} 