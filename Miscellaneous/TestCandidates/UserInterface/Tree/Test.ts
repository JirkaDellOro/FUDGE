// /<reference types="../../../../Core/Build/FudgeCore"/>
namespace UI_Tree {
  import ƒ = FudgeCore;
  import ƒUi = FudgeUserInterface;
  import ƒAid = FudgeAid;

  let node: ƒ.Node;
  let viewport: ƒ.Viewport;

  window.addEventListener("load", hndLoad);

  function hndLoad(_event: Event): void {
    let canvas: HTMLCanvasElement = document.querySelector("canvas");
    node = new ƒAid.NodeCoordinateSystem("Test");
    let cmpCamera: ƒ.ComponentCamera = new ƒ.ComponentCamera();
    viewport = new ƒ.Viewport();
    viewport.initialize("Viewport", node, cmpCamera, canvas);

    cmpCamera.pivot.translate(new ƒ.Vector3(1, 2, 3));
    cmpCamera.pivot.lookAt(ƒ.Vector3.ZERO());

    let tree: ƒUi.Tree<ƒ.Node> = new ƒUi.Tree<ƒ.Node>(new TreeControllerNode(), node);
    document.body.appendChild(tree);

    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
    ƒ.Loop.start(ƒ.LOOP_MODE.TIME_REAL, 10);
  }

  function update(_event: Event): void {
    viewport.draw();
  }
}