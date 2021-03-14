namespace PerformanceLeak {

  export import ƒ = FudgeCore;
  ƒ.Render.initialize(true, false);

  window.addEventListener("load", test);

  let game: ƒ.Node;
  let viewport: ƒ.Viewport;
  let elapsedTime: number = 0;
  let cmpMesh: ƒ.ComponentMesh = new ƒ.ComponentMesh(new ƒ.MeshSprite());
  let cmpMaterial: ƒ.ComponentMaterial = new ƒ.ComponentMaterial(new ƒ.Material("Node", ƒ.ShaderUniColor, new ƒ.CoatColored(ƒ.Color.CSS("blue", 0.2))));
  let cmpTransform: ƒ.ComponentTransform = new ƒ.ComponentTransform();
  let id: ƒ.Matrix4x4 = ƒ.Matrix4x4.IDENTITY();

  function test(): void {
    let canvas: HTMLCanvasElement = document.querySelector("canvas");

    game = new ƒ.Node("Game");
    createNode("Node");

    let cmpCamera: ƒ.ComponentCamera = new ƒ.ComponentCamera();
    cmpCamera.pivot.translateZ(28);
    cmpCamera.pivot.lookAt(ƒ.Vector3.ZERO());
    cmpCamera.backgroundColor = ƒ.Color.CSS("aliceblue");

    viewport = new ƒ.Viewport();
    viewport.initialize("Viewport", game, cmpCamera, canvas);
    viewport.draw();

    game.broadcastEvent(new CustomEvent("registerHitBox"));

    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
    ƒ.Loop.start(ƒ.LOOP_MODE.TIME_GAME, 60);

    function update(_event: ƒ.Eventƒ): void {
      elapsedTime += ƒ.Loop.timeFrameGame;

      // move nodes
      for (const node of game.getChildren()) {
        node.mtxLocal.translateX(0.1);
      }

      if (elapsedTime > 100) {
        // console.log(game.getChildren());
        // remove Node
        if (game.getChildren().length > 0) {
          let node: ƒ.Node = game.getChildren().pop();
          game.removeChild(node);
        }
        // // create Node
        createNode("Node");
        // for (const node of game.getChildren())
        //   node.mtxLocal = ƒ.Matrix4x4.IDENTITY();
        elapsedTime = 0;
      }


      viewport.draw();
    }

    function createNode(_name: string): ƒ.Node {
      let node: ƒ.Node = new ƒ.Node(_name);
      node.addComponent(new ƒ.ComponentTransform());
      // node.addComponent(cmpTransform);
      // mtxLocal.translation = ƒ.Vector3.ZERO();
      node.addComponent(cmpMaterial);
      node.addComponent(cmpMesh);
      game.appendChild(node);
      return node;
    }
  }
}

