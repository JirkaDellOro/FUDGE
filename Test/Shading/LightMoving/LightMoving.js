var TextureTest;
(function (TextureTest) {
    var ƒ = FudgeCore;
    window.addEventListener("load", init);
    function init(_event) {
        let coatWhite = new ƒ.CoatColored(ƒ.Color.CSS("WHITE"));
        let material = new ƒ.Material("White", ƒ.ShaderFlat, coatWhite);
        let body = Scenes.createCompleteMeshNode("Body", material, new ƒ.MeshPyramid());
        body.mtxLocal.translate(ƒ.Vector3.ZERO());
        body.mtxLocal.scale(new ƒ.Vector3(0.8, 0.8, 0.8));
        let lights = new ƒ.Node("Lights");
        lights.addComponent(new ƒ.ComponentTransform());
        let cmpLightAmbient = new ƒ.ComponentLight(new ƒ.LightAmbient(new ƒ.Color(.1, .0, .0, 1)));
        lights.addComponent(cmpLightAmbient);
        let cmpLightDirectionalRed = new ƒ.ComponentLight(new ƒ.LightDirectional(ƒ.Color.CSS("RED")));
        cmpLightDirectionalRed.pivot.lookAt(new ƒ.Vector3(-1, -1, 0));
        lights.addComponent(cmpLightDirectionalRed);
        let cmpLightDirectionalGreen = new ƒ.ComponentLight(new ƒ.LightDirectional(ƒ.Color.CSS("GREEN")));
        cmpLightDirectionalGreen.pivot.lookAt(new ƒ.Vector3(0, -1, -1));
        lights.addComponent(cmpLightDirectionalGreen);
        let cmpLightDirectionalBlue = new ƒ.ComponentLight(new ƒ.LightDirectional(ƒ.Color.CSS("BLUE")));
        cmpLightDirectionalBlue.pivot.lookAt(new ƒ.Vector3(0.5, -1, 0.5));
        lights.addComponent(cmpLightDirectionalBlue);
        let graph = new ƒ.Node("Graph");
        graph.addChild(body);
        graph.addChild(Scenes.createCoordinateSystem());
        graph.addChild(lights);
        let viewport = new ƒ.Viewport();
        let cmpCamera = Scenes.createCamera(new ƒ.Vector3(1, 1, 2), new ƒ.Vector3(0, 0, 0));
        viewport.initialize("Viewport", graph, cmpCamera, document.querySelector("canvas"));
        Scenes.dollyViewportCamera(viewport);
        viewport.setFocus(true);
        viewport.draw();
        //*/
        window.setInterval(function () {
            // body.cmpTransform.rotateY(-1.1);
            lights.mtxLocal.rotateY(-1);
            // body.cmpTransform.rotateZ(-0.9);
            viewport.draw();
        }, 20);
        //*/
    }
})(TextureTest || (TextureTest = {}));
//# sourceMappingURL=LightMoving.js.map