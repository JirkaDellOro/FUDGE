namespace RenderManagerManagement {
    import ƒ = FudgeCore;
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

        // let RenderManager: ƒ.RenderManager = new ƒ.RenderManager();
        // RenderManager.addEventListener("snv", hndClick);
    }

    function hndClick(_event: Event): void {
        delegate(_event);
    }

    function addNodes(_event: Event): void {
        dumpRenderManager("Add two nodes");
        ƒ.RenderManager.addNode(node);
        ƒ.RenderManager.addNode(grandchild);
        delegate = updateNode;
    }
    function updateNode(_event: Event): void {
        dumpRenderManager("Update node");
        ƒ.RenderManager.updateNode(node);
        delegate = recalculateNode;
    }
    function recalculateNode(_event: Event): void {
        dumpRenderManager("Recalculate nodes");
        ƒ.RenderManager.update();
        delegate = removeFirstNode;
    }
    function removeFirstNode(_event: Event): void {
        dumpRenderManager("Remove second node");
        ƒ.RenderManager.removeNode(grandchild);
        delegate = removeSecondNode;
    }
    function removeSecondNode(_event: Event): void {
        dumpRenderManager("Remove first node");
        ƒ.RenderManager.removeNode(node);
        delegate = addBranch;
    }
    function addBranch(_event: Event): void {
        dumpRenderManager("Add branch");
        ƒ.RenderManager.addBranch(node);
        delegate = removeBranch;
    }
    function removeBranch(_event: Event): void {
        ƒ.RenderManager.removeBranch(node);
        dumpRenderManager("branch removed");
        window.removeEventListener("click", hndClick);
    }

    function dumpRenderManager(_label: string): void {
        console.group(_label);
        for (let prop in ƒ.RenderManager) {
            console.groupCollapsed(prop);
            console.log(ƒ.RenderManager[prop]);
            console.groupEnd();
        }
        console.groupEnd();
    }
}