var MeshTest;
(function (MeshTest) {
    var ƒ = FudgeCore;
    window.addEventListener("load", init);
    let branch = new ƒ.Node("Branch");
    let grid = new ƒ.Node("sphereTex");
    function init(_event) {
        let matFlat = new ƒ.Material("White", ƒ.ShaderFlat, new ƒ.CoatColored(ƒ.Color.CSS("WHITE")));
        const myHeightMapFunction = function (x, y) {
            return Math.sin(x * y * Math.PI * 2) * 0.2;
        };
        let gridMesh = new ƒ.MeshHeightMap(20, 20, myHeightMapFunction);
        grid = Scenes.createCompleteMeshNode("Grid", matFlat, gridMesh);
        branch.appendChild(grid);
        let body = new ƒ.Node("k");
        let lights = Scenes.createThreePointLighting("lights", 110);
        branch.appendChild(lights);
        branch.appendChild(body);
        ƒ.RenderManager.initialize();
        ƒ.RenderManager.addBranch(branch);
        ƒ.RenderManager.update();
        let viewport = new ƒ.Viewport();
        let cmpCamera = Scenes.createCamera(new ƒ.Vector3(2, 1, 0), new ƒ.Vector3(0, 0, 0));
        viewport.initialize("Viewport", branch, cmpCamera, document.querySelector("canvas"));
        Scenes.dollyViewportCamera(viewport);
        viewport.setFocus(true);
        viewport.draw();
        window.setInterval(function () {
            grid.cmpTransform.local.rotateY(0.5);
            ƒ.RenderManager.update();
            viewport.draw();
        }, 20);
    }
})(MeshTest || (MeshTest = {}));
//# sourceMappingURL=HeightMap.js.map