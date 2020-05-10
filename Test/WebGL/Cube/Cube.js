var Cube;
(function (Cube) {
    var ƒ = FudgeCore;
    window.addEventListener("load", init);
    function init(_event) {
        ƒ.Debug.log("Refactored Cube");
        let graph = new ƒ.Node("Graph");
        let coSys = Scenes.createCoordinateSystem();
        graph.addChild(coSys);
        let material = new ƒ.Material("Red", ƒ.ShaderUniColor, new ƒ.CoatColored(new ƒ.Color(1, 1, 1, 1)));
        let body = Scenes.createCompleteMeshNode("Body", material, new ƒ.MeshCube());
        body.mtxLocal.rotateX(-30);
        body.mtxLocal.translateX(1);
        body.mtxLocal.scale(new ƒ.Vector3(0.8, 0.8, 0.8));
        let child = Scenes.createCompleteMeshNode("Child", material, new ƒ.MeshPyramid());
        child.mtxLocal.translateX(1.5);
        body.appendChild(child);
        graph.addChild(body);
        let viewport = new ƒ.Viewport();
        let cmpCamera = Scenes.createCamera(new ƒ.Vector3(1, 1, 4), body.mtxWorld.translation);
        viewport.initialize("Viewport", graph, cmpCamera, document.querySelector("canvas"));
        viewport.draw();
    }
})(Cube || (Cube = {}));
//# sourceMappingURL=Cube.js.map