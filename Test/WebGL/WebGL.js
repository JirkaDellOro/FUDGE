var WebGL;
(function (WebGL) {
    var ƒ = Fudge;
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
        // let webgl: ƒ.WebGL = new ƒ.WebGL();
        // webgl.addEventListener("snv", hndClick);
    }
    function hndClick(_event) {
        delegate(_event);
    }
    function addNodes(_event) {
        dumpWebGL("Add two nodes");
        ƒ.WebGL.addNode(node);
        ƒ.WebGL.addNode(grandchild);
        delegate = updateNode;
    }
    function updateNode(_event) {
        dumpWebGL("Update node");
        ƒ.WebGL.updateNode(node);
        delegate = recalculateNode;
    }
    function recalculateNode(_event) {
        dumpWebGL("Recalculate nodes");
        ƒ.WebGL.recalculateAllNodeTransforms();
        delegate = removeFirstNode;
    }
    function removeFirstNode(_event) {
        dumpWebGL("Remove second node");
        ƒ.WebGL.removeNode(grandchild);
        delegate = removeSecondNode;
    }
    function removeSecondNode(_event) {
        dumpWebGL("Remove first node");
        ƒ.WebGL.removeNode(node);
        delegate = addBranch;
    }
    function addBranch(_event) {
        dumpWebGL("Add branch");
        ƒ.WebGL.addBranch(node);
        delegate = removeBranch;
    }
    function removeBranch(_event) {
        ƒ.WebGL.removeBranch(node);
        dumpWebGL("branch removed");
        window.removeEventListener("click", hndClick);
    }
    function dumpWebGL(_label) {
        console.group(_label);
        for (let prop in ƒ.WebGL) {
            console.groupCollapsed(prop);
            console.log(ƒ.WebGL[prop]);
            console.groupEnd();
        }
        console.groupEnd();
    }
})(WebGL || (WebGL = {}));
//# sourceMappingURL=WebGL.js.map