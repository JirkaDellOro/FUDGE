namespace AnimatorComponentTest {
  import ƒ = Fudge;
  window.addEventListener("DOMContentLoaded", init);

  let node: ƒ.Node;
  
  let startTime: number = Date.now();

  function init(): void {
    Scenes.createMiniScene();
    Scenes.createViewport();
    Scenes.viewPort.draw();
    
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

    //#region serialisation
    // console.group("before");
    // console.log(animation);
    // let serialisation: ƒ.Serialization = animation.serialize();
    // console.log(ƒ.Serializer.stringify(serialisation));
    // console.groupEnd();
    // console.group("after");
    // let animFromSeri: ƒ.Animation = new ƒ.Animation(null);
    // animFromSeri.deserialize(serialisation);
    // console.log(animFromSeri);
    // console.groupEnd();
    //#endregion

    let cmpAnimation: ƒ.ComponentAnimator = new ƒ.ComponentAnimator(animation, ƒ.ANIMATION_PLAYMODE.REVERSELOOP, ƒ.ANIMATION_PLAYBACK.FRAMEBASED);
    // cmpAnimation.speed = 0.1;
    node.addComponent(cmpAnimation);
    // cmpAnimation.speed = 10;
    // cmpAnimation.jumpTo(animation.labels["test"]);

    cmpAnimation.addEventListener("startEvent", hndlEv);
    cmpAnimation.addEventListener("almostStartEvent", hndlEv);
    cmpAnimation.addEventListener("middleEvent", hndlEv);
    cmpAnimation.addEventListener("almostEndEvent", hndlEv);
    cmpAnimation.addEventListener("endEvent", hndlEv);
    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, frame);
    ƒ.Loop.start();
  }

  function frame(): void {
    ƒ.RenderManager.update();
    Scenes.viewPort.draw();
  }

  function hndlEv(_e: Event): void {
    console.log(_e.type/*, (<ƒ.ComponentAnimator>_e.target).getContainer().name*/);
  }


}