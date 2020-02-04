namespace TextureTest {
    import ƒ = FudgeCore;

    window.addEventListener("load", init);

    function init(_event: Event): void {
        let coatWhite: ƒ.CoatColored = new ƒ.CoatColored(ƒ.Color.CSS("WHITE"));
        let material: ƒ.Material = new ƒ.Material("White", ƒ.ShaderFlat, coatWhite);
        let branch: ƒ.Node = new ƒ.Node("Branch");

        let body: ƒ.Node = Scenes.createCompleteMeshNode("Body", material, new ƒ.MeshPyramid());
        body.cmpTransform.local.translate(ƒ.Vector3.ZERO());
        body.cmpTransform.local.scale(new ƒ.Vector3(0.8, 0.8, 0.8));

        // let cmpLightAmbient: ƒ.ComponentLight = new ƒ.ComponentLight(ƒ.LIGHT_TYPE.AMBIENT, new ƒ.Color(.5, .5, .5, 1));
        // branch.addComponent(cmpLightAmbient);

        let cmpLightDirectionalRed: ƒ.ComponentLight = new ƒ.ComponentLight(new ƒ.LightDirectional(ƒ.Color.CSS("RED")));
        cmpLightDirectionalRed.pivot.rotateY(-90);
        branch.addComponent(cmpLightDirectionalRed);

        let cmpLightDirectionalGreen: ƒ.ComponentLight = new ƒ.ComponentLight(new ƒ.LightDirectional(ƒ.Color.CSS("GREEN")));
        branch.addComponent(cmpLightDirectionalGreen);

        let cmpLightDirectionalBlue: ƒ.ComponentLight = new ƒ.ComponentLight(new ƒ.LightDirectional( ƒ.Color.CSS("BLUE")));
        cmpLightDirectionalBlue.pivot.rotateY(180);
        branch.addComponent(cmpLightDirectionalBlue);

        let cmpLightDirectionalWhite: ƒ.ComponentLight = new ƒ.ComponentLight(new ƒ.LightDirectional(ƒ.Color.CSS("WHITE")));
        cmpLightDirectionalWhite.pivot.rotateY(90);
        branch.addComponent(cmpLightDirectionalWhite);

        branch.appendChild(body);
        branch.appendChild(Scenes.createCoordinateSystem());

        ƒ.RenderManager.initialize();
        ƒ.RenderManager.addBranch(branch);
        ƒ.RenderManager.update();

        let viewport: ƒ.Viewport = new ƒ.Viewport();
        let cmpCamera: ƒ.ComponentCamera = Scenes.createCamera(new ƒ.Vector3(1.5, 1.5, 1.5), new ƒ.Vector3(0, 0, 0));
        viewport.initialize("Viewport", branch, cmpCamera, document.querySelector("canvas"));

        Scenes.dollyViewportCamera(viewport);
        viewport.setFocus(true);
        viewport.draw();

        //*/
        window.setInterval(function (): void {
            // body.cmpTransform.rotateY(-1.1);
            body.cmpTransform.local.rotateY(-1);
            // body.cmpTransform.rotateZ(-0.9);
            ƒ.RenderManager.update();
            viewport.draw();
        },                 20);
        //*/
    }
}