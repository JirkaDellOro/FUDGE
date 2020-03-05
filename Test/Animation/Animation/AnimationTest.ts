namespace AnimationTest {
  //TEST
  import ƒ = FudgeCore;
  window.addEventListener("DOMContentLoaded", init);

  let node: ƒ.Node;
  let cmpMesh: ƒ.ComponentMesh;
  let animation: ƒ.Animation;

  let startTime: number = Date.now();

  function init(): void {
    Scenes.createMiniScene();
    Scenes.createViewport();
    Scenes.viewport.draw();

    node = Scenes.node;
    cmpMesh = node.getComponent(ƒ.ComponentMesh);
    initAnim();

  }

  function initAnim(): void {
    let nS: ƒ.Serialization = node.serialize();
    console.log(cmpMesh.getMutator());
    console.log(ƒ.Serializer.stringify(nS));

    let animseq: ƒ.AnimationSequence = new ƒ.AnimationSequence();
    animseq.addKey(new ƒ.AnimationKey(0, 0));
    animseq.addKey(new ƒ.AnimationKey(5000, 45));

    let animStructure: ƒ.AnimationStructure = {
      components: {
        ComponentTransform: [
          {
            "ƒ.ComponentTransform": {
              rotation: {
                x: animseq,
                y: animseq
              }
            }
          }
        ]
      }
    };
    animation = new ƒ.Animation("testAnimation", animStructure);

    console.log(animation);
    // animation.animationStructure["components"]["ComponentMesh"][0]["ƒ.ComponentMesh"]["pivot"]["rotation"]["y"] = animseq;

    // console.log(animation.getMutated(2));
    // window.requestAnimationFrame(frame);
    // window.setInterval(frame, 500);
    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, frame);
    ƒ.Loop.start();
  }

  function frame(): void {
    // console.log(Date.now() - startTime);
    // let mutator: ƒ.MutatorForAnimation = mesh.getMutatorForAnimation();
    // mutator.pivot["rotation"].x++;
    let time: number = Date.now() - startTime;
    // if (time > 2000) debugger;
    // animation.update(time);
    time = time % animation.totalTime;
    let mutator: ƒ.Mutator = animation.getMutated(time, 1, ƒ.ANIMATION_PLAYBACK.TIMEBASED_CONTINOUS);
    // console.log(node.getComponent(ƒ.ComponentMesh).getMutator());
    // console.log(mutator["components"]["ComponentMesh"][0]["ƒ.ComponentMesh"]);
    // node.getComponent(ƒ.ComponentMesh).mutate(<ƒ.Mutator>(mutator["components"]["ComponentMesh"][0]["ƒ.ComponentMesh"]));
    node.applyAnimation(mutator);

    Scenes.viewport.draw();
  }

  function hndlEv(_e: Event): void {
    console.log("event!");
  }


}