namespace AnimatorComponentTest {
  import ƒ = FudgeCore;
  window.addEventListener("DOMContentLoaded", init);

  let node: ƒ.Node;
  
  let startTime: number = Date.now();

  function init(): void {
    Scenes.createMiniScene();
    Scenes.createViewport();
    Scenes.viewport.draw();
    
    node = Scenes.node;
    initAnim();
  }
  
  function initAnim(): void {
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
    let animation: ƒ.Animation = new ƒ.Animation("testAnimation", animStructure, 1);
    animation.labels["test"] = 3000;
    animation.setEvent("startEvent", 0);
    animation.setEvent("almostStartEvent", 1);
    animation.setEvent("middleEvent", 2500);
    animation.setEvent("almostEndEvent", 4999);
    animation.setEvent("endEvent", 5000);

    
    let cmpAnimation: ƒ.ComponentAnimator = new ƒ.ComponentAnimator(animation, ƒ.ANIMATION_PLAYMODE.LOOP, ƒ.ANIMATION_PLAYBACK.TIMEBASED_CONTINOUS);
    // cmpAnimation.speed = 0.1;
    // node.addComponent(cmpAnimation);
    // cmpAnimation.speed = 10;
    // cmpAnimation.jumpTo(animation.labels["test"]);
    
    // #region serialisation
    console.group("before");
    console.log(cmpAnimation);
    let serialisation: ƒ.Serialization = cmpAnimation.serialize();
    console.log(ƒ.Serializer.stringify(serialisation));
    console.groupEnd();
    console.group("after");
    let animFromSeri: ƒ.ComponentAnimator = new ƒ.ComponentAnimator();
    animFromSeri.deserialize(serialisation);
    console.log(animFromSeri);
    console.groupEnd();
    node.addComponent(animFromSeri);
    // #endregion
    
    cmpAnimation.addEventListener("startEvent", hndlEv);
    cmpAnimation.addEventListener("almostStartEvent", hndlEv);
    cmpAnimation.addEventListener("middleEvent", hndlEv);
    cmpAnimation.addEventListener("almostEndEvent", hndlEv);
    cmpAnimation.addEventListener("endEvent", hndlEv);
    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, frame);
    ƒ.Loop.start();
  }

  function frame(): void {
    Scenes.viewport.draw();
  }

  function hndlEv(_e: Event): void {
    console.log(_e.type/*, (<ƒ.ComponentAnimator>_e.target).getContainer().name*/);
  }
}