namespace MeshTest {
    import ƒ = FudgeCore;

    window.addEventListener("load", init);
    
    let branch: ƒ.Node = new ƒ.Node("Branch");
    let gridFlat: ƒ.Node = new ƒ.Node("sphereTex");
    let gridTex: ƒ.Node = new ƒ.Node("sphereTex");

    function init(_event: Event): void {

        let matFlat: ƒ.Material = new ƒ.Material("White", ƒ.ShaderFlat, new ƒ.CoatColored(ƒ.Color.CSS("WHITE")));
        
        let img: HTMLImageElement = document.querySelector("img");
        let txtImage: ƒ.TextureImage = new ƒ.TextureImage();
        txtImage.image = img;
        let coatTextured: ƒ.CoatTextured = new ƒ.CoatTextured();
        coatTextured.texture = txtImage;

        let matTex: ƒ.Material = new ƒ.Material("Textured", ƒ.ShaderTexture, coatTextured);

        const myHeightMapFunction: ƒ.heightMapFunction = function(x, y): number {
             return Math.sin(x * y * Math.PI * 2) * 0.2; 
            };

        let gridMeshFlat: ƒ.Mesh = new ƒ.MeshHeightMap(20, 20, myHeightMapFunction);
        let gridMeshTex: ƒ.Mesh = new ƒ.MeshHeightMap(20, 20, myHeightMapFunction);

        gridFlat = Scenes.createCompleteMeshNode("Grid", matFlat, gridMeshFlat);
        gridTex = Scenes.createCompleteMeshNode("Grid", matTex, gridMeshTex);

        branch.appendChild(gridFlat);
        branch.appendChild(gridTex);

        gridFlat.cmpTransform.local.translateX(-0.6);
        gridTex.cmpTransform.local.translateX(0.6);

        let body: ƒ.Node = new ƒ.Node("k");

        let lights: ƒ.Node = Scenes.createThreePointLighting("lights", 110);
        branch.appendChild(lights);

        branch.appendChild(body);

        ƒ.RenderManager.initialize();
        ƒ.RenderManager.addBranch(branch);
        ƒ.RenderManager.update();

        let viewport: ƒ.Viewport = new ƒ.Viewport();
        let cmpCamera: ƒ.ComponentCamera = Scenes.createCamera(new ƒ.Vector3(0, 2, 2), new ƒ.Vector3(0, 0, 0));
        viewport.initialize("Viewport", branch, cmpCamera, document.querySelector("canvas"));

        Scenes.dollyViewportCamera(viewport);
        viewport.setFocus(true);
        viewport.draw();

        
        window.setInterval(function (): void {
            gridFlat.cmpTransform.local.rotateY(0.5);
            ƒ.RenderManager.update();
            viewport.draw();
        },                 20);
        
    }
}