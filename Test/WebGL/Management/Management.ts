namespace WebGLManagement {
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

        // let webgl: ƒ.WebGL = new ƒ.WebGL();
        // webgl.addEventListener("snv", hndClick);
    }

    function hndClick(_event: Event): void {
        delegate(_event);
    }

    function addNodes(_event: Event): void {
        dumpWebGL("Add two nodes");
        ƒ.WebGL.addNode(node);
        ƒ.WebGL.addNode(grandchild);
        delegate = updateNode;
    }
    function updateNode(_event: Event): void {
        dumpWebGL("Update node");
        ƒ.WebGL.updateNode(node);
        delegate = recalculateNode;
    }
    function recalculateNode(_event: Event): void {
        dumpWebGL("Recalculate nodes");
        ƒ.WebGL.recalculateAllNodeTransforms();
        delegate = removeFirstNode;
    }
    function removeFirstNode(_event: Event): void {
        dumpWebGL("Remove second node");
        ƒ.WebGL.removeNode(grandchild);
        delegate = removeSecondNode;
    }
    function removeSecondNode(_event: Event): void {
        dumpWebGL("Remove first node");
        ƒ.WebGL.removeNode(node);
        delegate = addBranch;
    }
    function addBranch(_event: Event): void {
        dumpWebGL("Add branch");
        ƒ.WebGL.addBranch(node);
        delegate = removeBranch;
    }
    function removeBranch(_event: Event): void {
        ƒ.WebGL.removeBranch(node);
        dumpWebGL("branch removed");
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