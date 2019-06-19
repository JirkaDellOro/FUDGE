var TextureTest;
(function (TextureTest) {
    var ƒ = Fudge;
    window.addEventListener("load", init);
    function init(_event) {
        let coSys = Scenes.createCoordinateSystem();
        coSys.addComponent(new ƒ.ComponentTransform());
        let object = Scenes.createCompleteMeshNode("Quad", new ƒ.Material("White", ƒ.ShaderUniColor, new ƒ.CoatColored(new ƒ.Color(1, 1, 1, 1))), new ƒ.MeshQuad());
        coSys.appendChild(object);
        ƒ.RenderManager.initialize();
        ƒ.RenderManager.addBranch(coSys);
        let viewport = new ƒ.Viewport();
        let camera = Scenes.createCamera(new ƒ.Vector3(1, 2, 2)); //, new ƒ.Vector3(0, 0, 0));
        viewport.initialize("Viewport", coSys, camera.getComponent(ƒ.ComponentCamera), document.querySelector("canvas"));
        window.setInterval(function () {
            // body.cmpTransform.rotateY(-1.1);
            // coSys.cmpTransform.rotateY(-1);
            // body.cmpTransform.rotateZ(-0.9);
            ƒ.RenderManager.update();
            viewport.draw();
        }, 20);
    }
})(TextureTest || (TextureTest = {}));
//# sourceMappingURL=CoordinateSystem.js.map