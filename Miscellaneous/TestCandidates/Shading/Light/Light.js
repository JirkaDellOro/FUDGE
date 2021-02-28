var TextureTest;
(function (TextureTest) {
    var ƒ = FudgeCore;
    window.addEventListener("load", init);
    function init(_event) {
        let coatWhite = new ƒ.CoatColored(ƒ.Color.CSS("WHITE"));
        let material = new ƒ.Material("White", ƒ.ShaderFlat, coatWhite);
        let graph = new ƒ.Node("Graph");
        let body = Scenes.createCompleteMeshNode("Body", material, new ƒ.MeshPyramid());
        body.mtxLocal.translate(ƒ.Vector3.ZERO());
        body.mtxLocal.scale(new ƒ.Vector3(0.8, 0.8, 0.8));
        // let cmpLightAmbient: ƒ.ComponentLight = new ƒ.ComponentLight(ƒ.LIGHT_TYPE.AMBIENT, new ƒ.Color(.5, .5, .5, 1));
        // graph.addComponent(cmpLightAmbient);
        let cmpLightDirectionalRed = new ƒ.ComponentLight(new ƒ.LightDirectional(ƒ.Color.CSS("RED")));
        // cmpLightDirectionalRed.pivot.rotateY(-90, true);
        // console.log(cmpLightDirectionalRed.pivot.toString());
        cmpLightDirectionalRed.pivot.translateX(1);
        console.log(cmpLightDirectionalRed.pivot.toString());
        cmpLightDirectionalRed.pivot.lookAt(ƒ.Vector3.ZERO());
        console.log(cmpLightDirectionalRed.pivot.toString());
        graph.addComponent(cmpLightDirectionalRed);
        let cmpLightDirectionalGreen = new ƒ.ComponentLight(new ƒ.LightDirectional(ƒ.Color.CSS("GREEN")));
        graph.addComponent(cmpLightDirectionalGreen);
        let cmpLightDirectionalBlue = new ƒ.ComponentLight(new ƒ.LightDirectional(ƒ.Color.CSS("BLUE")));
        cmpLightDirectionalBlue.pivot.rotateY(180);
        graph.addComponent(cmpLightDirectionalBlue);
        let cmpLightDirectionalWhite = new ƒ.ComponentLight(new ƒ.LightDirectional(ƒ.Color.CSS("WHITE")));
        cmpLightDirectionalWhite.pivot.rotateY(90);
        graph.addComponent(cmpLightDirectionalWhite);
        graph.addChild(body);
        let cosys = Scenes.createCoordinateSystem();
        graph.addChild(cosys);
        cosys.addComponent(new ƒ.ComponentTransform(cmpLightDirectionalRed.pivot));
        let viewport = new ƒ.Viewport();
        let cmpCamera = Scenes.createCamera(new ƒ.Vector3(1.5, 1.5, 1.5), new ƒ.Vector3(0, 0, 0));
        viewport.initialize("Viewport", graph, cmpCamera, document.querySelector("canvas"));
        Scenes.dollyViewportCamera(viewport);
        viewport.setFocus(true);
        viewport.draw();
        //*/
        window.setInterval(function () {
            // body.cmpTransform.rotateY(-1.1);
            body.mtxLocal.rotateY(-1);
            // body.cmpTransform.rotateZ(-0.9);
            viewport.draw();
        }, 20);
        //*/
    }
})(TextureTest || (TextureTest = {}));
//# sourceMappingURL=Light.js.map