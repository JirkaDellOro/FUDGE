namespace AnimationTest {
  //TEST
  import ƒ = FudgeCore;
  import ƒAid = FudgeAid;
  window.addEventListener("DOMContentLoaded", init);

  let node: ƒ.Node;
  let animation: ƒ.Animation;
  let viewport: ƒ.Viewport;

  let startTime: number = Date.now();

  function init(): void {
    node = new ƒAid.Node("Test", ƒ.Matrix4x4.IDENTITY(), new ƒ.Material("Uni", ƒ.ShaderUniColor, new ƒ.CoatColored()), new ƒ.MeshCube("Cube"));
    viewport = ƒAid.Viewport.create(node);
    viewport.draw();
    initAnim();
  }

  function initAnim(): void {
    let animseq: ƒ.AnimationSequence = new ƒ.AnimationSequence();
    animseq.addKey(new ƒ.AnimationKey(0, 0));
    animseq.addKey(new ƒ.AnimationKey(2000, 45));

    let animStructure: ƒ.AnimationStructure = {
      components: {
        ComponentTransform: [
          {
            "ƒ.ComponentTransform": {
              mtxLocal: {
                rotation: {
                  x: animseq,
                  y: animseq
                }
              }
            }
          }
        ]
      }
    };
    animation = new ƒ.Animation("testAnimation", animStructure, 10);

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
    // console.log(mutator);
    viewport.draw();
    
  }

  function hndlEv(_e: Event): void {
    console.log("event!");
  }
}