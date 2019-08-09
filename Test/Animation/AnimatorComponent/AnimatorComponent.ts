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
    let animation: ƒ.Animation = new ƒ.Animation(animStructure);
    animation.labels["test"] = 3000;

    console.group("before");
    console.log(animation);
    let serialisation: ƒ.Serialization = animation.serialize();
    console.log(ƒ.Serializer.stringify(serialisation));
    console.groupEnd();
    console.group("after");
    let animFromSeri: ƒ.Animation = new ƒ.Animation(null);
    animFromSeri.deserialize(serialisation);
    console.log(animFromSeri);
    console.groupEnd();

    let cmpAnimation: ƒ.ComponentAnimator = new ƒ.ComponentAnimator(animFromSeri, ƒ.ANIMATION_PLAYMODE.PINGPONG, ƒ.ANIMATION_PLAYBACK.UNLIMITED);
    node.addComponent(cmpAnimation);
    console.log(node);
    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, frame);
    ƒ.Loop.start();
  }

  function frame(): void {
    ƒ.RenderManager.update();
    Scenes.viewPort.draw();
  }

  function hndlEv(_e: Event): void {
    console.log("event!");
  }


}