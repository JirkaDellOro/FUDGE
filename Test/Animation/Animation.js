var AnimationTest;
(function (AnimationTest) {
    var ƒ = Fudge;
    window.addEventListener("DOMContentLoaded", init);
    let node;
    let cmpMesh;
    let animation;
    let startTime = Date.now();
    function init() {
        Scenes.createMiniScene();
        Scenes.createViewport();
        Scenes.viewPort.draw();
        node = Scenes.node;
        cmpMesh = node.getComponent(ƒ.ComponentMesh);
        initAnim();
    }
    function initAnim() {
        let nS = node.serialize();
        console.log(cmpMesh.getMutator());
        // console.log(ƒ.Serializer.stringify(nS));
        let animseq = new ƒ.AnimationSequence();
        animseq.addKey(new ƒ.AnimationKey(0, 0));
        animseq.addKey(new ƒ.AnimationKey(5000, 90));
        let animStructure = {
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
    function initAnimOld() {
        let mutator = cmpMesh.getMutatorForAnimation();
        animation = new ƒ.Animation(mutator);
        let animseq = {
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
    function frame() {
        // console.log(Date.now() - startTime);
        // let mutator: ƒ.MutatorForAnimation = mesh.getMutatorForAnimation();
        // mutator.pivot["rotation"].x++;
        let time = Date.now() - startTime;
        // if (time > 2000) debugger;
        // animation.update(time);
        let mutator = animation.getMutated(time);
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
    function hndlEv(_e) {
        console.log("event!");
    }
})(AnimationTest || (AnimationTest = {}));
//# sourceMappingURL=Animation.js.map