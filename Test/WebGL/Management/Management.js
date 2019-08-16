var RenderManagerManagement;
(function (RenderManagerManagement) {
    var ƒ = FudgeCore;
    let delegate = addNodes;
    window.addEventListener("DOMContentLoaded", init);
    window.addEventListener("click", hndClick);
    let node;
    let child;
    let grandchild;
    function init() {
        Scenes.createThreeLevelNodeHierarchy();
        // Scenes.createViewport();
        node = Scenes.node;
        child = node.getChildren()[0];
        grandchild = child.getChildren()[0];
        // let RenderManager: ƒ.RenderManager = new ƒ.RenderManager();
        // RenderManager.addEventListener("snv", hndClick);
    }
    function hndClick(_event) {
        delegate(_event);
    }
    function addNodes(_event) {
        dumpRenderManager("Add two nodes");
        ƒ.RenderManager.addNode(node);
        ƒ.RenderManager.addNode(grandchild);
        delegate = updateNode;
    }
    function updateNode(_event) {
        dumpRenderManager("Update node");
        ƒ.RenderManager.updateNode(node);
        delegate = recalculateNode;
    }
    function recalculateNode(_event) {
        dumpRenderManager("Recalculate nodes");
        ƒ.RenderManager.update();
        delegate = removeFirstNode;
    }
    function removeFirstNode(_event) {
        dumpRenderManager("Remove second node");
        ƒ.RenderManager.removeNode(grandchild);
        delegate = removeSecondNode;
    }
    function removeSecondNode(_event) {
        dumpRenderManager("Remove first node");
        ƒ.RenderManager.removeNode(node);
        delegate = addBranch;
    }
    function addBranch(_event) {
        dumpRenderManager("Add branch");
        ƒ.RenderManager.addBranch(node);
        delegate = removeBranch;
    }
    function removeBranch(_event) {
        ƒ.RenderManager.removeBranch(node);
        dumpRenderManager("branch removed");
        window.removeEventListener("click", hndClick);
    }
    function dumpRenderManager(_label) {
        console.group(_label);
        for (let prop in ƒ.RenderManager) {
            console.groupCollapsed(prop);
            console.log(ƒ.RenderManager[prop]);
            console.groupEnd();
        }
        console.groupEnd();
    }
})(RenderManagerManagement || (RenderManagerManagement = {}));
//# sourceMappingURL=Management.js.map