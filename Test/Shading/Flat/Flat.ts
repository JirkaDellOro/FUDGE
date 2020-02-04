namespace TextureTest {
    import ƒ = FudgeCore;

    window.addEventListener("load", init);

    function init(_event: Event): void {
        let coatRed: ƒ.CoatColored = new ƒ.CoatColored(new ƒ.Color(1, 0, 0, 1));
        let material: ƒ.Material = new ƒ.Material("Red", ƒ.ShaderFlat, coatRed);

        let cube: ƒ.Node = Scenes.createCompleteMeshNode("Cube", material, new ƒ.MeshCube());

        cube.cmpTransform.local.translate(ƒ.Vector3.ZERO());

        let branch: ƒ.Node = new ƒ.Node("Branch");
        branch.appendChild(cube);

        ƒ.RenderManager.initialize();
        ƒ.RenderManager.addBranch(branch);
        ƒ.RenderManager.update();

        let viewport: ƒ.Viewport = new ƒ.Viewport();
        let cmpCamera: ƒ.ComponentCamera = Scenes.createCamera(new ƒ.Vector3(0, 3, 3), new ƒ.Vector3(0, 0, 0));
        viewport.initialize("Viewport", branch, cmpCamera, document.querySelector("canvas"));

        viewport.draw();

        window.setInterval(function (): void {
            cube.cmpTransform.local.rotateY(-1);
            cube.cmpTransform.local.rotateX(-2);
            ƒ.RenderManager.update();
            viewport.draw(); 
        },                 20);
    }
}