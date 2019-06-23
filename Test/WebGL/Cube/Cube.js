var Cube;
(function (Cube) {
    var ƒ = Fudge;
    window.addEventListener("load", init);
    function init(_event) {
        let material = new ƒ.Material("Red", ƒ.ShaderUniColor, new ƒ.CoatColored(new ƒ.Color(1, 1, 1, 1)));
        let body = Scenes.createCompleteMeshNode("Body", material, new ƒ.MeshCube());
        body.cmpTransform.translateZ(-4);
        ƒ.RenderManager.initialize();
        ƒ.RenderManager.addBranch(body);
        ƒ.RenderManager.update();
        let viewport = new ƒ.Viewport();
        let camera = Scenes.createCamera(ƒ.Vector3.ZERO, body.cmpTransform.position);
        viewport.initialize("Viewport", body, camera.getComponent(ƒ.ComponentCamera), document.querySelector("canvas"));
        viewport.draw();
    }
})(Cube || (Cube = {}));
//# sourceMappingURL=Cube.js.map