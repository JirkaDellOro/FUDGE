namespace MatCapTest {

    import ƒ = FudgeCore;
    
    let branch: ƒ.Node = new ƒ.Node("Branch");

    window.addEventListener("load", init);
    function init(): void {

        /* textures can only be loaded by https - not with file:// address (cross origin block) 
        so this example only works online or on a local server (form example node's http-server) */

        let img1: HTMLImageElement = document.querySelector("img[id='mc1']");
        let txtImage1: ƒ.TextureImage = new ƒ.TextureImage();
        txtImage1.image = img1;

        let img2: HTMLImageElement = document.querySelector("img[id='mc2']");
        let txtImage2: ƒ.TextureImage = new ƒ.TextureImage();
        txtImage2.image = img2;

        let ctMatcap: ƒ.CoatMatCap = new ƒ.CoatMatCap(txtImage1, new ƒ.Color(0.5, 0.5, 0.5, 1), 0.8);
        let ctMatcapGreen: ƒ.CoatMatCap = new ƒ.CoatMatCap(txtImage2, new ƒ.Color(0.5,0.5,0.5,1), 0.2);

        let mtlRed: ƒ.Material = new ƒ.Material("Material_Red", ƒ.ShaderMatCap, ctMatcap);
        let mtlGreen: ƒ.Material = new ƒ.Material("Material_Green", ƒ.ShaderMatCap, ctMatcapGreen);

        let pyramidRed: ƒ.Node = Scenes.createCompleteMeshNode("Cube", mtlRed, new ƒ.MeshPyramid());
        let pyramidGreen: ƒ.Node = Scenes.createCompleteMeshNode("Cube", mtlGreen, new ƒ.MeshPyramid());
        pyramidGreen.cmpTransform.local.translateX(1);
        pyramidRed.cmpTransform.local.translateX(-1);
        branch.appendChild(pyramidRed);
        branch.appendChild(pyramidGreen);
        
        
        ƒ.RenderManager.initialize();

        let viewport: ƒ.Viewport = new ƒ.Viewport();
        let cmpCamera: ƒ.ComponentCamera = Scenes.createCamera(new ƒ.Vector3(1, 1, 5), new ƒ.Vector3(0, 0, 0));
        viewport.initialize("Viewport", branch, cmpCamera, document.querySelector("canvas"));

        viewport.draw();
        
        ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, handleFrame);
        ƒ.Loop.start(ƒ.LOOP_MODE["TIME_GAME"], 30, true);

        function handleFrame(_event: Event): void {
            pyramidGreen.cmpTransform.local.rotateX(1);
            pyramidGreen.cmpTransform.local.rotateY(0.5);
            pyramidRed.cmpTransform.local.rotateX(0.6);
            pyramidRed.cmpTransform.local.rotateY(0.8);
            ƒ.RenderManager.update();
            viewport.draw();
        }
        
    }
}