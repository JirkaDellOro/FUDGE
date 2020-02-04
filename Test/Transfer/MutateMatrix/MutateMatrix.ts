namespace MutateMatrixTest {
  import ƒ = FudgeCore;
  document.addEventListener("DOMContentLoaded", init);
  let cmpTransform: ƒ.ComponentTransform;
  let i: number = 0;

  function init(): void {
    console.log("init");
    Scenes.createMiniScene();
    Scenes.createViewport(document.getElementsByTagName("canvas")[0]);
    cmpTransform = Scenes.node.getComponent(ƒ.ComponentTransform);

    console.log(cmpTransform);
    let orgMutator: ƒ.Mutator = cmpTransform.getMutator();
    console.log(orgMutator);
    // let mutator: ƒ.Mutator = matTest.getMutator();

    // let newMutator: ƒ.Mutator = {
    //   rotation: {
    //     x: 10
    //   }
    // };
    // cmpTransform.mutate(newMutator);
    ƒ.Debug.log(cmpTransform.getMutator());
    // console.log(matTest);
    // Scenes.viewPort.draw();
    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, nextFrame);
    ƒ.Loop.start();
  }
  
  function nextFrame(): void {
    let newMutator: ƒ.Mutator = {
      rotation: {
        x: i
      }
    };
    i++;
    cmpTransform.mutate(newMutator);
    ƒ.RenderManager.update();
    Scenes.viewport.draw();
  }

}