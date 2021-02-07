namespace MeshTest {
  import ƒ = FudgeCore;
  ƒ.Render.initialize(true, true);
  import ƒAid = FudgeAid;

  window.addEventListener("load", init);

  let graph: ƒ.Node = new ƒ.Node("Graph");
  let sphereTex: ƒ.Node = new ƒ.Node("sphereTex");
  let sphereFlat: ƒ.Node = new ƒ.Node("sphereFlat");


  function init(_event: Event): void {
    let img: HTMLImageElement = document.querySelector("img");
    let txtImage: ƒ.TextureImage = new ƒ.TextureImage();
    txtImage.image = img;
    let coatTextured: ƒ.CoatTextured = new ƒ.CoatTextured();
    coatTextured.texture = txtImage;

    let matTex: ƒ.Material = new ƒ.Material("Textured", ƒ.ShaderTexture, coatTextured);
    let matFlat: ƒ.Material = new ƒ.Material("White", ƒ.ShaderFlat, new ƒ.CoatColored(ƒ.Color.CSS("WHITE")));

    let sphereMesh: ƒ.Mesh = new ƒ.MeshSphere("Sphere", 32, 24);
    sphereFlat = Scenes.createCompleteMeshNode("SphereFlat", matFlat, sphereMesh);
    sphereTex = Scenes.createCompleteMeshNode("SphereTexture", matTex, sphereMesh);

    sphereFlat.mtxLocal.translateX(0.6);
    sphereTex.mtxLocal.translateX(-0.6);

    graph.addChild(sphereFlat);
    graph.addChild(sphereTex);

    let body: ƒ.Node = new ƒ.Node("k");

    ƒAid.addStandardLightComponents(graph);
    // graph.addChild(lights);

    graph.addChild(body);

    let viewport: ƒ.Viewport = new ƒ.Viewport();
    let cmpCamera: ƒ.ComponentCamera = Scenes.createCamera(new ƒ.Vector3(0, 0, 2.3), new ƒ.Vector3(0, 0, 0));
    viewport.initialize("Viewport", graph, cmpCamera, document.querySelector("canvas"));

    Scenes.dollyViewportCamera(viewport);
    viewport.setFocus(true);
    viewport.draw();


    window.setInterval(function (): void {
      sphereTex.mtxLocal.rotateY(0.5);
      viewport.draw();
    }, 
                       20);

  }
}