namespace AnimatorComponentTest {
  import ƒ = FudgeCore;
  import ƒAid = FudgeAid;
  window.addEventListener("DOMContentLoaded", init);

  let node: ƒ.Node;
  let root: ƒ.Node;
  let viewport: ƒ.Viewport;

  

  function init(): void {
    root = new ƒ.Node("Root");
    node = new ƒAid.Node("Test", ƒ.Matrix4x4.IDENTITY(), new ƒ.Material("Uni", ƒ.ShaderUniColor, new ƒ.CoatColored()), new ƒ.MeshCube("Cube"));
    root.appendChild(node);
    viewport = ƒAid.Viewport.create(root);
    viewport.draw();
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
    let animation: ƒ.Animation = new ƒ.Animation("testAnimation", animStructure, 1);
    animation.labels["test"] = 3000;
    animation.setEvent("eventStart", 0);
    animation.setEvent("eventAfterStart", 1);
    animation.setEvent("eventMiddle", 2500);
    animation.setEvent("eventBeforeEnd", 4999);
    animation.setEvent("eventEnd", 5000);


    let cmpAnimation: ƒ.ComponentAnimator = new ƒ.ComponentAnimator(animation, ƒ.ANIMATION_PLAYMODE.LOOP, ƒ.ANIMATION_PLAYBACK.TIMEBASED_CONTINOUS);
    cmpAnimation.speed = 2;

    // #region serialisation
    console.group("before");
    console.log(cmpAnimation);
    let serialisation: ƒ.Serialization = cmpAnimation.serialize();
    console.log(ƒ.Serializer.stringify(serialisation));
    console.groupEnd();
    console.group("after");
    let cmpAnimationReconstructed: ƒ.ComponentAnimator = new ƒ.ComponentAnimator();
    cmpAnimationReconstructed.deserialize(serialisation);
    console.log(cmpAnimationReconstructed);
    console.groupEnd();
    // #endregion

    // override component with reconstruction for testing. Deactivate to test original
    // cmpAnimation = cmpAnimationReconstructed;
    cmpAnimation.addEventListener("eventStart", hndlEv);
    cmpAnimation.addEventListener("eventAfterStart", hndlEv);
    cmpAnimation.addEventListener("eventMiddle", hndlEv);
    cmpAnimation.addEventListener("eventBeforeEnd", hndlEv);
    cmpAnimation.addEventListener("eventEnd", hndlEv);
    
    cmpAnimation.playmode = ƒ.ANIMATION_PLAYMODE.REVERSELOOP;
    node.addComponent(cmpAnimation);
    cmpAnimation.jumpTo(animation.labels["test"]);
    cmpAnimation.activate(true);

    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, frame);
    ƒ.Loop.start();

    // let timer: ƒ.Timer = new ƒ.Timer(ƒ.Time.game, 2000, 1, () => node.removeComponent(cmpAnimation));
    let timer: ƒ.Timer = new ƒ.Timer(ƒ.Time.game, 2000, 1, () => root.removeChild(node));
  }

  function frame(): void {
    viewport.draw();
  }

  function hndlEv(_e: Event): void {
    console.log(_e.type);
  }
}