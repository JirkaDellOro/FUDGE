namespace Cube {
    import ƒ = Fudge;

    window.addEventListener("load", init);

    function init(_event: Event): void {
        ƒ.Debug.log("Refactored Cube");

        let material: ƒ.Material = new ƒ.Material("Red", ƒ.ShaderUniColor, new ƒ.CoatColored(new ƒ.Color(1, 1, 1, 1)));
        let body: ƒ.Node = Scenes.createCompleteMeshNode("Body", material, new ƒ.MeshCube());
        body.cmpTransform.matrix.translateZ(-4);

        ƒ.RenderManager.initialize();
        ƒ.RenderManager.addBranch(body);
        ƒ.RenderManager.update();

        let viewport: ƒ.Viewport = new ƒ.Viewport();
        let camera: ƒ.Node = Scenes.createCamera(ƒ.Vector3.ZERO, body.cmpTransform.matrix.translation);
        viewport.initialize("Viewport", body, camera.getComponent(ƒ.ComponentCamera), document.querySelector("canvas"));

        viewport.draw();
    }
}