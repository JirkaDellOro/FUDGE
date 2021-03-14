///<reference path="../../../Core/Build/FudgeCore.d.ts"/>
var TextureAnimate;
///<reference path="../../../Core/Build/FudgeCore.d.ts"/>
(function (TextureAnimate) {
    var ƒ = FudgeCore;
    ƒ.Render.initialize(true, true);
    window.addEventListener("DOMContentLoaded", init);
    function init() {
        let coatTextured = new ƒ.CoatTextured();
        let material = new ƒ.Material("Material", ƒ.ShaderTexture, coatTextured);
        let root = new ƒ.Node("Root");
        for (let i = 0; i < 3; i++) {
            let mesh = new ƒ.MeshQuad();
            let quad = new ƒ.Node("Quad" + i);
            let cmpMesh = new ƒ.ComponentMesh(mesh);
            let cmpMaterial = new ƒ.ComponentMaterial(material);
            cmpMesh.pivot.translateX(0.2 * (i - 1));
            cmpMesh.pivot.translateZ(-i / 10);
            cmpMesh.pivot.rotateZ(i * 10);
            quad.addComponent(cmpMesh);
            quad.addComponent(cmpMaterial);
            root.addChild(quad);
        }
        let viewport = new ƒ.Viewport();
        let cmpCamera = new ƒ.ComponentCamera();
        cmpCamera.pivot.translateZ(3);
        cmpCamera.pivot.lookAt(ƒ.Vector3.ZERO());
        viewport.initialize("Viewport", root, cmpCamera, document.querySelector("canvas"));
        viewport.draw();
        ƒ.Loop.start();
        ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, (_event) => {
            for (let node of root.getChildren()) {
                let cmpMaterial = node.getComponent(ƒ.ComponentMaterial);
                cmpMaterial.pivot.rotate(0.1);
                cmpMaterial.pivot.translateX(0.01);
                let s = 1.5 + Math.sin(cmpMaterial.pivot.translation.x);
                cmpMaterial.pivot.scaling = ƒ.Vector2.ONE(s);
                viewport.draw();
            }
        });
    }
})(TextureAnimate || (TextureAnimate = {}));
//# sourceMappingURL=TextureAnimate.js.map