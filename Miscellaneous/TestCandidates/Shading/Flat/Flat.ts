namespace TextureTest {
  import ƒ = FudgeCore;
  

  window.addEventListener("load", init);

  function init(_event: Event): void {
    let coatRed: ƒ.CoatColored = new ƒ.CoatColored(new ƒ.Color(1, 0, 0, 1));
    let material: ƒ.Material = new ƒ.Material("Red", ƒ.ShaderFlat, coatRed);

    let cube: ƒ.Node = Scenes.createCompleteMeshNode("Cube", material, new ƒ.MeshCube());

    cube.mtxLocal.translate(ƒ.Vector3.ZERO());

    let graph: ƒ.Node = new ƒ.Node("Graph");
    graph.addChild(cube);

    let viewport: ƒ.Viewport = new ƒ.Viewport();
    let cmpCamera: ƒ.ComponentCamera = Scenes.createCamera(new ƒ.Vector3(0, 3, 3), new ƒ.Vector3(0, 0, 0));
    viewport.initialize("Viewport", graph, cmpCamera, document.querySelector("canvas"));

    viewport.draw();

    window.setInterval(function (): void {
      cube.mtxLocal.rotateY(-1);
      cube.mtxLocal.rotateX(-2);
      viewport.draw();
    }, 
                       20);
  }
}