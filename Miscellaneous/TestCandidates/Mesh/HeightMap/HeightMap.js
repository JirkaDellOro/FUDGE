var MeshTest;
(function (MeshTest) {
    var ƒ = FudgeCore;
    var ƒAid = FudgeAid;
    window.addEventListener("load", init);
    let graph = new ƒ.Node("Graph");
    let gridFlat = new ƒ.Node("sphereTex");
    let gridTex = new ƒ.Node("sphereTex");
    function init(_event) {
        let matFlat = new ƒ.Material("White", ƒ.ShaderFlat, new ƒ.CoatColored(ƒ.Color.CSS("WHITE")));
        let img = document.querySelector("img");
        let txtImage = new ƒ.TextureImage();
        txtImage.image = img;
        let coatTextured = new ƒ.CoatTextured();
        coatTextured.texture = txtImage;
        let matTex = new ƒ.Material("Textured", ƒ.ShaderTexture, coatTextured);
        const myHeightMapFunction = function (x, y) {
            return Math.sin(x * y * Math.PI * 2) * 0.2;
        };
        let gridMeshFlat = new ƒ.MeshHeightMap("HeightMap", 20, 20, myHeightMapFunction);
        let gridMeshTex = new ƒ.MeshHeightMap("HeightMap", 20, 20, myHeightMapFunction);
        gridFlat = Scenes.createCompleteMeshNode("Grid", matFlat, gridMeshFlat);
        gridTex = Scenes.createCompleteMeshNode("Grid", matTex, gridMeshTex);
        graph.addChild(gridFlat);
        graph.addChild(gridTex);
        gridFlat.mtxLocal.translateX(-0.6);
        gridTex.mtxLocal.translateX(0.6);
        let body = new ƒ.Node("k");
        ƒAid.addStandardLightComponents(graph);
        graph.addChild(body);
        let viewport = new ƒ.Viewport();
        let cmpCamera = Scenes.createCamera(new ƒ.Vector3(0, 2, 2), new ƒ.Vector3(0, 0, 0));
        viewport.initialize("Viewport", graph, cmpCamera, document.querySelector("canvas"));
        Scenes.dollyViewportCamera(viewport);
        viewport.setFocus(true);
        viewport.draw();
        window.setInterval(function () {
            gridFlat.mtxLocal.rotateY(0.5);
            viewport.draw();
        }, 20);
    }
})(MeshTest || (MeshTest = {}));
//# sourceMappingURL=HeightMap.js.map