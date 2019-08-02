namespace AnimationTest {
  import ƒ = Fudge;
  window.addEventListener("DOMContentLoaded", init);

  let node: ƒ.Node;
  let mesh: ƒ.ComponentMesh;
  let animation: ƒ.Animation;

  let startTime: number = Date.now();

  function init(): void {
    Scenes.createMiniScene();
    Scenes.createViewport();
    Scenes.viewPort.draw();

    node = Scenes.node;
    mesh = node.getComponent(ƒ.ComponentMesh);
    initAnim();

    window.requestAnimationFrame(frame);
  }

  function initAnim(): void {
    let mutator: ƒ.MutatorForAnimation = mesh.getMutatorForAnimation();
    animation = new ƒ.Animation(mutator);
    let animseq: ƒ.AnimationSequenceAsso = {
      // x: new ƒ.AnimationSequence(),
      y: new ƒ.AnimationSequence()
    };
    // console.log(mutator.pivot["rotation"]);
    animation.sequences.set(mutator["pivot"]["rotation"], animseq);
    // animseq["x"].addKey(new ƒ.AnimationKey(0, 0));
    // animseq["x"].addKey(new ƒ.AnimationKey(2000, 0));
    // animseq["x"].addKey(new ƒ.AnimationKey(3000, 90));
    // animseq["x"].addKey(new ƒ.AnimationKey(4000, 135));
    animseq["y"].addKey(new ƒ.AnimationKey(0, 0));
    animseq["y"].addKey(new ƒ.AnimationKey(5000, 90));
    animseq["y"].addKey(new ƒ.AnimationKey(10000, 0));

    animation.events["myEvent"] = 5000;
    animation.labels["jumpHere"] = 5000;

    animation.addEventListener("myEvent", hndlEv);
    animation.jumpTo(animation.labels["jumpHere"], 0);

    // animation.playmode = ƒ.ANIMPLAYMODE.PINGPONG;
    // console.log(animation.sequences);
    // animation.update(1000);
    // console.log(animation);
    // console.log(mutator.pivot);
  }

  function frame(): void {
    // console.log(Date.now() - startTime);
    // let mutator: ƒ.MutatorForAnimation = mesh.getMutatorForAnimation();
    // mutator.pivot["rotation"].x++;
    let time: number = Date.now() - startTime;
    // if(time > 2000) debugger;
    animation.update(time);

    mesh.mutate(animation.animatedObject);
    // console.clear();
    // console.log(time % 4000, animation.animatedObject["pivot"]["rotation"]["x"]);
    Scenes.viewPort.draw();
    window.requestAnimationFrame(frame);
  }

  function hndlEv(_e: Event): void {
    console.log("event!");
  }


}