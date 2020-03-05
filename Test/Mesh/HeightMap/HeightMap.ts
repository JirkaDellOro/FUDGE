namespace MeshTest {
  import ƒ = FudgeCore;
  import ƒAid = FudgeAid;
  ƒ.RenderManager.initialize();

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

    const myHeightMapFunction: ƒ.heightMapFunction = function (x: number, y: number): number {
      return Math.sin(x * y * Math.PI * 2) * 0.2;
    };

    let gridMeshFlat: ƒ.Mesh = new ƒ.MeshHeightMap(20, 20, myHeightMapFunction);
    let gridMeshTex: ƒ.Mesh = new ƒ.MeshHeightMap(20, 20, myHeightMapFunction);

    gridFlat = Scenes.createCompleteMeshNode("Grid", matFlat, gridMeshFlat);
    gridTex = Scenes.createCompleteMeshNode("Grid", matTex, gridMeshTex);

    branch.addChild(gridFlat);
    branch.addChild(gridTex);

    gridFlat.cmpTransform.local.translateX(-0.6);
    gridTex.cmpTransform.local.translateX(0.6);

    let body: ƒ.Node = new ƒ.Node("k");

    let lights: ƒ.Node = new ƒAid.NodeThreePointLights("lights", 110);
    branch.addChild(lights);

    branch.addChild(body);


    let viewport: ƒ.Viewport = new ƒ.Viewport();
    let cmpCamera: ƒ.ComponentCamera = Scenes.createCamera(new ƒ.Vector3(0, 2, 2), new ƒ.Vector3(0, 0, 0));
    viewport.initialize("Viewport", branch, cmpCamera, document.querySelector("canvas"));

    Scenes.dollyViewportCamera(viewport);
    viewport.setFocus(true);
    viewport.draw();


    window.setInterval(function (): void {
      gridFlat.cmpTransform.local.rotateY(0.5);
      viewport.draw();
    },
                       20);

  }
}