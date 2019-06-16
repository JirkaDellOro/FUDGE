var TextureTest;
(function (TextureTest) {
    var ƒ = Fudge;
    window.addEventListener("load", init);
    function init(_event) {
        let coatRed = new ƒ.CoatColored(new ƒ.Color(1, 0, 0, 1));
        let material = new ƒ.Material("Red", ƒ.ShaderFlat, coatRed);
        let cube = Scenes.createCompleteMeshNode("Cube", material, new ƒ.MeshCube());
        cube.cmpTransform.translate(0, 0, 0);
        let cmpLight = new ƒ.ComponentLight(new ƒ.LightAmbient());
        cube.addComponent(cmpLight);
        let branch = new ƒ.Node("Branch");
        branch.appendChild(cube);
        ƒ.RenderManager.initialize();
        ƒ.RenderManager.addBranch(branch);
        ƒ.RenderManager.recalculateAllNodeTransforms();
        let viewport = new ƒ.Viewport();
        let camera = Scenes.createCamera(new ƒ.Vector3(0, 3, 3), new ƒ.Vector3(0, 0, 0));
        viewport.initialize("Viewport", branch, camera.getComponent(ƒ.ComponentCamera), document.querySelector("canvas"));
        cube.addComponent(cmpLight);
        viewport.draw();
        window.setInterval(function () {
            cube.cmpTransform.rotateY(-1);
            cube.cmpTransform.rotateX(-2);
            ƒ.RenderManager.recalculateAllNodeTransforms();
            viewport.draw();
        }, 20);
    }
})(TextureTest || (TextureTest = {}));
//# sourceMappingURL=Light.js.map