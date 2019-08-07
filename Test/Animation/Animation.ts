namespace AnimationTest {
  import ƒ = Fudge;
  window.addEventListener("DOMContentLoaded", init);

  let node: ƒ.Node;
  let cmpMesh: ƒ.ComponentMesh;
  let animation: ƒ.Animation;

  let startTime: number = Date.now();

  function init(): void {
    Scenes.createMiniScene();
    Scenes.createViewport();
    Scenes.viewPort.draw();

    node = Scenes.node;
    cmpMesh = node.getComponent(ƒ.ComponentMesh);
    initAnim();

  }
  
  function initAnim(): void {
    let nS: ƒ.Serialization = node.serialize();
    console.log(cmpMesh.getMutator());
    // console.log(ƒ.Serializer.stringify(nS));
    
    let animseq: ƒ.AnimationSequence = new ƒ.AnimationSequence();
    animseq.addKey(new ƒ.AnimationKey(0, 0));
    animseq.addKey(new ƒ.AnimationKey(5000, 90));
    
    let animStructure: ƒ.AnimationStructure = {
      components: {
        ComponentMesh: [
          {
            "ƒ.ComponentMesh": {
              pivot: {
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
    animation = new ƒ.Animation(animStructure);
    
    console.log(animation);
    // animation.animationStructure["components"]["ComponentMesh"][0]["ƒ.ComponentMesh"]["pivot"]["rotation"]["y"] = animseq;
    
    // console.log(animation.getMutated(2));
    // window.requestAnimationFrame(frame);
    window.setInterval(frame, 500);
  }
  
  function initAnimOld(): void {
    let mutator: ƒ.MutatorForAnimation = cmpMesh.getMutatorForAnimation();
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
    animseq["y"].addKey(new ƒ.AnimationKey(2000, 90));
    animseq["y"].addKey(new ƒ.AnimationKey(3000, 180));
    animseq["y"].addKey(new ƒ.AnimationKey(4000, 0));

    animation.events["myEvent"] = 2000;
    animation.labels["jumpHere"] = 2500;

    animation.addEventListener("myEvent", hndlEv);
    animation.jumpTo(animation.labels["jumpHere"], 0);

    // animation.playmode = ƒ.ANIMPLAYMODE.STOP;
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
    // if (time > 2000) debugger;
    // animation.update(time);
    let mutator: ƒ.Mutator = animation.getMutated(time);
    // console.log(node.getComponent(ƒ.ComponentMesh).getMutator());
    // console.log(mutator["components"]["ComponentMesh"][0]["ƒ.ComponentMesh"]);
    // node.getComponent(ƒ.ComponentMesh).mutate(<ƒ.Mutator>(mutator["components"]["ComponentMesh"][0]["ƒ.ComponentMesh"]));
    node.applyAnimation(mutator);

    // mesh.mutate(animation.animatedObject);
    // console.clear();
    // console.log(time % 4000, animation.animatedObject["pivot"]["rotation"]["x"]);
    Scenes.viewPort.draw();
    // window.requestAnimationFrame(frame);
  }

  function hndlEv(_e: Event): void {
    console.log("event!");
  }


}