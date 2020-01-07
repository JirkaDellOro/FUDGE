var MeshTest;
(function (MeshTest) {
    var ƒ = FudgeCore;
    window.addEventListener("load", init);
    let branch = new ƒ.Node("Branch");
    let object = new ƒ.Node("object");
    function loadMesh() {
        let meshdata = document.getElementById("meshdata_textbox").value;
        let mymesh = ƒ.importMesh(ƒ.MeshFormat.OBJ, meshdata);
        let material = new ƒ.Material("White", ƒ.ShaderFlat, new ƒ.CoatColored(ƒ.Color.CSS("WHITE")));
        object = Scenes.createCompleteMeshNode("Cube", material, mymesh);
        branch.appendChild(object);
    }
    MeshTest.loadMesh = loadMesh;
    function init(_event) {
        let body = new ƒ.Node("k");
        let cmpLightDirectionalRed = new ƒ.ComponentLight(new ƒ.LightDirectional(new ƒ.Color(1, 0.8, 0.7)));
        cmpLightDirectionalRed.pivot.rotateY(-90);
        branch.addComponent(cmpLightDirectionalRed);
        let cmpLightDirectionalWhite = new ƒ.ComponentLight(new ƒ.LightDirectional(ƒ.Color.CSS("WHITE")));
        cmpLightDirectionalWhite.pivot.rotateY(90);
        branch.addComponent(cmpLightDirectionalWhite);
        branch.appendChild(body);
        ƒ.RenderManager.initialize();
        ƒ.RenderManager.addBranch(branch);
        ƒ.RenderManager.update();
        let viewport = new ƒ.Viewport();
        let cmpCamera = Scenes.createCamera(new ƒ.Vector3(1.5, 1.5, 1.5), new ƒ.Vector3(0, 0, 0));
        viewport.initialize("Viewport", branch, cmpCamera, document.querySelector("canvas"));
        Scenes.dollyViewportCamera(viewport);
        viewport.setFocus(true);
        viewport.draw();
        //*/
        window.setInterval(function () {
            object.cmpTransform.local.rotateY(-1);
            ƒ.RenderManager.update();
            viewport.draw();
        }, 20);
        //*/
    }
})(MeshTest || (MeshTest = {}));
//# sourceMappingURL=MeshPoly.js.map