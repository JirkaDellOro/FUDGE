var Cube;
(function (Cube) {
    var ƒ = FudgeCore;
    window.addEventListener("load", init);
    function init(_event) {
        ƒ.Debug.log("Refactored Cube");
        let branch = new ƒ.Node("Branch");
        let coSys = Scenes.createCoordinateSystem();
        branch.appendChild(coSys);
        let material = new ƒ.Material("Red", ƒ.ShaderUniColor, new ƒ.CoatColored(new ƒ.Color(1, 1, 1, 1)));
        let body = Scenes.createCompleteMeshNode("Body", material, new ƒ.MeshCube());
        body.cmpTransform.local.rotateX(-30);
        body.cmpTransform.local.translateX(1);
        body.cmpTransform.local.scale(new ƒ.Vector3(0.8, 0.8, 0.8));
        let child = Scenes.createCompleteMeshNode("Child", material, new ƒ.MeshPyramid());
        child.cmpTransform.local.translateX(1.5);
        body.appendChild(child);
        branch.appendChild(body);
        ƒ.RenderManager.initialize();
        // ƒ.RenderManager.addBranch(branch);
        let viewport = new ƒ.Viewport();
        let cmpCamera = Scenes.createCamera(new ƒ.Vector3(1, 1, 4), body.mtxWorld.translation);
        viewport.initialize("Viewport", branch, cmpCamera, document.querySelector("canvas"));
        viewport.draw();
    }
})(Cube || (Cube = {}));
//# sourceMappingURL=Cube.js.map