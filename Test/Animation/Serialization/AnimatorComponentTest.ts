namespace AnimatorComponentTest {
  import ƒ = FudgeCore;
  import ƒAid = FudgeAid;
  window.addEventListener("DOMContentLoaded", init);
  let viewport: ƒ.Viewport;

  function init(): void {
    let root: ƒ.Node = new ƒ.Node("Root");
    viewport = ƒAid.Viewport.create(root);
    document.body.addEventListener("change", createTest);
    createTest();
  }


  async function createTest(): Promise<void> {
    console.log("%cStart over", "color: red;");
    let root: ƒ.Node = new ƒ.Node("Root");
    let node: ƒ.Node;
    node = new ƒAid.Node("Test", ƒ.Matrix4x4.IDENTITY(), new ƒ.Material("Texture", ƒ.ShaderLitTextured, new ƒ.CoatTextured()), new ƒ.MeshCube("Cube"));
    root.appendChild(node);
    viewport.setBranch(root);
    viewport.draw();

    let animseq: ƒ.AnimationSequence = new ƒ.AnimationSequence();
    animseq.addKey(new ƒ.AnimationKey(0, 0));
    animseq.addKey(new ƒ.AnimationKey(5000, 45));

    let animStructure: ƒ.AnimationStructure = {
      components: {
        ComponentTransform: [
          {
            mtxLocal: {
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
    animation.labels["test"] = 2000;
    animation.setEvent("event", 3000);


    let cmpAnimator: ƒ.ComponentAnimator = new ƒ.ComponentAnimator(animation, ƒ.ANIMATION_PLAYMODE.LOOP, ƒ.ANIMATION_QUANTIZATION.CONTINOUS);
    cmpAnimator.scale = 2;

    // #region serialisation
    console.groupCollapsed("Animation");
    let serialisation: ƒ.Serialization = animation.serialize();
    console.log("Animation", ƒ.Serializer.stringify(serialisation));
    console.groupEnd();

    console.groupCollapsed("Serialization");
    console.log(cmpAnimator);
    serialisation = cmpAnimator.serialize();
    let txtOriginal: string = ƒ.Serializer.stringify(serialisation);
    console.log("ComponentAnimator original", txtOriginal);
    console.groupEnd();

    console.groupCollapsed("Reconstruction");
    let cmpAnimatorReconstructed: ƒ.ComponentAnimator = new ƒ.ComponentAnimator();
    await cmpAnimatorReconstructed.deserialize(serialisation);
    // console.log(cmpAnimatorReconstructed);
    serialisation = cmpAnimatorReconstructed.serialize();
    let txtReconstruction: string = ƒ.Serializer.stringify(serialisation);
    console.log(txtReconstruction);
    console.groupEnd();
    // #endregion
    if (txtOriginal == txtReconstruction)
      console.log("Serialization strings of original and reconstruction match");
    else
      console.error("Serialization strings of original and reconstruction don't match");

    let formdata: FormData = new FormData(document.forms[0]);
    if (formdata.get("use") == "reconstruction")
      cmpAnimator = cmpAnimatorReconstructed;

    cmpAnimator.addEventListener("event", hndlEv);
    if (formdata.get("jump"))
      cmpAnimator.addEventListener("event", (_event: Event) => cmpAnimator.jumpTo(animation.labels["test"]));

    node.addComponent(cmpAnimator);
    cmpAnimator.activate(true);

    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, frame);
    ƒ.Loop.start();

    if (formdata.get("destroy") == "detach")
      console.log(new ƒ.Timer(ƒ.Time.game, 8000, 1, () => node.removeComponent(cmpAnimator)));
    if (formdata.get("destroy") == "remove")
      console.log(new ƒ.Timer(ƒ.Time.game, 8000, 1, () => root.removeChild(node)));
  }

  function frame(): void {
    viewport.draw();
  }

  function hndlEv(_e: Event): void {
    console.log("Event handled", _e);
  }
}