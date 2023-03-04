namespace AnimatorControleTest {
  import ƒ = FudgeCore;
  import ƒAid = FudgeAid;
  window.addEventListener("DOMContentLoaded", init);

  let node: ƒ.Node;
  let root: ƒ.Node;
  let viewport: ƒ.Viewport;



  function init(): void {
    root = new ƒ.Node("Root");
    node = new ƒAid.Node("Test", ƒ.Matrix4x4.IDENTITY(), new ƒ.Material("texture", ƒ.ShaderLitTextured, new ƒ.CoatTextured()), new ƒ.MeshCube("Cube"));
    root.appendChild(node);
    viewport = ƒAid.Viewport.create(root);
    viewport.draw();

    initAnim();
    document.body.addEventListener("change", initAnim);
    (<HTMLInputElement>document.querySelector("button[id=jump]")).addEventListener("click", jump);
    function jump(_event: Event): void {
      console.log("Jump");
      let cmpAnimator: ƒ.ComponentAnimator = node.getComponent(ƒ.ComponentAnimator);
      cmpAnimator.jumpToLabel("jump");
    }

    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
    ƒ.Loop.start();
  }


  function initAnim(): void {
    console.log("%cStart over", "color: red;");
    let form: HTMLFormElement = document.forms[0];
    let formData: FormData = new FormData(document.forms[0]);
    let time0: number = parseInt((<HTMLInputElement>form.querySelector("input[name=time0]")).value);
    let time1: number = parseInt((<HTMLInputElement>form.querySelector("input[name=time1]")).value);
    let value0: number = parseInt((<HTMLInputElement>form.querySelector("input[name=value0]")).value);
    let value1: number = parseInt((<HTMLInputElement>form.querySelector("input[name=value1]")).value);

    let animseq: ƒ.AnimationSequence = new ƒ.AnimationSequence();
    animseq.addKey(new ƒ.AnimationKey(time0, value0));
    animseq.addKey(new ƒ.AnimationKey(time1, value1));

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


    let fpsInput: HTMLInputElement = (<HTMLInputElement>document.querySelector("input[name=fps]"));
    let fps: number = parseInt(fpsInput.value);

    let animation: ƒ.Animation = new ƒ.Animation("testAnimation", animStructure, fps);
    animation.setEvent("event", parseInt((<HTMLInputElement>form.querySelector("input[name=event]")).value));
    animation.labels["jump"] = parseInt((<HTMLInputElement>form.querySelector("input[name=label]")).value);

    let playmode: string = String(formData.get("mode"));
    let quantization: string = String(formData.get("back"));

    let cmpAnimator: ƒ.ComponentAnimator = new ƒ.ComponentAnimator(animation, ƒ.ANIMATION_PLAYMODE[playmode], ƒ.ANIMATION_QUANTIZATION[quantization]);
    cmpAnimator.scale = 1;
    cmpAnimator.addEventListener("event", (_event: Event) => {
      let time: number = (<ƒ.ComponentAnimator>_event.target).time;
      console.log(`Event fired at ${time}`, _event);
    });


    if (node.getComponent(ƒ.ComponentAnimator)) {
      node.removeComponent(node.getComponent(ƒ.ComponentAnimator));
    }


    node.addComponent(cmpAnimator);
    cmpAnimator.activate(true);

    console.log("Component", cmpAnimator);
  }

  function update(): void {
    viewport.draw();
  }
}