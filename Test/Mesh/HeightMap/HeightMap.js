var MeshTest;
(function (MeshTest) {
    var ƒ = FudgeCore;
    window.addEventListener("load", init);
    let branch = new ƒ.Node("Branch");
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
        let gridMeshFlat = new ƒ.MeshHeightMap(20, 20, myHeightMapFunction);
        let gridMeshTex = new ƒ.MeshHeightMap(20, 20, myHeightMapFunction);
        gridFlat = Scenes.createCompleteMeshNode("Grid", matFlat, gridMeshFlat);
        gridTex = Scenes.createCompleteMeshNode("Grid", matTex, gridMeshTex);
        branch.appendChild(gridFlat);
        branch.appendChild(gridTex);
        gridFlat.cmpTransform.local.translateX(-0.6);
        gridTex.cmpTransform.local.translateX(0.6);
        let body = new ƒ.Node("k");
        let lights = Scenes.createThreePointLighting("lights", 110);
        branch.appendChild(lights);
        branch.appendChild(body);
        ƒ.RenderManager.initialize();
        ƒ.RenderManager.addBranch(branch);
        ƒ.RenderManager.update();
        let viewport = new ƒ.Viewport();
        let cmpCamera = Scenes.createCamera(new ƒ.Vector3(0, 2, 2), new ƒ.Vector3(0, 0, 0));
        viewport.initialize("Viewport", branch, cmpCamera, document.querySelector("canvas"));
        Scenes.dollyViewportCamera(viewport);
        viewport.setFocus(true);
        viewport.draw();
        window.setInterval(function () {
            gridFlat.cmpTransform.local.rotateY(0.5);
            ƒ.RenderManager.update();
            viewport.draw();
        }, 20);
    }
})(MeshTest || (MeshTest = {}));
//# sourceMappingURL=HeightMap.js.map