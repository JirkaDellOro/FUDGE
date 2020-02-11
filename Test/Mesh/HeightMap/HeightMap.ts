namespace MeshTest {
    import ƒ = FudgeCore;

    window.addEventListener("load", init);
    
    let branch: ƒ.Node = new ƒ.Node("Branch");
    let grid: ƒ.Node = new ƒ.Node("sphereTex");

    function init(_event: Event): void {

        let matFlat: ƒ.Material = new ƒ.Material("White", ƒ.ShaderFlat, new ƒ.CoatColored(ƒ.Color.CSS("WHITE")));
    
        const myHeightMapFunction: ƒ.heightMapFunction = function(x, y): number {
             return Math.sin(x * y * Math.PI * 2) * 0.2; 
            };

        let gridMesh: ƒ.Mesh = new ƒ.MeshHeightMap(20, 20, myHeightMapFunction);

        grid = Scenes.createCompleteMeshNode("Grid", matFlat, gridMesh);

        branch.appendChild(grid);

        let body: ƒ.Node = new ƒ.Node("k");

        let lights: ƒ.Node = Scenes.createThreePointLighting("lights", 110);
        branch.appendChild(lights);

        branch.appendChild(body);

        ƒ.RenderManager.initialize();
        ƒ.RenderManager.addBranch(branch);
        ƒ.RenderManager.update();

        let viewport: ƒ.Viewport = new ƒ.Viewport();
        let cmpCamera: ƒ.ComponentCamera = Scenes.createCamera(new ƒ.Vector3(2, 1, 0), new ƒ.Vector3(0, 0, 0));
        viewport.initialize("Viewport", branch, cmpCamera, document.querySelector("canvas"));

        Scenes.dollyViewportCamera(viewport);
        viewport.setFocus(true);
        viewport.draw();

        
        window.setInterval(function (): void {
            grid.cmpTransform.local.rotateY(0.5);
            ƒ.RenderManager.update();
            viewport.draw();
        },                 20);
        
    }
}