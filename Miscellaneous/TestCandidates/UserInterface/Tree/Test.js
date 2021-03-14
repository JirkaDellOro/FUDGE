// /<reference types="../../../../Core/Build/FudgeCore"/>
var UI_Tree;
// /<reference types="../../../../Core/Build/FudgeCore"/>
(function (UI_Tree) {
    var ƒ = FudgeCore;
    var ƒUi = FudgeUserInterface;
    var ƒAid = FudgeAid;
    let node;
    let viewport;
    window.addEventListener("load", hndLoad);
    function hndLoad(_event) {
        let canvas = document.querySelector("canvas");
        node = new ƒAid.NodeCoordinateSystem("Test");
        let cmpCamera = new ƒ.ComponentCamera();
        viewport = new ƒ.Viewport();
        viewport.initialize("Viewport", node, cmpCamera, canvas);
        cmpCamera.pivot.translate(new ƒ.Vector3(1, 2, 3));
        cmpCamera.pivot.lookAt(ƒ.Vector3.ZERO());
        let tree = new ƒUi.Tree(new UI_Tree.TreeControllerNode(), node);
        document.body.appendChild(tree);
        ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        ƒ.Loop.start(ƒ.LOOP_MODE.TIME_REAL, 10);
    }
    function update(_event) {
        viewport.draw();
    }
})(UI_Tree || (UI_Tree = {}));
//# sourceMappingURL=Test.js.map