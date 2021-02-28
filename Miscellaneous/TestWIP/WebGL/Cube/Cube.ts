namespace Cube {
  import ƒ = FudgeCore;
  

  window.addEventListener("load", init);

  function init(_event: Event): void {
    ƒ.Debug.log("Refactored Cube");

    let graph: ƒ.Node = new ƒ.Node("Graph");

    let coSys: ƒ.Node = Scenes.createCoordinateSystem();
    graph.addChild(coSys);

    let material: ƒ.Material = new ƒ.Material("Red", ƒ.ShaderUniColor, new ƒ.CoatColored(new ƒ.Color(1, 1, 1, 1)));
    let body: ƒ.Node = Scenes.createCompleteMeshNode("Body", material, new ƒ.MeshCube());
    body.mtxLocal.rotateX(-30);
    body.mtxLocal.translateX(1);
    body.mtxLocal.scale(new ƒ.Vector3(0.8, 0.8, 0.8));

    let child: ƒ.Node = Scenes.createCompleteMeshNode("Child", material, new ƒ.MeshPyramid());
    child.mtxLocal.translateX(1.5);
    body.appendChild(child);
    graph.addChild(body);

    let viewport: ƒ.Viewport = new ƒ.Viewport();
    let cmpCamera: ƒ.ComponentCamera = Scenes.createCamera(new ƒ.Vector3(1, 1, 4), body.mtxWorld.translation);
    viewport.initialize("Viewport", graph, cmpCamera, document.querySelector("canvas"));
    viewport.draw();
  }
}