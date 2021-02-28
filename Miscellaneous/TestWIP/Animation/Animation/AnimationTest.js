var AnimationTest;
(function (AnimationTest) {
    //TEST
    var ƒ = FudgeCore;
    window.addEventListener("DOMContentLoaded", init);
    let node;
    let cmpMesh;
    let animation;
    let startTime = Date.now();
    function init() {
        Scenes.createMiniScene();
        Scenes.createViewport();
        Scenes.viewport.draw();
        node = Scenes.node;
        cmpMesh = node.getComponent(ƒ.ComponentMesh);
        initAnim();
    }
    function initAnim() {
        let nS = node.serialize();
        console.log(cmpMesh.getMutator());
        console.log(ƒ.Serializer.stringify(nS));
        let animseq = new ƒ.AnimationSequence();
        animseq.addKey(new ƒ.AnimationKey(0, 0));
        animseq.addKey(new ƒ.AnimationKey(5000, 45));
        let animStructure = {
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
        animation = new ƒ.Animation("testAnimation", animStructure);
        console.log(animation);
        // animation.animationStructure["components"]["ComponentMesh"][0]["ƒ.ComponentMesh"]["pivot"]["rotation"]["y"] = animseq;
        // console.log(animation.getMutated(2));
        // window.requestAnimationFrame(frame);
        // window.setInterval(frame, 500);
        ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, frame);
        ƒ.Loop.start();
    }
    function frame() {
        // console.log(Date.now() - startTime);
        // let mutator: ƒ.MutatorForAnimation = mesh.getMutatorForAnimation();
        // mutator.pivot["rotation"].x++;
        let time = Date.now() - startTime;
        // if (time > 2000) debugger;
        // animation.update(time);
        time = time % animation.totalTime;
        let mutator = animation.getMutated(time, 1, ƒ.ANIMATION_PLAYBACK.TIMEBASED_CONTINOUS);
        // console.log(node.getComponent(ƒ.ComponentMesh).getMutator());
        // console.log(mutator["components"]["ComponentMesh"][0]["ƒ.ComponentMesh"]);
        // node.getComponent(ƒ.ComponentMesh).mutate(<ƒ.Mutator>(mutator["components"]["ComponentMesh"][0]["ƒ.ComponentMesh"]));
        node.applyAnimation(mutator);
        Scenes.viewport.draw();
    }
    function hndlEv(_e) {
        console.log("event!");
    }
})(AnimationTest || (AnimationTest = {}));
//# sourceMappingURL=AnimationTest.js.map