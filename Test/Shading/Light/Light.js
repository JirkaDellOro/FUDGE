var TextureTest;
(function (TextureTest) {
    var ƒ = Fudge;
    window.addEventListener("load", init);
    function init(_event) {
        let coatRed = new ƒ.CoatColored(new ƒ.Color(1, 0, 0, 1));
        let material = new ƒ.Material("Red", ƒ.ShaderFlat, coatRed);
        let body = Scenes.createCompleteMeshNode("Body", material, new ƒ.MeshPyramid());
        body.cmpTransform.translate(0, 0, 0);
        let cmpLightAmbient = new ƒ.ComponentLight(new ƒ.LightAmbient(new ƒ.Color(.1, .0, .0, 1)));
        body.addComponent(cmpLightAmbient);
        let cmpLightDirectionalRed = new ƒ.ComponentLight(new ƒ.LightDirectional(new ƒ.Color(1, 0, 0, 1)));
        body.addComponent(cmpLightDirectionalRed);
        let cmpLightDirectionalGreen = new ƒ.ComponentLight(new ƒ.LightDirectional(new ƒ.Color(0, 1, 0, 1), new ƒ.Vector3(-1, 0, 0)));
        body.addComponent(cmpLightDirectionalGreen);
        let cmpLightDirectionalBlue = new ƒ.ComponentLight(new ƒ.LightDirectional(new ƒ.Color(0, 0, 1, 1), new ƒ.Vector3(0, 0, -1)));
        body.addComponent(cmpLightDirectionalBlue);
        let branch = new ƒ.Node("Branch");
        branch.appendChild(body);
        ƒ.RenderManager.initialize();
        ƒ.RenderManager.addBranch(branch);
        // ƒ.RenderManager.recalculateAllNodeTransforms();
        let viewport = new ƒ.Viewport();
        let camera = Scenes.createCamera(new ƒ.Vector3(0, -3, 0.01), new ƒ.Vector3(0, 0, 0));
        viewport.initialize("Viewport", branch, camera.getComponent(ƒ.ComponentCamera), document.querySelector("canvas"));
        // viewport.draw();
        window.setInterval(function () {
            // body.cmpTransform.rotateY(-1.1);
            body.cmpTransform.rotateX(-1);
            // body.cmpTransform.rotateZ(-0.9);
            ƒ.RenderManager.update();
            viewport.draw();
        }, 20);
    }
})(TextureTest || (TextureTest = {}));
//# sourceMappingURL=Light.js.map