var TextureTest;
(function (TextureTest) {
    var ƒ = FudgeCore;
    window.addEventListener("load", init);
    function init(_event) {
        let coatRed = new ƒ.CoatColored(new ƒ.Color(1, 0, 0, 1));
        let material = new ƒ.Material("Red", ƒ.ShaderFlat, coatRed);
        let cube = Scenes.createCompleteMeshNode("Cube", material, new ƒ.MeshCube());
        cube.mtxLocal.translate(ƒ.Vector3.ZERO());
        let graph = new ƒ.Node("Graph");
        graph.addChild(cube);
        let viewport = new ƒ.Viewport();
        let cmpCamera = Scenes.createCamera(new ƒ.Vector3(0, 3, 3), new ƒ.Vector3(0, 0, 0));
        viewport.initialize("Viewport", graph, cmpCamera, document.querySelector("canvas"));
        viewport.draw();
        window.setInterval(function () {
            cube.mtxLocal.rotateY(-1);
            cube.mtxLocal.rotateX(-2);
            viewport.draw();
        }, 20);
    }
})(TextureTest || (TextureTest = {}));
//# sourceMappingURL=Flat.js.map