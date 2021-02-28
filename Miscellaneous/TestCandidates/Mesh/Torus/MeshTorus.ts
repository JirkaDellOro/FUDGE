namespace MeshTest {
  import ƒ = FudgeCore;
  ƒ.Render.initialize(true, true);
  import ƒAid = FudgeAid;

  window.addEventListener("load", init);

  let graph: ƒ.Node = new ƒ.Node("Graph");
  let torusTex: ƒ.Node = new ƒ.Node("torusTex");
  let torusFlat: ƒ.Node = new ƒ.Node("torusFlat");


  function init(_event: Event): void {
    let img: HTMLImageElement = document.querySelector("img");
    let txtImage: ƒ.TextureImage = new ƒ.TextureImage();
    txtImage.image = img;
    let coatTextured: ƒ.CoatTextured = new ƒ.CoatTextured();
    coatTextured.texture = txtImage;

    let matTex: ƒ.Material = new ƒ.Material("Textured", ƒ.ShaderTexture, coatTextured);
    let matFlat: ƒ.Material = new ƒ.Material("White", ƒ.ShaderFlat, new ƒ.CoatColored(ƒ.Color.CSS("WHITE")));

    let torusMesh1: ƒ.Mesh = new ƒ.MeshTorus("Torus", 0.25);
    let torusMesh2: ƒ.Mesh = new ƒ.MeshTorus("Torus", 0.5, 32, 24);
    torusFlat = Scenes.createCompleteMeshNode("torusFlat", matFlat, torusMesh1);
    torusTex = Scenes.createCompleteMeshNode("torusTexture", matTex, torusMesh2);

    torusFlat.mtxLocal.translateX(0.7);
    torusFlat.mtxLocal.rotation = new ƒ.Vector3(12, 60, 20);
    torusTex.mtxLocal.translateX(-0.7);

    graph.addChild(torusFlat);
    graph.addChild(torusTex);

    let body: ƒ.Node = new ƒ.Node("k");

    ƒAid.addStandardLightComponents(graph);

    graph.addChild(body);

    let viewport: ƒ.Viewport = new ƒ.Viewport();
    let cmpCamera: ƒ.ComponentCamera = Scenes.createCamera(new ƒ.Vector3(0, 0, 2.3), new ƒ.Vector3(0, 0, 0));
    viewport.initialize("Viewport", graph, cmpCamera, document.querySelector("canvas"));

    Scenes.dollyViewportCamera(viewport);
    viewport.setFocus(true);
    viewport.draw();


    window.setInterval(function (): void {
      torusTex.mtxLocal.rotateY(0.5);
      torusTex.mtxLocal.rotateZ(0.25);
      viewport.draw();
    }, 
                       20);

  }
}