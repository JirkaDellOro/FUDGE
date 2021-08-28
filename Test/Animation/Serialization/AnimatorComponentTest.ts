namespace AnimatorComponentTest {
  import ƒ = FudgeCore;
  import ƒAid = FudgeAid;
  window.addEventListener("DOMContentLoaded", init);

  let node: ƒ.Node;
  let root: ƒ.Node;
  let viewport: ƒ.Viewport;

  

  function init(): void {
    root = new ƒ.Node("Root");
    node = new ƒAid.Node("Test", ƒ.Matrix4x4.IDENTITY(), new ƒ.Material("Texture", ƒ.ShaderTexture, new ƒ.CoatTextured()), new ƒ.MeshCube("Cube"));
    root.appendChild(node);
    viewport = ƒAid.Viewport.create(root);
    viewport.draw();
    initAnim();
  }


  async function initAnim(): Promise<void> {
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


    let cmpAnimator: ƒ.ComponentAnimator = new ƒ.ComponentAnimator(animation, ƒ.ANIMATION_PLAYMODE.LOOP, ƒ.ANIMATION_PLAYBACK.TIMEBASED_CONTINOUS);
    cmpAnimator.speed = 2;

    // #region serialisation
    console.group("Serialization");
    console.log(cmpAnimator);
    let serialisation: ƒ.Serialization = cmpAnimator.serialize();
    console.log(ƒ.Serializer.stringify(serialisation));
    console.groupEnd();
    console.group("Reconstruction");
    let cmpAnimatorReconstructed: ƒ.ComponentAnimator = new ƒ.ComponentAnimator();
    await cmpAnimatorReconstructed.deserialize(serialisation);
    serialisation = cmpAnimatorReconstructed.serialize();
    console.log(cmpAnimatorReconstructed);
    console.log(ƒ.Serializer.stringify(serialisation));
    console.groupEnd();
    // #endregion

    // override component with reconstruction for testing. Deactivate to test original
    cmpAnimator = cmpAnimatorReconstructed;
    cmpAnimator.addEventListener("eventStart", hndlEv);
    cmpAnimator.addEventListener("eventAfterStart", hndlEv);
    cmpAnimator.addEventListener("eventMiddle", hndlEv);
    cmpAnimator.addEventListener("eventBeforeEnd", hndlEv);
    cmpAnimator.addEventListener("eventEnd", hndlEv);
    
    // cmpAnimation.playmode = ƒ.ANIMATION_PLAYMODE.REVERSELOOP;
    node.addComponent(cmpAnimator);
    cmpAnimator.jumpTo(animation.labels["test"]);
    cmpAnimator.activate(true);

    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, frame);
    ƒ.Loop.start();

    let timer: ƒ.Timer = new ƒ.Timer(ƒ.Time.game, 2000, 1, () => node.removeComponent(cmpAnimator));
    // let timer: ƒ.Timer = new ƒ.Timer(ƒ.Time.game, 2000, 1, () => root.removeChild(node));
  }

  function frame(): void {
    viewport.draw();
  }

  function hndlEv(_e: Event): void {
    console.log(_e.type);
  }
}