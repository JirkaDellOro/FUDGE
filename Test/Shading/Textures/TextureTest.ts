namespace TextureTest {
  import ƒ = FudgeCore;
  ƒ.Render.initialize(true, true);

  window.addEventListener("load", init);

  function init(_event: Event): void {
    let img: HTMLImageElement = document.querySelector("img");
    let txtImage: ƒ.TextureImage = new ƒ.TextureImage();
    txtImage.image = img;
    let coatTextured: ƒ.CoatTextured = new ƒ.CoatTextured();
    coatTextured.texture = txtImage;
    // let coatColored: ƒ.CoatColored = new ƒ.CoatColored(new ƒ.Color(1, 0, 0, 1));
    let material: ƒ.Material = new ƒ.Material("Textured", ƒ.ShaderTexture, coatTextured);

    let quad: ƒ.Node = Scenes.createCompleteMeshNode("Quad", material, new ƒ.MeshQuad());
    let cube: ƒ.Node = Scenes.createCompleteMeshNode("Cube", material, new ƒ.MeshCube());
    let pyramid: ƒ.Node = Scenes.createCompleteMeshNode("Pyramid", material, new ƒ.MeshPyramid());

    cube.mtxLocal.translateX(0.7);
    // cube.cmpTransform.rotateX(-45);
    cube.mtxLocal.rotateY(-45);

    pyramid.mtxLocal.translateX(-0.7);

    let graph: ƒ.Node = new ƒ.Node("Graph");
    graph.addChild(quad);
    graph.addChild(cube);
    graph.addChild(pyramid);

    let viewport: ƒ.Viewport = new ƒ.Viewport();
    let cmpCamera: ƒ.ComponentCamera = Scenes.createCamera(new ƒ.Vector3(0, 2, 3), new ƒ.Vector3(0, 0, 0));
    viewport.initialize("Viewport", graph, cmpCamera, document.querySelector("canvas"));

    viewport.draw();

    window.setInterval(function (): void {
      pyramid.mtxLocal.rotateX(1);
      cube.mtxLocal.rotateY(-1);
      quad.mtxLocal.rotateZ(1);
      viewport.draw();
    }, 
                       20);
  }
}