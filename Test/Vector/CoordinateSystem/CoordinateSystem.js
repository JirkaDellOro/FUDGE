var TextureTest;
(function (TextureTest) {
    var ƒ = FudgeCore;
    window.addEventListener("load", init);
    function init(_event) {
        let coSys = Scenes.createCoordinateSystem();
        coSys.addComponent(new ƒ.ComponentTransform());
        // let object: ƒ.Node = Scenes.createCompleteMeshNode(
        //     "Quad",
        //     new ƒ.Material("White", ƒ.ShaderUniColor, new ƒ.CoatColored(new ƒ.Color(1, 1, 1, 1))),
        //     new ƒ.MeshQuad()
        // );
        // coSys.addChild(object);
        let viewport = new ƒ.Viewport();
        let cmpCamera = Scenes.createCamera(new ƒ.Vector3(1, 2, 2)); //, new ƒ.Vector3(0, 0, 0));
        viewport.initialize("Viewport", coSys, cmpCamera, document.querySelector("canvas"));
        window.setInterval(function () {
            // body.cmpTransform.rotateY(-1.1);
            coSys.mtxLocal.rotateY(1);
            // body.cmpTransform.rotateZ(-0.9);
            viewport.draw();
        }, 20);
    }
})(TextureTest || (TextureTest = {}));
//# sourceMappingURL=CoordinateSystem.js.map