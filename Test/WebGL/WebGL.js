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
    }
    function hndClick(_event) {
        delegate(_event);
    }
    function addNodes(_event) {
        ƒ.WebGL.addNode(node);
        ƒ.WebGL.addNode(grandchild);
        dumpWebGL("Two nodes added");
        delegate = updateNode;
    }
    function updateNode(_event) {
        ƒ.WebGL.updateNode(node);
        dumpWebGL("node updated");
        delegate = recalculateNode;
    }
    function recalculateNode(_event) {
        ƒ.WebGL.recalculateAllNodeTransforms();
        dumpWebGL("nodes recalculated");
        delegate = removeFirstNode;
    }
    function removeFirstNode(_event) {
        ƒ.WebGL.removeNode(grandchild);
        dumpWebGL("second node removed");
        delegate = removeSecondNode;
    }
    function removeSecondNode(_event) {
        ƒ.WebGL.removeNode(node);
        dumpWebGL("first node removed");
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