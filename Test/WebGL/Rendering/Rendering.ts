namespace WebGLRendering {
    import ƒ = Fudge;
    window.addEventListener("DOMContentLoaded", init);

    let node: ƒ.Node;
    let child: ƒ.Node;
    let grandchild: ƒ.Node;

    function init(): void {
        Scenes.createMiniScene();
        Scenes.createViewport();

        node = Scenes.node;
        child = node.getChildren()[0];

        // let webgl: ƒ.WebGL = new ƒ.WebGL();
        // webgl.addEventListener("snv", hndClick);

        ƒ.WebGL.addNode(node);


        ƒ.WebGL.drawBranch(node, (<ƒ.ComponentCamera>Scenes.camera.getComponent(ƒ.ComponentCamera)));

        node.cmpTransform.rotateZ(90);
        ƒ.WebGL.recalculateAllNodeTransforms();
        ƒ.WebGL.drawBranch(node, (<ƒ.ComponentCamera>Scenes.camera.getComponent(ƒ.ComponentCamera)));

        ƒ.WebGL.updateNode(node);
        ƒ.WebGL.removeNode(node);
    }
}