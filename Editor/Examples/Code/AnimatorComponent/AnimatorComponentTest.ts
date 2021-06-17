///<reference path="../../../../Aid/Build/FudgeAid.d.ts"/>
namespace AnimatorComponentTest {
  import ƒ = FudgeCore;
  import ƒAid = FudgeAid;
  window.addEventListener("DOMContentLoaded", init);

  let node: ƒ.Node;
  let viewport = new ƒ.Viewport();


  let startTime: number = Date.now();

  function init(): void {
    let child: ƒAid.Node = new ƒAid.Node("Test", ƒ.Matrix4x4.IDENTITY(),
      new ƒ.Material("Red", ƒ.ShaderUniColor, new ƒ.CoatColored(ƒ.Color.CSS("red"))),
      new ƒ.MeshCube()
    );
    child.mtxLocal.scaleX(2);
    node.addChild(child);

    let camera: ƒ.ComponentCamera = new ƒ.ComponentCamera();
    camera.mtxPivot.translate(new ƒ.Vector3(1, 1, 10));
    camera.mtxPivot.lookAt(ƒ.Vector3.ZERO());

    let canvas: HTMLCanvasElement = ƒAid.Canvas.create();
    document.body.appendChild(canvas);
    viewport.initialize("TestViewport", node, camera, canvas);
    viewport.showSceneGraph();

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
    viewport.draw();
  }

  function hndlEv(_e: Event): void {
    console.log(_e.type/*, (<ƒ.ComponentAnimator>_e.target).getContainer().name*/);
  }


}