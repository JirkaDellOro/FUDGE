namespace Iterator {
    import ƒ = FudgeCore;
    window.addEventListener("DOMContentLoaded", init);

    let node: ƒ.Node;
    let child: ƒ.Node;
    let grandchild: ƒ.Node;

    function init(): void {
        Scenes.createThreeLevelNodeHierarchy();

        node = Scenes.node;
        child = node.getChildren()[0];
        grandchild = child.getChildren()[0];

        let child2: ƒ.Node = Scenes.createCompleteMeshNode("Child2", new ƒ.Material("Blue", ƒ.ShaderUniColor, new ƒ.CoatColored()), new ƒ.MeshCube());
        child2.mtxLocal.rotateX(45);
        child.addChild(child2);
        Scenes.createViewport();
        Scenes.viewport.draw();

        console.group("Nodes in graph");
        for (let iter of node.graph)
            console.log(iter.name);
        console.groupEnd();

        console.group("Keys in ...");
        for (let key in node)
            console.log(key);
        console.groupEnd();
    }
} 