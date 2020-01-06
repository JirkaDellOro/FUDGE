namespace TextureTest {
    import ƒ = FudgeCore;

    window.addEventListener("load", init);

    function init(_event: Event): void {
        let coatWhite: ƒ.CoatColored = new ƒ.CoatColored(ƒ.Color.CSS("WHITE"));
        let material: ƒ.Material = new ƒ.Material("White", ƒ.ShaderFlat, coatWhite);

        let body: ƒ.Node = Scenes.createCompleteMeshNode("Body", material, new ƒ.MeshPyramid());
        body.cmpTransform.local.translate(ƒ.Vector3.ZERO());
        body.cmpTransform.local.scale(new ƒ.Vector3(0.8, 0.8, 0.8));

        let lights: ƒ.Node = new ƒ.Node("Lights");
        lights.addComponent(new ƒ.ComponentTransform());

        let cmpLightAmbient: ƒ.ComponentLight = new ƒ.ComponentLight(new ƒ.LightAmbient(new ƒ.Color(.1, .0, .0, 1)));
        lights.addComponent(cmpLightAmbient);

        let cmpLightDirectionalRed: ƒ.ComponentLight = new ƒ.ComponentLight(new ƒ.LightDirectional(ƒ.Color.CSS("RED")));
        cmpLightDirectionalRed.pivot.lookAt(new ƒ.Vector3(-1, 1, 0));
        lights.addComponent(cmpLightDirectionalRed);

        let cmpLightDirectionalGreen: ƒ.ComponentLight = new ƒ.ComponentLight(new ƒ.LightDirectional(ƒ.Color.CSS("GREEN")));
        cmpLightDirectionalGreen.pivot.lookAt(new ƒ.Vector3(0, 1, -1));
        lights.addComponent(cmpLightDirectionalGreen);

        let cmpLightDirectionalBlue: ƒ.ComponentLight = new ƒ.ComponentLight(new ƒ.LightDirectional( ƒ.Color.CSS("BLUE")));
        cmpLightDirectionalBlue.pivot.lookAt(new ƒ.Vector3(0.5, 1, 0.5));
        lights.addComponent(cmpLightDirectionalBlue);

        let branch: ƒ.Node = new ƒ.Node("Branch");
        branch.appendChild(body);
        branch.appendChild(Scenes.createCoordinateSystem());
        branch.appendChild(lights);

        ƒ.RenderManager.initialize();
        ƒ.RenderManager.addBranch(branch);
        ƒ.RenderManager.update();

        let viewport: ƒ.Viewport = new ƒ.Viewport();
        let cmpCamera: ƒ.ComponentCamera = Scenes.createCamera(new ƒ.Vector3(1, 1, 2), new ƒ.Vector3(0, 0, 0));
        viewport.initialize("Viewport", branch, cmpCamera, document.querySelector("canvas"));

        Scenes.dollyViewportCamera(viewport);
        viewport.setFocus(true);
        viewport.draw();

        //*/
        window.setInterval(
            function (): void {
                // body.cmpTransform.rotateY(-1.1);
                lights.cmpTransform.local.rotateY(-1);
                // body.cmpTransform.rotateZ(-0.9);
                ƒ.RenderManager.update();
                viewport.draw();
            },
            20);
        //*/
    }
}