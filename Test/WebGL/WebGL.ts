namespace WebGL {
    import ƒ = Fudge;
    let delegate: EventListener = addNodes;
    window.addEventListener("DOMContentLoaded", init);
    window.addEventListener("click", hndClick);

    let node: ƒ.Node;
    let child: ƒ.Node;
    let grandchild: ƒ.Node;

    function init(): void {
        Scenes.createThreeLevelNodeHierarchy();
        // Scenes.createViewport();

        node = Scenes.node;
        child = node.getChildren()[0];
        grandchild = child.getChildren()[0];
    }

    function hndClick(_event:Event): void {
        delegate(_event);
    }

    function addNodes(_event: Event): void {
        ƒ.WebGL.addNode(node);
        ƒ.WebGL.addNode(grandchild);
        dumpWebGL("Two nodes added");
        delegate = updateNode;
    }
    function updateNode(_event: Event): void {
        ƒ.WebGL.updateNode(node);
        dumpWebGL("node updated");
        delegate = recalculateNode;
    }
    function recalculateNode(_event: Event): void {
        ƒ.WebGL.recalculateAllNodeTransforms();
        dumpWebGL("nodes recalculated");
        delegate = removeFirstNode;
    }
    function removeFirstNode(_event: Event): void {
        ƒ.WebGL.removeNode(grandchild);
        dumpWebGL("second node removed");
        delegate = removeSecondNode;
    }
    function removeSecondNode(_event: Event): void {
        ƒ.WebGL.removeNode(node);
        dumpWebGL("first node removed");
        window.removeEventListener("click", hndClick);
    }

    function dumpWebGL(_label: string): void {
        console.group(_label);
        for (let prop in ƒ.WebGL) {
            console.groupCollapsed(prop);
            console.log(ƒ.WebGL[prop]);
            console.groupEnd();
        }
        console.groupEnd();
    }
}