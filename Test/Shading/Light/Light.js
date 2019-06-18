var TextureTest;
(function (TextureTest) {
    var ƒ = Fudge;
    window.addEventListener("load", init);
    function init(_event) {
        let coatRed = new ƒ.CoatColored(new ƒ.Color(1, 0, 0, 1));
        let material = new ƒ.Material("Red", ƒ.ShaderFlat, coatRed);
        let cube = Scenes.createCompleteMeshNode("Cube", material, new ƒ.MeshCube());
        cube.cmpTransform.translate(0, 0, 0);
        let cmpLightAmbient = new ƒ.ComponentLight(new ƒ.LightAmbient(new ƒ.Color(.1, .0, .0, 1)));
        cube.addComponent(cmpLightAmbient);
        let cmpLightDirectionalRed = new ƒ.ComponentLight(new ƒ.LightDirectional(new ƒ.Color(1, 0, 0, 1)));
        cube.addComponent(cmpLightDirectionalRed);
        let cmpLightDirectionalGreen = new ƒ.ComponentLight(new ƒ.LightDirectional(new ƒ.Color(0, 1, 0, 1), new ƒ.Vector3(-1, 0, 0)));
        cube.addComponent(cmpLightDirectionalGreen);
        let cmpLightDirectionalBlue = new ƒ.ComponentLight(new ƒ.LightDirectional(new ƒ.Color(0, 0, 1, 1), new ƒ.Vector3(0, 0, -1)));
        cube.addComponent(cmpLightDirectionalBlue);
        let branch = new ƒ.Node("Branch");
        branch.appendChild(cube);
        ƒ.RenderManager.initialize();
        ƒ.RenderManager.addBranch(branch);
        // ƒ.RenderManager.recalculateAllNodeTransforms();
        let viewport = new ƒ.Viewport();
        let camera = Scenes.createCamera(new ƒ.Vector3(0, 0, 3), new ƒ.Vector3(0, 0, 0));
        viewport.initialize("Viewport", branch, camera.getComponent(ƒ.ComponentCamera), document.querySelector("canvas"));
        // viewport.draw();
        window.setInterval(function () {
            cube.cmpTransform.rotateY(-1);
            cube.cmpTransform.rotateX(-0.2);
            cube.cmpTransform.rotateZ(-0.5);
            ƒ.RenderManager.update();
            viewport.draw();
        }, 20);
    }
})(TextureTest || (TextureTest = {}));
//# sourceMappingURL=Light.js.map