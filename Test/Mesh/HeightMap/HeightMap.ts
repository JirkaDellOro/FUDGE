namespace MeshTest {
  import ƒ = FudgeCore;
  import ƒAid = FudgeAid;
  

  window.addEventListener("load", init);

  let graph: ƒ.Node = new ƒ.Node("Graph");
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

    let gridMeshFlat: ƒ.Mesh = new ƒ.MeshHeightMap("HeightMap", 20, 20, myHeightMapFunction);
    let gridMeshTex: ƒ.Mesh = new ƒ.MeshHeightMap("HeightMap", 20, 20, myHeightMapFunction);

    gridFlat = Scenes.createCompleteMeshNode("Grid", matFlat, gridMeshFlat);
    gridTex = Scenes.createCompleteMeshNode("Grid", matTex, gridMeshTex);

    graph.addChild(gridFlat);
    graph.addChild(gridTex);

    gridFlat.mtxLocal.translateX(-0.6);
    gridTex.mtxLocal.translateX(0.6);

    let body: ƒ.Node = new ƒ.Node("k");

    ƒAid.addStandardLightComponents(graph);

    graph.addChild(body);


    let viewport: ƒ.Viewport = new ƒ.Viewport();
    let cmpCamera: ƒ.ComponentCamera = Scenes.createCamera(new ƒ.Vector3(0, 2, 2), new ƒ.Vector3(0, 0, 0));
    viewport.initialize("Viewport", graph, cmpCamera, document.querySelector("canvas"));

    Scenes.dollyViewportCamera(viewport);
    viewport.setFocus(true);
    viewport.draw();


    window.setInterval(function (): void {
      gridFlat.mtxLocal.rotateY(0.5);
      viewport.draw();
    },
                       20);

  }
}