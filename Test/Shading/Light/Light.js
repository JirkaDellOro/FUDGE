var TextureTest;
(function (TextureTest) {
    var ƒ = FudgeCore;
    window.addEventListener("load", init);
    function init(_event) {
        let coatWhite = new ƒ.CoatColored(ƒ.Color.CSS("WHITE"));
        let material = new ƒ.Material("White", ƒ.ShaderFlat, coatWhite);
        let branch = new ƒ.Node("Branch");
        let body = Scenes.createCompleteMeshNode("Body", material, new ƒ.MeshPyramid());
        body.cmpTransform.local.translate(ƒ.Vector3.ZERO());
        body.cmpTransform.local.scale(new ƒ.Vector3(0.8, 0.8, 0.8));
        // let cmpLightAmbient: ƒ.ComponentLight = new ƒ.ComponentLight(ƒ.LIGHT_TYPE.AMBIENT, new ƒ.Color(.5, .5, .5, 1));
        // branch.addComponent(cmpLightAmbient);
        let cmpLightDirectionalRed = new ƒ.ComponentLight(new ƒ.LightDirectional(ƒ.Color.CSS("RED")));
        cmpLightDirectionalRed.pivot.rotateY(-90);
        branch.addComponent(cmpLightDirectionalRed);
        let cmpLightDirectionalGreen = new ƒ.ComponentLight(new ƒ.LightDirectional(ƒ.Color.CSS("GREEN")));
        branch.addComponent(cmpLightDirectionalGreen);
        let cmpLightDirectionalBlue = new ƒ.ComponentLight(new ƒ.LightDirectional(ƒ.Color.CSS("BLUE")));
        cmpLightDirectionalBlue.pivot.rotateY(180);
        branch.addComponent(cmpLightDirectionalBlue);
        let cmpLightDirectionalWhite = new ƒ.ComponentLight(new ƒ.LightDirectional(ƒ.Color.CSS("WHITE")));
        cmpLightDirectionalWhite.pivot.rotateY(90);
        branch.addComponent(cmpLightDirectionalWhite);
        branch.appendChild(body);
        branch.appendChild(Scenes.createCoordinateSystem());
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
            // body.cmpTransform.rotateY(-1.1);
            body.cmpTransform.local.rotateY(-1);
            // body.cmpTransform.rotateZ(-0.9);
            ƒ.RenderManager.update();
            viewport.draw();
        }, 20);
        //*/
    }
})(TextureTest || (TextureTest = {}));
//# sourceMappingURL=Light.js.map