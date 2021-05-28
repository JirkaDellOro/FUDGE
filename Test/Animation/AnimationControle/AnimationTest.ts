namespace AnimatorControleTest {
  import ƒ = FudgeCore;
  import ƒAid = FudgeAid;
  window.addEventListener("DOMContentLoaded", init);

  let node: ƒ.Node;
  let root: ƒ.Node;
  let viewport: ƒ.Viewport;



  function init(): void {
    root = new ƒ.Node("Root");
    node = new ƒAid.Node("Test", ƒ.Matrix4x4.IDENTITY(), new ƒ.Material("texture", ƒ.ShaderTexture, new ƒ.CoatTextured()), new ƒ.MeshCube("Cube"));
    root.appendChild(node);
    viewport = ƒAid.Viewport.create(root);
    viewport.draw();


    (<HTMLInputElement>document.querySelector("button[id=start]")).addEventListener("click", initAnim);
    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, frame);
    ƒ.Loop.start();

  }


  function initAnim(): void {


    let form: HTMLFormElement = document.forms[0];
    let formData: FormData = new FormData(document.forms[0]);
    let time1: number = parseInt((<HTMLInputElement>form.querySelector("input[name=keytime1]")).value);
    let time2: number = parseInt((<HTMLInputElement>form.querySelector("input[name=keytime2]")).value);
    let value1: number = parseInt((<HTMLInputElement>form.querySelector("input[name=value1]")).value);
    let value2: number = parseInt((<HTMLInputElement>form.querySelector("input[name=value2]")).value);

    let animseq: ƒ.AnimationSequence = new ƒ.AnimationSequence();
    animseq.addKey(new ƒ.AnimationKey(time1, value1));
    animseq.addKey(new ƒ.AnimationKey(time2, value2));
    let test: string = "rotation";
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
    let fpsInput: HTMLInputElement = (<HTMLInputElement>document.querySelector("input[name=fps]"));

    let fps: number = parseInt(fpsInput.value);

    let animation: ƒ.Animation = new ƒ.Animation("testAnimation", animStructure, fps);

    let playmode: string = String(formData.get("mode"));
    let playback: string = String(formData.get("back"));



    let cmpAnimation: ƒ.ComponentAnimator = new ƒ.ComponentAnimator(animation, ƒ.ANIMATION_PLAYMODE[playmode], ƒ.ANIMATION_PLAYBACK[playback]);
    cmpAnimation.speed = 1;

    if (node.getComponent(ƒ.ComponentAnimator)) {
      node.removeComponent(node.getComponent(ƒ.ComponentAnimator));
    }


    node.addComponent(cmpAnimation);
    cmpAnimation.activate(true);


    console.log(cmpAnimation);


   
  }

  function frame(): void {
    viewport.draw();
  }

}