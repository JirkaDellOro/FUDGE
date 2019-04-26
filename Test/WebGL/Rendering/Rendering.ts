namespace WebGLRendering {
    import ƒ = Fudge;
    window.addEventListener("DOMContentLoaded", init);

    let node: ƒ.Node;
    let child: ƒ.Node;
    let grandchild: ƒ.Node;

    function init(): void {
        Scenes.createThreeLevelNodeHierarchy();
        node = Scenes.node;
        child = node.getChildren()[0];

        let viewPort: ƒ.Viewport = new ƒ.Viewport("TestViewport", node, <ƒ.ComponentCamera>Scenes.camera.getComponent(ƒ.ComponentCamera));
        viewPort.prepare();

        // let webgl: ƒ.WebGL = new ƒ.WebGL();
        // webgl.addEventListener("snv", hndClick);

        ƒ.WebGL.addBranch(node);
        ƒ.WebGL.recalculateAllNodeTransforms();
        ƒ.WebGL.drawBranch(node, (<ƒ.ComponentCamera>Scenes.camera.getComponent(ƒ.ComponentCamera)));

        node.cmpTransform.rotateZ(60);
        ƒ.WebGL.recalculateAllNodeTransforms();
        // viewPort.prepare();
        ƒ.WebGL.drawBranch(node, (<ƒ.ComponentCamera>Scenes.camera.getComponent(ƒ.ComponentCamera)));

        ƒ.WebGL.updateNode(node);
        ƒ.WebGL.removeNode(node);
    }
}