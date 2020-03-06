var Minimal;
(function (Minimal) {
    var ƒ = FudgeCore;
    window.addEventListener("load", hndLoad);
    function hndLoad(_event) {
        const canvas = document.querySelector("canvas");
        let viewport = new ƒ.Viewport();
        let mesh = new ƒ.MeshQuad();
        let mtrSolidWhite = new ƒ.Material("SolidWhite", ƒ.ShaderUniColor, new ƒ.CoatColored(ƒ.Color.CSS("WHITE")));
        let cmpMesh = new ƒ.ComponentMesh(mesh);
        let cmpMaterial = new ƒ.ComponentMaterial(mtrSolidWhite);
        let node = new ƒ.Node("Quad");
        node.addComponent(cmpMesh);
        node.addComponent(cmpMaterial);
        let camera = new ƒ.ComponentCamera();
        camera.pivot.translate(new ƒ.Vector3(0, 0, 2));
        viewport.initialize("Viewport", node, camera, canvas);
        viewport.draw();
    }
})(Minimal || (Minimal = {}));
//# sourceMappingURL=Main.js.map