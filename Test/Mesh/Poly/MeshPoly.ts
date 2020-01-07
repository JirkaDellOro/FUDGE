namespace MeshTest {
    import ƒ = FudgeCore;

    window.addEventListener("load", init);
    
    let branch: ƒ.Node = new ƒ.Node("Branch");
    let object: ƒ.Node = new ƒ.Node("object");

    export function loadMesh() {
        let meshdata: string = (<HTMLInputElement>document.getElementById("meshdata_textbox")).value;
        let mymesh: ƒ.Mesh = ƒ.importMesh(ƒ.MeshFormat.OBJ, meshdata);
        let material: ƒ.Material = new ƒ.Material("White", ƒ.ShaderFlat, new ƒ.CoatColored(ƒ.Color.CSS("WHITE")));
        object = Scenes.createCompleteMeshNode("Cube", material, mymesh);
        branch.appendChild(object);
    }

    function init(_event: Event): void {
        let body: ƒ.Node = new ƒ.Node("k");

        let cmpLightDirectionalRed: ƒ.ComponentLight = new ƒ.ComponentLight(new ƒ.LightDirectional(new ƒ.Color(1, 0.8, 0.7)));
        cmpLightDirectionalRed.pivot.rotateY(-90);
        branch.addComponent(cmpLightDirectionalRed);

        let cmpLightDirectionalWhite: ƒ.ComponentLight = new ƒ.ComponentLight(new ƒ.LightDirectional(ƒ.Color.CSS("WHITE")));
        cmpLightDirectionalWhite.pivot.rotateY(90);
        branch.addComponent(cmpLightDirectionalWhite);

        branch.appendChild(body);

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
            object.cmpTransform.local.rotateY(-1);
            ƒ.RenderManager.update();
            viewport.draw();
        },                 20);
        //*/
    }
}