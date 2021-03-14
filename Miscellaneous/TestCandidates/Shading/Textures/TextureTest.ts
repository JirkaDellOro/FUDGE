namespace TextureTest {
  import ƒ = FudgeCore;
  import ƒAid = FudgeAid;
  ƒ.Render.initialize(true, true);

  window.addEventListener("load", init);

  function init(_event: Event): void {
    let coatTextured: ƒ.CoatTextured = new ƒ.CoatTextured();
    let material: ƒ.Material = new ƒ.Material("Textured", ƒ.ShaderTexture, coatTextured);
    // coatTextured.texture.mipmap = ƒ.MIPMAP.BLURRY;

    let quad: ƒ.Node = new ƒAid.Node("Quad", ƒ.Matrix4x4.TRANSLATION(ƒ.Vector3.ZERO()), material, new ƒ.MeshQuad());
    let cube: ƒ.Node = new ƒAid.Node("Quad", ƒ.Matrix4x4.TRANSLATION(ƒ.Vector3.X(-0.7)), material, new ƒ.MeshCube());
    let pyramid: ƒ.Node = new ƒAid.Node("Quad", ƒ.Matrix4x4.TRANSLATION(ƒ.Vector3.X(0.7)), material, new ƒ.MeshPyramid());

    let graph: ƒ.Node = new ƒ.Node("Graph");
    graph.addChild(quad);
    graph.addChild(cube);
    graph.addChild(pyramid);

    let viewport: ƒ.Viewport = new ƒ.Viewport();
    let cmpCamera: ƒ.ComponentCamera = new ƒ.ComponentCamera();
    cmpCamera.pivot.translation = new ƒ.Vector3(0, 2, 3);
    cmpCamera.pivot.lookAt(new ƒ.Vector3(0, 0, 0));
    viewport.initialize("Viewport", graph, cmpCamera, document.querySelector("canvas"));

    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, function (): void {
      let speed: number = 0.5;
      pyramid.mtxLocal.rotateX(speed);
      cube.mtxLocal.rotateY(speed);
      quad.mtxLocal.rotateZ(speed);
      viewport.draw();
    });
    ƒ.Loop.start();
  }
}